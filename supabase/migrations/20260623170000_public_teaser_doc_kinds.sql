-- =============================================================================
-- /p customer teaser — locked document TYPE visibility (Faz 2.4)
-- Bölgenin Uzmanı
-- -----------------------------------------------------------------------------
-- DRAFT — NOT auto-applied. A human runs `supabase db push` after review.
-- Depends on 20260623150000_locked_model_docs (portfolios.locked_document_kinds).
--
-- WHAT THIS DOES (the EXPLICIT, isolated public allow-list change)
--   Adds ONE field — locked_document_kinds — to the get_public_portfolio() teaser
--   allow-list so the anon /p/$slug customer page can render "Kilitli: Kat Planı".
--
-- WHY IT IS LEAK-SAFE (D13)
--   * locked_document_kinds is a denormalized TYPE-ONLY array on portfolios (e.g.
--     {kat_plani}). It is NOT a path and NOT content — a document's bytes are still
--     reachable ONLY through an access-checked signed URL (has_portfolio_access),
--     which anon never gets.
--   * The function STILL never references portfolio_private or portfolio_documents;
--     it reads the teaser column only. Exact coords, malik, notes, locked photos and
--     document content remain unreachable from this path.
--   * Everything else in the allow-list is unchanged.
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
    'approx_lat',       p.approx_lat,
    'approx_lng',       p.approx_lng,
    'created_at',       p.created_at,
    'attributes',       p.attributes,
    -- Faz 2.4: TYPE-ONLY array of the portfolio's locked document kinds (teaser-safe).
    -- Never a path, never content; document bytes stay gated by has_portfolio_access.
    'locked_document_kinds', p.locked_document_kinds,
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
  'D13: anon-callable SECURITY DEFINER teaser for /p/$slug. PUBLIC allow-list for an ACTIVE portfolio (else NULL). Never references portfolio_private/portfolio_documents; images filtered to visibility=public; PUBLIC attributes + COARSE approx pin (D30) only. Faz 2.4: adds locked_document_kinds (document TYPE only, never path/content — bytes stay gated by has_portfolio_access). Anon has EXECUTE and NO base-table grants.';
