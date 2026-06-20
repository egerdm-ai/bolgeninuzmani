import { supabase } from "@/lib/supabase/client";
import { portfolioImageUrl, portfolioThumbUrl } from "@/lib/data/portfolios";
import type { TeaserCardData } from "@/components/portfolio/teaser-card";

// B11 Kaydet. saved_portfolios is own-scoped (RLS: user_id = auth.uid()). No D13
// data — just (user_id, portfolio_id). Reading saved portfolios surfaces TEASER
// columns only (RLS on portfolios shows teaser to verified members; locked tables
// stay gated). cover = PUBLIC image only.

export async function savePortfolio(userId: string, portfolioId: string): Promise<void> {
  const { error } = await supabase
    .from("saved_portfolios")
    .insert({ user_id: userId, portfolio_id: portfolioId });
  if (error) throw error;
}

export async function unsavePortfolio(userId: string, portfolioId: string): Promise<void> {
  const { error } = await supabase
    .from("saved_portfolios")
    .delete()
    .eq("user_id", userId)
    .eq("portfolio_id", portfolioId);
  if (error) throw error;
}

export async function isSaved(userId: string, portfolioId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("saved_portfolios")
    .select("portfolio_id")
    .eq("user_id", userId)
    .eq("portfolio_id", portfolioId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** Ids of the user's saved portfolios (for toggling state across cards). */
export async function listSavedIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("saved_portfolios")
    .select("portfolio_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.portfolio_id);
}

/** Saved portfolios as TEASER cards (favorites page). Teaser-only, no locked fields. */
export async function listSavedPortfolios(userId: string): Promise<TeaserCardData[]> {
  const { data: saved, error } = await supabase
    .from("saved_portfolios")
    .select("portfolio_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const ids = (saved ?? []).map((r) => r.portfolio_id);
  if (ids.length === 0) return [];

  // Teaser columns only (RLS shows teaser to verified members).
  const { data: rows } = await supabase
    .from("portfolios")
    .select(
      "id, slug, title, price, currency, transaction_type, category, mode, ref_no, city, district, neighborhood, room_count, gross_m2, features, status",
    )
    .in("id", ids)
    .eq("status", "active");

  // PUBLIC cover image per portfolio (locked images are never selected).
  const { data: imgs } = await supabase
    .from("portfolio_images")
    .select("portfolio_id, path, is_cover, sort_order, visibility")
    .in("portfolio_id", ids)
    .eq("visibility", "public")
    .order("is_cover", { ascending: false })
    .order("sort_order", { ascending: true });
  const coverPath = new Map<string, string>();
  for (const im of imgs ?? [])
    if (!coverPath.has(im.portfolio_id)) coverPath.set(im.portfolio_id, im.path);

  const byId = new Map((rows ?? []).map((r) => [r.id, r]));
  // Preserve saved order (newest first).
  return ids
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map((r) => {
      const cp = coverPath.get(r.id) ?? null;
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        price: r.price,
        currency: r.currency,
        transaction_type: r.transaction_type,
        category: r.category,
        mode: r.mode,
        ref_no: r.ref_no,
        city: r.city,
        district: r.district,
        neighborhood: r.neighborhood,
        coverThumb: cp ? portfolioThumbUrl(cp) : null,
        coverFull: cp ? portfolioImageUrl(cp) : null,
        roomCount: r.room_count,
        grossM2: r.gross_m2,
        features: r.features,
      };
    });
}
