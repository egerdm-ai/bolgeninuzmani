// B9 Bölgeler data layer — SKELETON. The get_region_summary RPC is drafted but NOT
// yet applied (supabase/migrations/20260620170000_b9_region_summary_DRAFT.sql), so the
// generated Database types do not contain it. To avoid a type-unsafe cast, the fetch
// is a stub returning [] for now. featureFlags.regions stays OFF.
//
// AFTER Ege pushes the migration + regenerates types, replace the stub body with:
//   const { data, error } = await supabase.rpc("get_region_summary");
//   if (error) throw error;
//   return (data as unknown as RegionSummary[]) ?? [];
// The RPC returns only { city, district, active_count } — region name + count, never
// any D13 locked field.

/** Active-portfolio count per region (city/district). No locked data. */
export type RegionSummary = {
  city: string | null;
  district: string | null;
  active_count: number;
};

/**
 * Region directory summary. STUB until get_region_summary RPC is pushed + types
 * regenerated (then a typed supabase.rpc call — see header). Returns [] for now;
 * the regions pages stay behind featureFlags.regions (OFF).
 */
export async function getRegionSummary(): Promise<RegionSummary[]> {
  // TODO(B9): wire to supabase.rpc("get_region_summary") post-push.
  return [];
}
