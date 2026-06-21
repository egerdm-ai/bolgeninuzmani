import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// Professionals directory. Verified members may read verified profiles directly
// (profiles_select_network RLS, D27) — NO new RPC/migration needed. We select ONLY
// the public profile allow-list (same fields as get_public_profile; no contact/locked
// data) + derive each agent's ACTIVE portfolio count from portfolios (network-readable
// active teasers). Teaser-only.

export type ProfessionalListItem = {
  username: string;
  full_name: string;
  title: string | null;
  company_name: string | null;
  avatar_url: string | null;
  location: string | null;
  membership_tier: Database["public"]["Enums"]["membership_tier"];
  expertise_regions: string[];
  expertise_types: string[];
  active_portfolios: number;
};

export async function listProfessionals(): Promise<ProfessionalListItem[]> {
  const { data: profs, error } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, title, company_name, avatar_url, location, membership_tier, expertise_regions, expertise_types",
    )
    .eq("status", "verified")
    .order("full_name", { ascending: true });
  if (error) throw error;

  // Active-portfolio count per owner (network-readable active teasers).
  const { data: ports } = await supabase
    .from("portfolios")
    .select("owner_id")
    .eq("status", "active");
  const counts = new Map<string, number>();
  for (const p of ports ?? []) counts.set(p.owner_id, (counts.get(p.owner_id) ?? 0) + 1);

  return (profs ?? []).map((p) => ({
    username: p.username,
    full_name: p.full_name,
    title: p.title,
    company_name: p.company_name,
    avatar_url: p.avatar_url,
    location: p.location,
    membership_tier: p.membership_tier,
    expertise_regions: p.expertise_regions,
    expertise_types: p.expertise_types,
    active_portfolios: counts.get(p.id) ?? 0,
  }));
}
