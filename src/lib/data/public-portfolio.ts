import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// Public/customer teaser data (Slice 3). Reads go through anon-callable SECURITY
// DEFINER RPCs (get_public_portfolio / get_public_profile) — anon NEVER touches a
// base table (D13). The RPC returns a strict PUBLIC allow-list, so no locked field
// (exact_*, malik_info, private_*, locked attributes/images, documents) is reachable.
//
// The RPCs return jsonb, so the generated client types them as `Json`; we cast the
// validated payload to the typed shapes below (the RPC's column allow-list is the
// real contract). Migration applied; types regenerated.

const PUBLIC_IMAGES_BUCKET = "portfolio-images";

type Category = Database["public"]["Enums"]["portfolio_category"];
type Txn = Database["public"]["Enums"]["transaction_type"];
type Currency = Database["public"]["Enums"]["currency"];

export type PublicTeaserImage = { path: string; sort_order: number; is_cover: boolean };

export type PublicAgent = {
  username: string;
  full_name: string;
  title: string | null;
  company_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  expertise_regions: string[];
  expertise_types: string[];
};

export type PublicPortfolio = {
  id: string;
  slug: string;
  title: string;
  public_description: string | null;
  price: number | null;
  currency: Currency;
  transaction_type: Txn;
  category: Category;
  subcategory: string | null;
  room_count: string | null;
  gross_m2: number | null;
  net_m2: number | null;
  land_m2: number | null;
  features: string[];
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  approx_lat: number | null;
  approx_lng: number | null;
  created_at: string;
  attributes: Record<string, unknown>;
  images: PublicTeaserImage[];
  agent: PublicAgent | null;
};

export type PublicProfile = {
  username: string;
  full_name: string;
  title: string | null;
  company_name: string | null;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  expertise_regions: string[];
  expertise_types: string[];
  membership_tier: Database["public"]["Enums"]["membership_tier"];
};

/** A teaser card for an agent's active portfolio (public allow-list). */
export type PublicAgentPortfolioCard = {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: Currency;
  transaction_type: Txn;
  category: Category;
  subcategory: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  created_at: string;
  cover_path: string | null;
};

/** Public bucket URL for a teaser image path (anon-readable). */
export function publicTeaserImageUrl(path: string): string {
  return supabase.storage.from(PUBLIC_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Public bucket URL for the THUMB of a teaser image path (cards/gallery thumbs). */
export function publicTeaserThumbUrl(path: string): string {
  return publicTeaserImageUrl(path.replace(/(\.[^./]+)$/, "_thumb$1"));
}

/** Anon teaser for /p/$slug. Returns null if not found / not active. */
export async function getPublicPortfolio(slug: string): Promise<PublicPortfolio | null> {
  const { data, error } = await supabase.rpc("get_public_portfolio", { _slug: slug });
  if (error) throw error;
  return (data as unknown as PublicPortfolio | null) ?? null;
}

/** Anon public agent profile for /v/$username. Returns null if not verified. */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase.rpc("get_public_profile", { _username: username });
  if (error) throw error;
  return (data as unknown as PublicProfile | null) ?? null;
}

/** Anon: a verified agent's ACTIVE portfolios as teaser cards (empty if none). */
export async function getPublicAgentPortfolios(
  username: string,
): Promise<PublicAgentPortfolioCard[]> {
  const { data, error } = await supabase.rpc("get_public_agent_portfolios", {
    _username: username,
  });
  if (error) throw error;
  return (data as unknown as PublicAgentPortfolioCard[] | null) ?? [];
}
