import { supabase } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/database.types";
import {
  splitAttributes,
  assertNoLockedInPublic,
  type AttributesInput,
} from "@/lib/portfolio-attributes";
import { processPortfolioImage } from "@/lib/image-resize";

// ---------------------------------------------------------------------------
// Portfolio data access (M2). Typed CRUD. NO business logic in components.
//
// D13 SAFETY: the `portfolios` table is TEASER-ONLY by design — it contains NO
// locked columns (those live in portfolio_private / portfolio_documents). So any
// `select` on `portfolios` (incl. "*") is teaser-safe and CANNOT leak the locked
// set. Locked data is fetched ONLY by getMyPortfolioFull (owner path), via the
// separate tables whose RLS is owner/grant-gated. Teaser/list paths NEVER select
// from or join portfolio_private/portfolio_documents.
// ---------------------------------------------------------------------------

export type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"];
export type PortfolioImage = Database["public"]["Tables"]["portfolio_images"]["Row"];
export type PortfolioPrivate = Database["public"]["Tables"]["portfolio_private"]["Row"];
export type PortfolioDocument = Database["public"]["Tables"]["portfolio_documents"]["Row"];

export type PortfolioStatus = Database["public"]["Enums"]["portfolio_status"];
export type PortfolioCategory = Database["public"]["Enums"]["portfolio_category"];
export type TransactionType = Database["public"]["Enums"]["transaction_type"];
export type Currency = Database["public"]["Enums"]["currency"];
export type PortfolioMode = Database["public"]["Enums"]["portfolio_mode"];

const IMAGES_BUCKET = "portfolio-images";
const IMAGES_LOCKED_BUCKET = "portfolio-images-locked";
const DOCS_BUCKET = "portfolio-documents";
const SIGNED_URL_TTL = 3600; // 1h short-lived signed URLs for locked media (D34/D20)

export type ImageVisibility = Database["public"]["Enums"]["image_visibility"];
export type DocumentKind = Database["public"]["Enums"]["document_kind"];

/** A picked-but-not-yet-uploaded image with its chosen visibility (create wizard). */
export type PendingImage = { file: File; visibility: ImageVisibility; isCover?: boolean };

function imageBucket(visibility: ImageVisibility) {
  return visibility === "locked" ? IMAGES_LOCKED_BUCKET : IMAGES_BUCKET;
}

/** Teaser fields a wizard/edit form collects (no exact location / locked set). */
export type PortfolioTeaserInput = {
  title: string;
  public_description?: string | null;
  price?: number | null;
  currency?: Currency;
  transaction_type: TransactionType;
  category: PortfolioCategory;
  subcategory?: string | null;
  room_count?: string | null;
  gross_m2?: number | null;
  net_m2?: number | null;
  land_m2?: number | null;
  features?: string[];
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  status?: PortfolioStatus;
  mode?: PortfolioMode; // D36 controlled|call_only (public teaser column)
};

/** Locked fields (D20) — collected on an owner-only step; go to portfolio_private. */
export type PortfolioPrivateInput = {
  exact_address?: string | null;
  exact_lat?: number | null;
  exact_lng?: number | null;
  malik_info?: Json | null;
  private_description?: string | null;
  private_notes?: string | null;
};

/** Owner public summary for Keşfet cards (RLS-safe: verified-network profiles). */
export type NetworkAgent = {
  username: string;
  full_name: string;
  avatar_url: string | null;
  company_name: string | null;
};

export type PortfolioWithCover = Portfolio & {
  cover_url: string | null; // thumb (small) — cards/lists
  cover_url_full: string | null; // display — onError fallback for legacy (pre-thumb) images
  agent?: NetworkAgent | null; // populated by listNetworkPortfolios (Keşfet); undefined elsewhere
};

export type PortfolioFull = {
  portfolio: Portfolio;
  private: PortfolioPrivate | null;
  images: (PortfolioImage & { url: string; thumbUrl: string })[];
  documents: PortfolioDocument[];
};

/** Derive the thumb path from a display path: `<uuid>.webp` → `<uuid>_thumb.webp`. */
export function deriveThumbPath(path: string): string {
  return path.replace(/(\.[^./]+)$/, "_thumb$1");
}

/** Public URL for a teaser image path (portfolio-images is a public bucket). */
export function portfolioImageUrl(path: string): string {
  return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Public URL for the THUMB of a teaser image path (cards/lists). */
export function portfolioThumbUrl(path: string): string {
  return portfolioImageUrl(deriveThumbPath(path));
}

const privateHasData = (p: PortfolioPrivateInput) =>
  Object.values(p).some((v) => v !== undefined && v !== null && v !== "");

/** Owner's PUBLIC profile (D8) — agent card + call_only "ara" CTA for other agents. */
export type OwnerContact = {
  full_name: string;
  username: string;
  avatar_url: string | null;
  title: string | null;
  company_name: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  expertise_regions: string[];
  expertise_types: string[];
};

export async function getOwnerContact(ownerId: string): Promise<OwnerContact | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "full_name, username, avatar_url, title, company_name, contact_phone, contact_whatsapp, expertise_regions, expertise_types",
    )
    .eq("id", ownerId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * "Portföylerim" — the signed-in agent's own portfolios (ANY status), newest
 * first, each with its cover image URL. Teaser columns only (D13-safe).
 */
export async function listMyPortfolios(ownerId: string): Promise<PortfolioWithCover[]> {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*, portfolio_images(path, is_cover, sort_order, visibility)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const images = (row.portfolio_images ?? []) as Pick<
      PortfolioImage,
      "path" | "is_cover" | "sort_order" | "visibility"
    >[];
    // Cover is always a PUBLIC image (locked photos never surface on the teaser).
    const publicImages = images.filter((i) => i.visibility === "public");
    const cover =
      publicImages.find((i) => i.is_cover) ??
      [...publicImages].sort((a, b) => a.sort_order - b.sort_order)[0];
    // strip the joined relation off the teaser row
    const { portfolio_images: _drop, ...portfolio } = row as typeof row & {
      portfolio_images: unknown;
    };
    void _drop;
    return {
      ...(portfolio as Portfolio),
      cover_url: cover ? portfolioThumbUrl(cover.path) : null,
      cover_url_full: cover ? portfolioImageUrl(cover.path) : null,
    };
  });
}

/**
 * Owner-full view of one portfolio: teaser + locked private row + images +
 * documents. RLS only returns the private/documents rows to the owner (M2) or
 * a grant-holder (M3). Used by the owner detail + edit pages.
 */
export async function getMyPortfolioFull(id: string): Promise<PortfolioFull | null> {
  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!portfolio) return null;

  const [priv, imgs, docs] = await Promise.all([
    supabase.from("portfolio_private").select("*").eq("portfolio_id", id).maybeSingle(),
    supabase
      .from("portfolio_images")
      .select("*")
      .eq("portfolio_id", id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("portfolio_documents")
      .select("*")
      .eq("portfolio_id", id)
      .order("uploaded_at", { ascending: true }),
  ]);

  // Resolve display + thumb URLs. Public → local public URLs (no network). Locked
  // → ONE batched createSignedUrls call (signs every locked display + thumb path
  // at once) instead of one round-trip per image.
  const rows = imgs.data ?? [];
  const lockedPaths = rows
    .filter((i) => i.visibility === "locked")
    .flatMap((i) => [i.path, deriveThumbPath(i.path)]);
  const signed = new Map<string, string>();
  if (lockedPaths.length) {
    const { data: urls } = await supabase.storage
      .from(IMAGES_LOCKED_BUCKET)
      .createSignedUrls(lockedPaths, SIGNED_URL_TTL);
    for (const u of urls ?? []) if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
  }
  const images = rows.map((i) => {
    if (i.visibility === "locked") {
      const url = signed.get(i.path) ?? "";
      // legacy locked images have no thumb → fall back to the display signed URL
      return { ...i, url, thumbUrl: signed.get(deriveThumbPath(i.path)) ?? url };
    }
    return { ...i, url: portfolioImageUrl(i.path), thumbUrl: portfolioThumbUrl(i.path) };
  });

  return {
    portfolio,
    private: priv.data ?? null,
    images,
    documents: docs.data ?? [],
  };
}

/** Keşfet filters (Slice 5). All optional; combined with AND (q is a text OR). */
export type NetworkFilters = {
  q?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  transaction_type?: TransactionType | null;
  category?: PortfolioCategory | null;
  priceMin?: number | null;
  priceMax?: number | null;
  room_count?: string;
  /** Match any of these room counts (e.g. ["5+1","6+1"] for a "5+ Oda" quick chip). */
  roomCounts?: string[];
  mode?: PortfolioMode | null;
  feature?: string;
};

export type NetworkResult = { items: PortfolioWithCover[]; total: number };

const coverUrlsFromJoin = (
  images: Pick<PortfolioImage, "path" | "is_cover" | "sort_order" | "visibility">[],
): { cover_url: string | null; cover_url_full: string | null } => {
  const pub = images.filter((i) => i.visibility === "public");
  const cover =
    pub.find((i) => i.is_cover) ?? [...pub].sort((a, b) => a.sort_order - b.sort_order)[0];
  return {
    cover_url: cover ? portfolioThumbUrl(cover.path) : null,
    cover_url_full: cover ? portfolioImageUrl(cover.path) : null,
  };
};

/**
 * Keşfet (Slice 5): other agents' ACTIVE portfolios as TEASER, server-side
 * filtered + paginated. RLS (`portfolios_select_network`) already restricts to
 * active + verified viewer; we additionally exclude the viewer's own. Teaser
 * columns only (D13-safe) + public cover.
 */
export async function listNetworkPortfolios(
  viewerId: string,
  filters: NetworkFilters,
  page: number,
  pageSize = 12,
): Promise<NetworkResult> {
  let query = supabase
    .from("portfolios")
    // estimated: exact for small tables, planner estimate at scale (cheap COUNT).
    // owner embed in the SAME query (no N+1) — verified-network profiles, RLS-safe.
    .select(
      "*, portfolio_images(path, is_cover, sort_order, visibility), owner:profiles!portfolios_owner_id_fkey(username, full_name, avatar_url, company_name)",
      { count: "estimated" },
    )
    .eq("status", "active")
    .neq("owner_id", viewerId);

  // Structured region filters use EXACT canonical match (RegionSelect values) so the
  // Keşfet count and the region-summary count stay consistent (no ilike drift).
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.district) query = query.eq("district", filters.district);
  if (filters.neighborhood) query = query.eq("neighborhood", filters.neighborhood);
  if (filters.transaction_type) query = query.eq("transaction_type", filters.transaction_type);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.mode) query = query.eq("mode", filters.mode);
  if (filters.feature) query = query.contains("features", [filters.feature]);
  if (filters.priceMin != null) query = query.gte("price", filters.priceMin);
  if (filters.priceMax != null) query = query.lte("price", filters.priceMax);
  if (filters.room_count) query = query.eq("room_count", filters.room_count);
  if (filters.roomCounts?.length) query = query.in("room_count", filters.roomCounts);
  if (filters.q) {
    // sanitize for the PostgREST or() filter grammar
    const safe = filters.q.replace(/[,()*%]/g, " ").trim();
    if (safe)
      query = query.or(
        `title.ilike.%${safe}%,city.ilike.%${safe}%,district.ilike.%${safe}%,neighborhood.ilike.%${safe}%`,
      );
  }

  const from = page * pageSize;
  query = query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const items: PortfolioWithCover[] = (data ?? []).map((row) => {
    const images = (row.portfolio_images ?? []) as Pick<
      PortfolioImage,
      "path" | "is_cover" | "sort_order" | "visibility"
    >[];
    const {
      portfolio_images: _drop,
      owner: _owner,
      ...portfolio
    } = row as typeof row & { portfolio_images: unknown; owner: unknown };
    void _drop;
    const agent = (_owner ?? null) as NetworkAgent | null;
    return { ...(portfolio as Portfolio), ...coverUrlsFromJoin(images), agent };
  });

  return { items, total: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Writes (owner-only via RLS; insert requires is_verified)
// ---------------------------------------------------------------------------

/**
 * Create a portfolio: inserts the teaser row (slug auto-filled by the DB
 * trigger), uploads any images to portfolio-images/<id>/<uuid>.<ext> and rows
 * them, then writes the locked portfolio_private row (which fires the approx-pin
 * trigger). Returns { id, slug }.
 */
export async function createPortfolio(
  ownerId: string,
  teaser: PortfolioTeaserInput,
  priv: PortfolioPrivateInput = {},
  images: PendingImage[] = [],
  attributes: AttributesInput = {},
): Promise<{ id: string; slug: string; images: UploadResult }> {
  // D33: split attributes by the registry; the guard hard-fails if any locked
  // key reaches the public bag (which would leak via the teaser table).
  const { publicAttrs, lockedAttrs } = splitAttributes(attributes);
  assertNoLockedInPublic(publicAttrs);

  // slug:"" → the BEFORE INSERT trigger derives it from title (runs before the
  // NOT NULL/unique check). approx_lat/lng omitted → set by the private trigger.
  const { data: created, error } = await supabase
    .from("portfolios")
    // slug & ref_no are filled by BEFORE INSERT triggers; "" satisfies the typed
    // Insert (both NOT NULL, no column default) and trips the trigger's empty check.
    .insert({ owner_id: ownerId, slug: "", ref_no: "", ...teaser, attributes: publicAttrs as Json })
    .select("id, slug")
    .single();
  if (error) throw error;

  // Locked attrs / private row FIRST (cheap, must not be lost), THEN images. Image upload
  // never throws per-image — the portfolio is always kept; failures are reported back so
  // the UI tells the user to re-add them from Düzenle (no rollback, no data loss).
  const hasLockedAttrs = Object.keys(lockedAttrs).length > 0;
  if (privateHasData(priv) || hasLockedAttrs) {
    const { error: pErr } = await supabase
      .from("portfolio_private")
      .insert({ portfolio_id: created.id, ...priv, attributes: lockedAttrs as Json });
    if (pErr) throw pErr;
  }

  const imageResult = await uploadPendingImages(created.id, images);
  return { ...created, images: imageResult };
}

/** Update teaser columns + public attributes, and upsert the locked private row. */
export async function updatePortfolio(
  id: string,
  teaser: Partial<PortfolioTeaserInput>,
  priv?: PortfolioPrivateInput,
  attributes: AttributesInput = {},
): Promise<void> {
  const { publicAttrs, lockedAttrs } = splitAttributes(attributes);
  assertNoLockedInPublic(publicAttrs);

  const { error } = await supabase
    .from("portfolios")
    .update({ ...teaser, attributes: publicAttrs as Json })
    .eq("id", id);
  if (error) throw error;

  // Only touch portfolio_private when the caller actually manages it (edit form
  // always sends priv) — avoids wiping locked data on a teaser-only update.
  if (priv !== undefined || Object.keys(lockedAttrs).length > 0) {
    const { error: pErr } = await supabase
      .from("portfolio_private")
      .upsert(
        { portfolio_id: id, ...(priv ?? {}), attributes: lockedAttrs as Json },
        { onConflict: "portfolio_id" },
      );
    if (pErr) throw pErr;
  }
}

export async function setPortfolioStatus(id: string, status: PortfolioStatus): Promise<void> {
  const { error } = await supabase.from("portfolios").update({ status }).eq("id", id);
  if (error) throw error;
}

/** Delete a portfolio (images/private/documents cascade via FK). */
export async function deletePortfolio(id: string): Promise<void> {
  const { error } = await supabase.from("portfolios").delete().eq("id", id);
  if (error) throw error;
}

/** Upload images to portfolio-images/<portfolioId>/<uuid>.<ext> + row them. */
/**
 * Upload create-wizard PendingImages preserving the user's ORDER (sort_order =
 * array index), chosen COVER (the public image flagged isCover, else the first
 * public one), and per-image visibility (D34). Each image → display + thumb WebP.
 */
/** Outcome of an image batch: the portfolio is ALWAYS kept; failed photos are reported
 *  so the UI can tell the user to re-add them from Düzenle (no rollback, no data loss). */
export type UploadResult = {
  total: number;
  uploaded: number;
  failed: { name: string; reason: string }[];
};

const UPLOAD_CONCURRENCY = 3; // cap simultaneous decode+upload → no memory/network saturation

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt < tries - 1) await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
    }
  }
  throw lastErr;
}

/** Run an async task over items with a bounded number in flight (preserves throughput,
 *  avoids the all-at-once saturation that made uploads flaky on mobile/slow links). */
async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      await task(items[i], i);
    }
  });
  await Promise.all(workers);
}

/** Upload one image (display + thumb) + insert its row. Resize is not retried (a bad file
 *  won't get better); each storage upload + the row insert retry transient errors. */
async function uploadOneImage(
  portfolioId: string,
  file: File,
  visibility: ImageVisibility,
  sortOrder: number,
  isCover: boolean,
): Promise<void> {
  const { display, thumb } = await processPortfolioImage(file);
  const bucket = imageBucket(visibility);
  const path = `${portfolioId}/${crypto.randomUUID()}.webp`;
  const up = (p: string, blob: Blob) =>
    withRetry(async () => {
      const { error } = await supabase.storage.from(bucket).upload(p, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/webp",
      });
      if (error) throw error;
    });
  await up(path, display);
  await up(deriveThumbPath(path), thumb);
  await withRetry(async () => {
    const { error } = await supabase
      .from("portfolio_images")
      .insert({
        portfolio_id: portfolioId,
        path,
        sort_order: sortOrder,
        is_cover: isCover,
        visibility,
      });
    if (error) throw error;
  });
}

export async function uploadPendingImages(
  portfolioId: string,
  images: PendingImage[],
): Promise<UploadResult> {
  const result: UploadResult = { total: images.length, uploaded: 0, failed: [] };
  if (!images.length) return result;
  const firstPublic = images.findIndex((im) => im.visibility === "public");
  const chosen = images.findIndex((im) => im.visibility === "public" && im.isCover);
  const coverIdx = chosen >= 0 ? chosen : firstPublic;

  // Per-image isolation: one failure never sinks the others, and never throws.
  await mapWithConcurrency(images, UPLOAD_CONCURRENCY, async (im, i) => {
    try {
      await uploadOneImage(portfolioId, im.file, im.visibility, i, i === coverIdx);
      result.uploaded++;
    } catch (e) {
      result.failed.push({
        name: im.file.name,
        reason: e instanceof Error ? e.message : String(e),
      });
    }
  });
  return result;
}

export async function uploadImages(
  portfolioId: string,
  files: File[],
  visibility: ImageVisibility = "public",
): Promise<UploadResult> {
  const result: UploadResult = { total: files.length, uploaded: 0, failed: [] };
  if (!files.length) return result;
  // existing count → continue sort order / cover only if none yet
  const { count } = await supabase
    .from("portfolio_images")
    .select("id", { count: "exact", head: true })
    .eq("portfolio_id", portfolioId);
  const startIndex = count ?? 0;

  // Bounded concurrency + per-image retry + isolation (raw ~4MB file is never stored;
  // each image → display ≤1600px + thumb ≤400px WebP). One failure never sinks the rest.
  await mapWithConcurrency(files, UPLOAD_CONCURRENCY, async (file, i) => {
    try {
      await uploadOneImage(
        portfolioId,
        file,
        visibility,
        startIndex + i,
        visibility === "public" && startIndex + i === 0,
      );
      result.uploaded++;
    } catch (e) {
      result.failed.push({ name: file.name, reason: e instanceof Error ? e.message : String(e) });
    }
  });
  return result;
}

type ImageRef = Pick<PortfolioImage, "id" | "path" | "visibility">;

/** Delete one image: remove the storage object (correct bucket) + the row. */
export async function deletePortfolioImage(img: ImageRef): Promise<void> {
  // remove BOTH the display and the thumb object (thumb may be absent for legacy)
  await supabase.storage
    .from(imageBucket(img.visibility))
    .remove([img.path, deriveThumbPath(img.path)]);
  const { error } = await supabase.from("portfolio_images").delete().eq("id", img.id);
  if (error) throw error;
}

/** Set the cover (only a PUBLIC image may be the cover — it shows in the teaser). */
export async function setCoverImage(portfolioId: string, imageId: string): Promise<void> {
  const e1 = await supabase
    .from("portfolio_images")
    .update({ is_cover: false })
    .eq("portfolio_id", portfolioId);
  if (e1.error) throw e1.error;
  const e2 = await supabase.from("portfolio_images").update({ is_cover: true }).eq("id", imageId);
  if (e2.error) throw e2.error;
}

/** Persist a new ordering (array of {id, sort_order}). */
export async function reorderImages(items: { id: string; sort_order: number }[]): Promise<void> {
  for (const it of items) {
    const { error } = await supabase
      .from("portfolio_images")
      .update({ sort_order: it.sort_order })
      .eq("id", it.id);
    if (error) throw error;
  }
}

/**
 * Toggle a photo's visibility (D34). Moves the bytes between the public and the
 * private bucket (fetch current URL → re-upload to target → delete source),
 * then updates the row. A locked photo can't be the cover (cleared).
 */
export async function setImageVisibility(img: ImageRef, target: ImageVisibility): Promise<void> {
  if (img.visibility === target) return;
  const fromBucket = imageBucket(img.visibility);
  const toBucket = imageBucket(target);

  // Move BOTH the display and the thumb object. download() works for public AND
  // private buckets; a legacy image with no thumb is skipped silently.
  for (const path of [img.path, deriveThumbPath(img.path)]) {
    const { data: blob, error: dErr } = await supabase.storage.from(fromBucket).download(path);
    if (dErr || !blob) continue;
    const { error: upErr } = await supabase.storage.from(toBucket).upload(path, blob, {
      cacheControl: "3600",
      upsert: true,
      contentType: blob.type || "image/webp",
    });
    if (upErr) throw upErr;
    await supabase.storage.from(fromBucket).remove([path]);
  }

  const { error: rowErr } = await supabase
    .from("portfolio_images")
    .update({ visibility: target, ...(target === "locked" ? { is_cover: false } : {}) })
    .eq("id", img.id);
  if (rowErr) throw rowErr;
}

// ---------------------------------------------------------------------------
// Documents (locked; private bucket + signed-URL download)
// ---------------------------------------------------------------------------

export async function uploadDocument(
  portfolioId: string,
  file: File,
  kind: DocumentKind = "diger",
): Promise<void> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "pdf";
  const path = `${portfolioId}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(DOCS_BUCKET).upload(path, file, {
    upsert: false,
  });
  if (upErr) throw upErr;
  const { error } = await supabase
    .from("portfolio_documents")
    .insert({ portfolio_id: portfolioId, path, kind });
  if (error) throw error;
}

/**
 * Short-lived signed URL for a locked document. RLS (has_portfolio_access) gates
 * minting: a non-owner/non-granted caller gets no URL (returns null) — we NEVER
 * fabricate a URL for someone without access.
 */
export async function documentSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(DOCS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function deletePortfolioDocument(doc: { id: string; path: string }): Promise<void> {
  await supabase.storage.from(DOCS_BUCKET).remove([doc.path]);
  const { error } = await supabase.from("portfolio_documents").delete().eq("id", doc.id);
  if (error) throw error;
}
