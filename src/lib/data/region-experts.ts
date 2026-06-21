// Bölge Uzmanı önerisi data layer — SKELETON. The get_region_experts RPC is drafted
// but NOT yet applied (supabase/migrations/20260621130000_region_experts_DRAFT.sql), so
// the generated Database types do not contain it. To avoid a type-unsafe cast, the fetch
// is a stub returning [] for now. featureFlags.regionExperts stays OFF.
//
// AFTER Ege pushes the migration + regenerates types, replace the stub body with:
//   const { data, error } = await supabase.rpc("get_region_experts", {
//     _city: city, _district: district ?? undefined, _exclude_owner: excludeOwner ?? undefined,
//   });
//   if (error) throw error;
//   return (data as unknown as RegionExpert[]) ?? [];
// The RPC returns the PUBLIC profile allow-list + region_active_count + score; never any
// contact/locked field.

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

/**
 * Top experts for a region. STUB until get_region_experts RPC is pushed + types
 * regenerated (then a typed supabase.rpc call — see header). Returns [] for now; the
 * "Bu Bölgenin Uzmanları" sections stay behind featureFlags.regionExperts (OFF).
 */
export async function getRegionExperts(
  _city: string,
  _district?: string | null,
  _excludeOwner?: string | null,
): Promise<RegionExpert[]> {
  // TODO(region-experts): wire to supabase.rpc("get_region_experts", …) post-push.
  return [];
}
