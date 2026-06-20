-- =============================================================================
-- Migration: 20260620170000_b9_region_summary  ⚠️ REVIEW GEREKLİ — DRAFT, NOT APPLIED
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     B9 — Bölgeler (region directory, derived from portfolios)
--
-- WHAT THIS DOES
--   * SECURITY DEFINER function public.get_region_summary() → jsonb[] of
--     { city, district, active_count }. No new table — it just AGGREGATES the
--     active portfolios by city/district. Verified caller only.
--
-- ====================== WHY THIS IS SAFE (D13) ===============================
-- (1) OUTPUT IS A COUNT + REGION NAME ONLY. The function selects only p.city,
--     p.district and count(*). It NEVER reads exact_address / exact_lat / exact_lng
--     / malik_info / private_* / documents / locked images. Nothing identifying a
--     specific property is returned — just "how many active portfolios per district".
-- (2) Gated by public.is_verified(): an unverified/anon caller gets an empty array
--     (the predicate short-circuits every row). anon has NO execute grant.
-- (3) security definer + `set search_path = public, pg_temp` (pinned). EXECUTE
--     granted to authenticated only; revoked from public + anon.
--
-- APPLY: human `supabase db push`, then regen TS types (the RPC appears under
--   Database['public']['Functions']). Only AFTER that, replace the stub in
--   src/lib/data/regions.ts with supabase.rpc('get_region_summary'), wire the
--   Lovable region-card + dashboard.regions pages, and flip featureFlags.regions.
-- =============================================================================

create or replace function public.get_region_summary()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  -- Group per region in a subquery and EXPOSE district + active_count as columns,
  -- so the outer jsonb_agg ORDER BY can reference them (the original scope error).
  -- The outer query has no GROUP BY → jsonb_agg folds all region rows into ONE array.
  select coalesce(
    jsonb_agg(t.row order by t.active_count desc, t.district nulls last),
    '[]'::jsonb
  )
  from (
    select
      p.district          as district,
      count(*)::int       as active_count,
      jsonb_build_object(
        'city',         p.city,
        'district',     p.district,
        'active_count', count(*)::int
      ) as row
    from public.portfolios p
    where public.is_verified()
      and p.status = 'active'::public.portfolio_status
      and p.district is not null
    group by p.city, p.district
  ) t;
$$;

comment on function public.get_region_summary() is
  'B9 Bölgeler: active-portfolio counts grouped by city/district. Verified-only. No D13 field — region name + count only.';

revoke execute on function public.get_region_summary() from public, anon;
grant  execute on function public.get_region_summary() to authenticated;
