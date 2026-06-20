import { supabase } from "@/lib/supabase/client";

// B9 Bölgeler data layer. get_region_summary is a SECURITY DEFINER RPC (applied) that
// AGGREGATES active portfolios by city/district. It returns only the region name +
// count — never a D13 locked field. The RPC types as Json (jsonb), so we cast the
// validated payload to RegionSummary[] (the RPC's allow-list is the contract).

/** Active-portfolio count per region (city/district). No locked data. */
export type RegionSummary = {
  city: string | null;
  district: string | null;
  active_count: number;
};

/** Region directory summary (verified caller; RLS/definer-gated). */
export async function getRegionSummary(): Promise<RegionSummary[]> {
  const { data, error } = await supabase.rpc("get_region_summary");
  if (error) throw error;
  return (data as unknown as RegionSummary[] | null) ?? [];
}
