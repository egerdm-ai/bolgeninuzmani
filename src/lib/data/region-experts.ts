import { supabase } from "@/lib/supabase/client";

// Bölge Uzmanı önerisi data layer. get_region_experts is a SECURITY DEFINER RPC (applied)
// that returns verified agents expert in / active in a region, scored. Its output is the
// PUBLIC profile allow-list + region_active_count + score — never a contact/locked field.
// The RPC types as Json (jsonb), so we cast the validated payload to RegionExpert[] (the
// RPC's allow-list is the contract).

export type RegionExpert = {
  username: string;
  full_name: string;
  title: string | null;
  company_name: string | null;
  avatar_url: string | null;
  expertise_regions: string[];
  expertise_types: string[];
  region_active_count: number;
  score: number;
};

/** Top experts for a region (verified caller; PUBLIC profile allow-list + count). */
export async function getRegionExperts(
  city: string,
  district?: string | null,
  excludeOwner?: string | null,
): Promise<RegionExpert[]> {
  const { data, error } = await supabase.rpc("get_region_experts", {
    _city: city,
    _district: district ?? undefined,
    _exclude_owner: excludeOwner ?? undefined,
  });
  if (error) throw error;
  return (data as unknown as RegionExpert[] | null) ?? [];
}
