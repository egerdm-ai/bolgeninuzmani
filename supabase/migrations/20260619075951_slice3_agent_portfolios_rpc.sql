-- =============================================================================
-- Migration: 20260619075951_slice3_agent_portfolios_rpc  (DRAFT — NOT APPLIED)
-- Slice 3/5 polish — anon RPC: an agent's ACTIVE portfolios as TEASER cards, for
-- the public profile page (/v/$username "Bu uzmanın portföyleri") and the agent
-- card on /p/$slug.
--
-- Same security model as get_public_portfolio (D13): SECURITY DEFINER, EXPLICIT
-- PUBLIC allow-list (no `select *`), anon EXECUTE, never touches locked sources.
--
-- WHY THIS CANNOT LEAK (D13)
--   1. EXPLICIT ALLOW-LIST: each card is a jsonb_build_object of teaser-only
--      columns + a single PUBLIC cover image path. The locked field set is never
--      named, so it cannot appear in the payload.
--   2. STATUS GATES: only profiles.status='verified' agents, and only their
--      portfolios.status='active'. Drafts/passive/sold and unverified agents
--      return an empty array.
--   3. NO LOCKED SOURCES: the body never references portfolio_private or
--      portfolio_documents, and the cover is chosen ONLY from
--      portfolio_images where visibility='public'. exact_*, malik_info,
--      private_*, locked attributes/images, documents are structurally
--      unreachable.
--   4. anon has EXECUTE on this definer function and NO base-table grants.
--
-- A human runs `supabase db push`; regenerate TS types after. Do NOT auto-apply.
-- =============================================================================

create or replace function public.get_public_agent_portfolios(_username text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(card order by created_at desc), '[]'::jsonb)
  from (
    select
      p.created_at as created_at,
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
        'created_at',       p.created_at,
        -- single PUBLIC cover path (client builds the public-bucket URL); locked
        -- images (visibility='locked') are never considered.
        'cover_path', (
          select img.path
          from public.portfolio_images img
          where img.portfolio_id = p.id
            and img.visibility = 'public'::public.image_visibility
          order by img.is_cover desc, img.sort_order
          limit 1
        )
      ) as card
    from public.portfolios p
    join public.profiles pr on pr.id = p.owner_id
    where pr.username = _username
      and pr.status = 'verified'::public.profile_status
      and p.status = 'active'::public.portfolio_status
  ) t;
$$;

comment on function public.get_public_agent_portfolios(text) is
  'D13: anon-callable SECURITY DEFINER list of a VERIFIED agent''s ACTIVE portfolios as TEASER cards (jsonb array, explicit PUBLIC allow-list + public cover path only). Never references portfolio_private/portfolio_documents or locked images. anon has EXECUTE and no base-table grants.';

revoke execute on function public.get_public_agent_portfolios(text) from public;
grant execute on function public.get_public_agent_portfolios(text) to anon, authenticated;

-- =============================================================================
-- NOTE: additive function only; no table/RLS change, no type-shape change beyond
-- the new function signature (regen TS types to type it; until then the app
-- stubs it as Returns: Json). Allow-list is the single leak surface — any future
-- key added here is security-relevant and must be re-audited.
-- =============================================================================
