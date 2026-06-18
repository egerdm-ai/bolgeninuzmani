import { supabase } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/database.types";

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
    .select("*, portfolio_images(path, is_cover, sort_order)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const images = (row.portfolio_images ?? []) as Pick<
      PortfolioImage,
      "path" | "is_cover" | "sort_order"
    >[];
    const cover =
      images.find((i) => i.is_cover) ?? [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
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

  return {
    portfolio,
    private: priv.data ?? null,
    images: (imgs.data ?? []).map((i) => ({ ...i, url: portfolioImageUrl(i.path) })),
    documents: docs.data ?? [],
  };
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
  files: File[] = [],
): Promise<{ id: string; slug: string }> {
  // slug:"" → the BEFORE INSERT trigger derives it from title (runs before the
  // NOT NULL/unique check). approx_lat/lng omitted → set by the private trigger.
  const { data: created, error } = await supabase
    .from("portfolios")
    .insert({ owner_id: ownerId, slug: "", ...teaser })
    .select("id, slug")
    .single();
  if (error) throw error;

  await uploadImages(created.id, files);

  if (privateHasData(priv)) {
    const { error: pErr } = await supabase
      .from("portfolio_private")
      .insert({ portfolio_id: created.id, ...priv });
    if (pErr) throw pErr;
  }

  return created;
}

/** Update teaser columns and upsert the locked private row. */
export async function updatePortfolio(
  id: string,
  teaser: Partial<PortfolioTeaserInput>,
  priv?: PortfolioPrivateInput,
): Promise<void> {
  const { error } = await supabase.from("portfolios").update(teaser).eq("id", id);
  if (error) throw error;

  if (priv && privateHasData(priv)) {
    const { error: pErr } = await supabase
      .from("portfolio_private")
      .upsert({ portfolio_id: id, ...priv }, { onConflict: "portfolio_id" });
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
export async function uploadImages(portfolioId: string, files: File[]): Promise<void> {
  if (!files.length) return;
  // existing count → continue sort order / cover only if none yet
  const { count } = await supabase
    .from("portfolio_images")
    .select("id", { count: "exact", head: true })
    .eq("portfolio_id", portfolioId);
  const startIndex = count ?? 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const path = `${portfolioId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(IMAGES_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) throw upErr;
    const { error: rowErr } = await supabase.from("portfolio_images").insert({
      portfolio_id: portfolioId,
      path,
      sort_order: startIndex + i,
      is_cover: startIndex + i === 0,
    });
    if (rowErr) throw rowErr;
  }
}
