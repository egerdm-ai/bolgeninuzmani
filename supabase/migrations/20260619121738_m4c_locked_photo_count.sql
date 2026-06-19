-- =============================================================================
-- Migration: 20260619121738_m4c_locked_photo_count  (DRAFT — NOT APPLIED)
-- Slice:     M4c — D37 locked transparency: expose the COUNT of locked photos on
--            the anon teaser (a non-identifying integer; never paths/content).
--
-- create or replace get_public_portfolio (body copied VERBATIM from M4b
-- 20260619114316) + ONE added key: 'locked_photo_count'. No other change.
--
-- WHY SAFE
--   locked_photo_count is just COUNT(*) of visibility='locked' images for the
--   portfolio — a number, not a path/URL/content. It reveals only "how many"
--   locked photos exist (D37 transparency), never the photos themselves. All
--   other behavior is unchanged: status='active' gate, public-image list, public
--   attributes bag, coarse pin, owner OPEN contact; no exact_*/malik/private/
--   document is referenced. The count subquery is the ONLY new reference to a
--   locked row, and it returns an aggregate integer only.
--
-- APPLY: human runs `supabase db push`, then regen TS types (get_public_portfolio
--   already returns Json, so no TS shape change — the app already reads optional
--   `locked_photo_count` from the jsonb).
-- =============================================================================

create or replace function public.get_public_portfolio(_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'id',               p.id,
    'slug',             p.slug,
    'title',            p.title,
    'public_description', p.public_description,
    'price',            p.price,
    'currency',         p.currency,
    'transaction_type', p.transaction_type,
    'category',         p.category,
    'subcategory',      p.subcategory,
    'room_count',       p.room_count,
    'gross_m2',         p.gross_m2,
    'net_m2',           p.net_m2,
    'land_m2',          p.land_m2,
    'features',         p.features,
    'city',             p.city,
    'district',         p.district,
    'neighborhood',     p.neighborhood,
    'mode',             p.mode,
    'ref_no',           p.ref_no,
    'approx_lat',       p.approx_lat,
    'approx_lng',       p.approx_lng,
    'created_at',       p.created_at,
    'attributes',       p.attributes,
    -- D37: COUNT of locked photos only (non-identifying number; no path/content).
    'locked_photo_count', (
      select count(*)
      from public.portfolio_images img
      where img.portfolio_id = p.id
        and img.visibility = 'locked'::public.image_visibility
    ),
    'images', coalesce(
      (
        select jsonb_agg(
                 jsonb_build_object(
                   'path',       img.path,
                   'sort_order', img.sort_order,
                   'is_cover',   img.is_cover
                 )
                 order by img.sort_order, img.is_cover desc
               )
        from public.portfolio_images img
        where img.portfolio_id = p.id
          and img.visibility = 'public'::public.image_visibility
      ),
      '[]'::jsonb
    ),
    'agent', (
      select jsonb_build_object(
               'username',           pr.username,
               'full_name',          pr.full_name,
               'title',              pr.title,
               'company_name',       pr.company_name,
               'avatar_url',         pr.avatar_url,
               'bio',                pr.bio,
               'contact_phone',      pr.contact_phone,
               'contact_email',      pr.contact_email,
               'contact_whatsapp',   pr.contact_whatsapp,
               'expertise_regions',  pr.expertise_regions,
               'expertise_types',    pr.expertise_types
             )
      from public.profiles pr
      where pr.id = p.owner_id
    )
  )
  from public.portfolios p
  where p.slug = _slug
    and p.status = 'active'::public.portfolio_status;
$$;

comment on function public.get_public_portfolio(text) is
  'D13 anon teaser for /p/$slug. M4c: also returns locked_photo_count (COUNT of locked photos only — D37 transparency; no path/content). Still never returns exact_*/malik/private/documents; images filtered to visibility=public; mode+ref_no public.';

revoke execute on function public.get_public_portfolio(text) from public;
grant  execute on function public.get_public_portfolio(text) to anon, authenticated;
