import { supabase } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/database.types";
import {
  splitAttributes,
  assertNoLockedInPublic,
  type AttributesInput,
} from "@/lib/portfolio-attributes";

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

const IMAGES_BUCKET = "portfolio-images";
const IMAGES_LOCKED_BUCKET = "portfolio-images-locked";
const DOCS_BUCKET = "portfolio-documents";
const SIGNED_URL_TTL = 3600; // 1h short-lived signed URLs for locked media (D34/D20)

export type ImageVisibility = Database["public"]["Enums"]["image_visibility"];
export type DocumentKind = Database["public"]["Enums"]["document_kind"];

/** A picked-but-not-yet-uploaded image with its chosen visibility (create wizard). */
export type PendingImage = { file: File; visibility: ImageVisibility };

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

export type PortfolioWithCover = Portfolio & { cover_url: string | null };

export type PortfolioFull = {
  portfolio: Portfolio;
  private: PortfolioPrivate | null;
  images: (PortfolioImage & { url: string })[];
  documents: PortfolioDocument[];
};

/** Public URL for a teaser image path (portfolio-images is a public bucket). */
export function portfolioImageUrl(path: string): string {
  return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

const privateHasData = (p: PortfolioPrivateInput) =>
  Object.values(p).some((v) => v !== undefined && v !== null && v !== "");

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
      cover_url: cover ? portfolioImageUrl(cover.path) : null,
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

  // Locked images live in the PRIVATE bucket → short-lived signed URL (owner via
  // has_portfolio_access RLS). Public images → public URL.
  const images = await Promise.all(
    (imgs.data ?? []).map(async (i) => ({ ...i, url: await imageUrlFor(i) })),
  );

  return {
    portfolio,
    private: priv.data ?? null,
    images,
    documents: docs.data ?? [],
  };
}

/** Resolve a viewable URL for an image row honoring its visibility. */
async function imageUrlFor(img: Pick<PortfolioImage, "path" | "visibility">): Promise<string> {
  if (img.visibility === "locked") {
    const { data } = await supabase.storage
      .from(IMAGES_LOCKED_BUCKET)
      .createSignedUrl(img.path, SIGNED_URL_TTL);
    return data?.signedUrl ?? "";
  }
  return portfolioImageUrl(img.path);
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
): Promise<{ id: string; slug: string }> {
  // D33: split attributes by the registry; the guard hard-fails if any locked
  // key reaches the public bag (which would leak via the teaser table).
  const { publicAttrs, lockedAttrs } = splitAttributes(attributes);
  assertNoLockedInPublic(publicAttrs);

  // slug:"" → the BEFORE INSERT trigger derives it from title (runs before the
  // NOT NULL/unique check). approx_lat/lng omitted → set by the private trigger.
  const { data: created, error } = await supabase
    .from("portfolios")
    .insert({ owner_id: ownerId, slug: "", ...teaser, attributes: publicAttrs as Json })
    .select("id, slug")
    .single();
  if (error) throw error;

  // Upload public first (so the first public image becomes the cover), then
  // locked → the correct bucket. Each group uploads its files in parallel.
  const publicFiles = images.filter((i) => i.visibility === "public").map((i) => i.file);
  const lockedFiles = images.filter((i) => i.visibility === "locked").map((i) => i.file);
  await uploadImages(created.id, publicFiles, "public");
  await uploadImages(created.id, lockedFiles, "locked");

  const hasLockedAttrs = Object.keys(lockedAttrs).length > 0;
  if (privateHasData(priv) || hasLockedAttrs) {
    const { error: pErr } = await supabase
      .from("portfolio_private")
      .insert({ portfolio_id: created.id, ...priv, attributes: lockedAttrs as Json });
    if (pErr) throw pErr;
  }

  return created;
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
export async function uploadImages(
  portfolioId: string,
  files: File[],
  visibility: ImageVisibility = "public",
): Promise<void> {
  if (!files.length) return;
  // existing count → continue sort order / cover only if none yet
  const { count } = await supabase
    .from("portfolio_images")
    .select("id", { count: "exact", head: true })
    .eq("portfolio_id", portfolioId);
  const startIndex = count ?? 0;
  const bucket = imageBucket(visibility);

  // Upload all files in parallel (independent work) so many images don't feel slow.
  await Promise.all(
    files.map(async (file, i) => {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const path = `${portfolioId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { error: rowErr } = await supabase.from("portfolio_images").insert({
        portfolio_id: portfolioId,
        path,
        sort_order: startIndex + i,
        is_cover: visibility === "public" && startIndex + i === 0,
        visibility,
      });
      if (rowErr) throw rowErr;
    }),
  );
}

type ImageRef = Pick<PortfolioImage, "id" | "path" | "visibility">;

/** Delete one image: remove the storage object (correct bucket) + the row. */
export async function deletePortfolioImage(img: ImageRef): Promise<void> {
  await supabase.storage.from(imageBucket(img.visibility)).remove([img.path]);
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
export async function setImageVisibility(
  img: ImageRef & { url: string },
  target: ImageVisibility,
): Promise<void> {
  if (img.visibility === target) return;
  const fromBucket = imageBucket(img.visibility);
  const toBucket = imageBucket(target);

  const res = await fetch(img.url);
  if (!res.ok) throw new Error("Görsel taşınamadı (kaynak okunamadı)");
  const blob = await res.blob();

  const { error: upErr } = await supabase.storage.from(toBucket).upload(img.path, blob, {
    cacheControl: "3600",
    upsert: true,
    contentType: blob.type || "image/jpeg",
  });
  if (upErr) throw upErr;

  const { error: rowErr } = await supabase
    .from("portfolio_images")
    .update({ visibility: target, ...(target === "locked" ? { is_cover: false } : {}) })
    .eq("id", img.id);
  if (rowErr) throw rowErr;

  await supabase.storage.from(fromBucket).remove([img.path]);
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
