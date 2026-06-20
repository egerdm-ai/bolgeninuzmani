-- =============================================================================
-- Migration: 20260620120000_b8_match_search  ⚠️ REVIEW GEREKLİ — DRAFT, NOT APPLIED
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     B8 — Eşleşme (Arayış ↔ Portföy matching)
--
-- WHAT THIS DOES
--   * SECURITY DEFINER function public.match_search(_search_id uuid) → jsonb[].
--     Given a search, returns the ACTIVE network portfolios that satisfy its
--     criteria (transaction_type + category + budget range + region + rooms), each
--     as a TEASER card (the SAME public allow-list as get_public_agent_portfolios)
--     plus the owner agent mini + a small `score` (how many optional criteria hit).
--
-- ====================== WHY THIS IS SAFE (D13) ===============================
-- (1) TEASER-ONLY OUTPUT. The jsonb card lists an explicit PUBLIC allow-list:
--     id, slug, title, price, currency, transaction_type, category, subcategory,
--     city, district, neighborhood, approx_lat, approx_lng, mode, ref_no, created_at,
--     cover_path (PUBLIC image only) + agent{username,full_name,avatar_url}. It NEVER
--     selects exact_address / exact_lat / exact_lng / malik_info / private_* /
--     portfolio_private / portfolio_documents / locked images. Matching itself only
--     reads teaser columns on public.portfolios — no locked table is touched.
-- (2) AUTHORIZATION inside the body: the caller must be is_verified(); the search
--     must be readable by the caller (their OWN search, OR an ACTIVE network search).
--     This mirrors the searches RLS (B7) so the definer adds no new visibility.
-- (3) security definer + `set search_path = public, pg_temp` (pinned). EXECUTE is
--     granted to authenticated only; REVOKEd from public + anon (no anon matching).
-- (4) Own portfolios are excluded (owner_id <> caller): a buyer-search wants OTHER
--     agents' portfolios. Budget uses flexible nulls; region/room are optional.
--
-- APPLY: a human runs `supabase db push`, then regenerate TS types (the new RPC
--   appears under Database['public']['Functions']). Only AFTER that, replace the
--   stub in src/lib/data/matches.ts with supabase.rpc('match_search', …), wire the
--   Lovable matches page, and flip featureFlags.matches. See RETURN_CHECKLIST.md.
-- =============================================================================

create or replace function public.match_search(_search_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with s as (
    select *
    from public.searches
    where id = _search_id
      -- caller must be verified AND allowed to see this search (own or active).
      and public.is_verified()
      and (owner_id = (select auth.uid()) or status = 'active'::public.search_status)
  )
  select coalesce(jsonb_agg(card order by score desc, created_at desc), '[]'::jsonb)
  from (
    select
      p.created_at as created_at,
      -- score = how many OPTIONAL criteria the portfolio additionally satisfies.
      ( (case when s.city         is not null and p.city         = s.city         then 1 else 0 end)
      + (case when s.district     is not null and p.district     = s.district     then 1 else 0 end)
      + (case when s.neighborhood is not null and p.neighborhood = s.neighborhood then 1 else 0 end)
      + (case when s.room_count   is not null and p.room_count   = s.room_count   then 1 else 0 end)
      ) as score,
      jsonb_build_object(
        'id',               p.id,
        'slug',             p.slug,
        'title',            p.title,
        'price',            p.price,
        'currency',         p.currency,
        'transaction_type', p.transaction_type,
        'category',         p.category,
        'subcategory',      p.subcategory,
        'city',             p.city,
        'district',         p.district,
        'neighborhood',     p.neighborhood,
        'approx_lat',       p.approx_lat,
        'approx_lng',       p.approx_lng,
        'mode',             p.mode,
        'ref_no',           p.ref_no,
        'created_at',       p.created_at,
        'cover_path', (
          select img.path
          from public.portfolio_images img
          where img.portfolio_id = p.id
            and img.visibility = 'public'::public.image_visibility
          order by img.is_cover desc, img.sort_order
          limit 1
        ),
        'agent', jsonb_build_object(
          'username',   pr.username,
          'full_name',  pr.full_name,
          'avatar_url', pr.avatar_url
        )
      ) as card
    from s
    join public.portfolios p
      on  p.status           = 'active'::public.portfolio_status
      and p.transaction_type = s.transaction_type
      and p.category         = s.category
      and p.owner_id        <> (select auth.uid())
      -- budget: flexible nulls. If a bound is set, the portfolio price must exist + fit.
      and (s.budget_min is null or (p.price is not null and p.price >= s.budget_min))
      and (s.budget_max is null or (p.price is not null and p.price <= s.budget_max))
      -- region: optional. If the search names a city/district, require equality.
      and (s.city     is null or p.city     = s.city)
      and (s.district is null or p.district = s.district)
      -- rooms: optional.
      and (s.room_count is null or p.room_count = s.room_count)
    join public.profiles pr on pr.id = p.owner_id
  ) t;
$$;

comment on function public.match_search(uuid) is
  'B8 Eşleşme: TEASER-only matches for a search (allow-list mirrors get_public_agent_portfolios). Verified caller + own/active search. No D13 locked fields.';

revoke execute on function public.match_search(uuid) from public, anon;
grant  execute on function public.match_search(uuid) to authenticated;
