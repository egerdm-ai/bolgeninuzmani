-- =============================================================================
-- Migration: 20260621130000_region_experts  ⚠️ REVIEW GEREKLİ — DRAFT, NOT APPLIED
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     Bölge Uzmanı önerisi (get_region_experts)
--
-- WHAT THIS DOES
--   SECURITY DEFINER function public.get_region_experts(_city, _district,
--   _exclude_owner) → jsonb[] of verified agents who are EXPERTS in a region, scored.
--   Candidates = verified agents whose expertise_regions contain the district/city OR
--   who have an ACTIVE portfolio there. _exclude_owner is dropped (a portfolio/search
--   never recommends its own owner). Top 5 by score.
--
--   SCORE (weights, tie-break active count):
--     +10  district is in expertise_regions   (exact-area expert — strongest signal)
--     + 5  city     is in expertise_regions   (province-level expert)
--     + 1  per ACTIVE portfolio in the region (proven local activity)
--   So a declared district expert with a few listings outranks someone with only a
--   handful of listings; activity breaks ties.
--
-- ====================== WHY THIS IS SAFE (D8/D13) ===========================
-- (1) OUTPUT IS THE PUBLIC PROFILE ALLOW-LIST (same as get_public_profile): username,
--     full_name, title, company_name, avatar_url, expertise_regions/types + a derived
--     region_active_count + score. NO contact, NO locked/sensitive field, no portfolio
--     internals. Reading portfolios is COUNT-ONLY (no row data leaves).
-- (2) is_verified() gate: an unverified/anon caller gets [] (the predicate short-
--     circuits the candidate scan). anon has NO execute grant.
-- (3) security definer + `set search_path = public, pg_temp` (pinned). EXECUTE granted
--     to authenticated only; revoked from public + anon.
-- (4) Only verified agents are candidates (status='verified'); _exclude_owner removes
--     the requesting portfolio/search owner.
--
-- APPLY: human `supabase db push`, then regen TS types (the RPC appears under
--   Database['public']['Functions']). Only AFTER that, replace the stub in
--   src/lib/data/region-experts.ts with supabase.rpc('get_region_experts', …) and flip
--   featureFlags.regionExperts.
-- =============================================================================

create or replace function public.get_region_experts(
  _city          text,
  _district      text default null,
  _exclude_owner uuid default null
)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with region_counts as (
    select p.owner_id, count(*)::int as cnt
    from public.portfolios p
    where p.status = 'active'::public.portfolio_status
      and (_city is null or p.city = _city)
      and (_district is null or p.district = _district)
    group by p.owner_id
  ),
  ranked as (
    select
      pr.username, pr.full_name, pr.title, pr.company_name, pr.avatar_url,
      pr.expertise_regions, pr.expertise_types,
      coalesce(rc.cnt, 0) as region_active_count,
      ( (case when _district is not null and pr.expertise_regions @> array[_district] then 10 else 0 end)
      + (case when _city     is not null and pr.expertise_regions @> array[_city]     then  5 else 0 end)
      + coalesce(rc.cnt, 0) ) as score
    from public.profiles pr
    left join region_counts rc on rc.owner_id = pr.id
    where public.is_verified()
      and pr.status = 'verified'::public.profile_status
      and (_exclude_owner is null or pr.id <> _exclude_owner)
      and (
        (_district is not null and pr.expertise_regions @> array[_district])
        or (_city is not null and pr.expertise_regions @> array[_city])
        or coalesce(rc.cnt, 0) > 0
      )
    order by score desc, region_active_count desc
    limit 5
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'username',            r.username,
        'full_name',           r.full_name,
        'title',               r.title,
        'company_name',        r.company_name,
        'avatar_url',          r.avatar_url,
        'expertise_regions',   r.expertise_regions,
        'expertise_types',     r.expertise_types,
        'region_active_count', r.region_active_count,
        'score',               r.score
      )
      order by r.score desc, r.region_active_count desc
    ),
    '[]'::jsonb
  )
  from ranked r;
$$;

comment on function public.get_region_experts(text, text, uuid) is
  'Bölge Uzmanı önerisi: verified agents expert in/active in a region, scored (district+10, city+5, active+1). PUBLIC profile allow-list + count only; excludes _exclude_owner. Verified-only.';

revoke execute on function public.get_region_experts(text, text, uuid) from public, anon;
grant  execute on function public.get_region_experts(text, text, uuid) to authenticated;
