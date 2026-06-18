-- =============================================================================
-- Migration: 20260618223704_slice3_public_teaser_rpc
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     3 — public/customer teaser (anon-facing /p/$slug + agent profile)
--
-- WHAT THIS DOES
--   Adds the TWO anon-callable read paths for the customer-facing pages, both as
--   SECURITY DEFINER RPCs that return a jsonb object built from a STRICT,
--   EXPLICIT allow-list of PUBLIC columns:
--     * public.get_public_portfolio(_slug text)    — the /p/$slug teaser card.
--     * public.get_public_profile(_username text)   — the public agent profile.
--   Anon (no session) calls these on the shared customer page. Per D13 the anon
--   role NEVER touches a base table — there is intentionally NO anon RLS policy
--   on portfolios/profiles/etc. (verified in M1/M2: anon has no table grants).
--   These definer functions are the ONLY anon read surface, and they hand back a
--   fixed shape, so no column can leak by accident.
--
-- WHY THIS CANNOT LEAK (D13)
--   1. EXPLICIT ALLOW-LIST, NO `select *`. Every returned key is enumerated in a
--      jsonb_build_object. The locked field set is simply never named, so it
--      cannot appear in the payload even if a locked column is added later.
--   2. STATUS GATE. get_public_portfolio returns rows ONLY for status='active';
--      get_public_profile returns ONLY for profiles.status='verified'. Drafts,
--      passive/sold portfolios, and pending/suspended agents return NULL.
--   3. THE BODY NEVER REFERENCES LOCKED SOURCES. get_public_portfolio does NOT
--      reference public.portfolio_private or public.portfolio_documents AT ALL,
--      and selects images ONLY where visibility='public'. So exact_address,
--      exact_lat/lng, malik_info, private_description, private_notes,
--      portfolio_private.attributes (D33 locked bag), locked images, and any
--      document are structurally unreachable from this code path.
--   4. COARSE PIN ONLY. The only coordinates returned are portfolios.approx_lat/
--      approx_lng — the server-derived COARSE pin (D30/M2). Exact coords live
--      only in portfolio_private and are never selected here.
--   5. ANON HAS EXECUTE ONLY ON THESE DEFINER FUNCTIONS, and NO direct table
--      grants anywhere (M1/M2: grants are to `authenticated` only; no anon
--      policies exist). SECURITY DEFINER lets the function read the base tables
--      as its owner, but the caller can only ever receive the fixed allow-list.
--
-- DECISIONS HONORED
--   D13 — anon never touches base tables; public teaser served via definer RPC.
--   D8  — the AGENT'S OWN contact (phone/email/whatsapp) is OPEN and IS returned
--         (this is how the customer reaches the agent from the shared link).
--         This is the agent's contact on profiles — NOT malik_info (locked).
--   D30 — only the coarse approx pin is exposed; exact coords never leave
--         portfolio_private.
--   D33 — only the PUBLIC attributes bag (portfolios.attributes) is returned; the
--         LOCKED bag (portfolio_private.attributes) is never referenced.
--   D34 — only visibility='public' images are returned; locked photos excluded.
--   D27 — public profile exposed only for verified agents.
--   Invariant #1 — locked fields never reach public/customer paths (enforced at
--         the backend here, not client-side).
--
-- APPLY: a human runs `supabase db push`. Do NOT auto-apply. Regenerate TS types
--   after this lands.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) get_public_portfolio(_slug) — the anon /p/$slug teaser card.
--    Returns NULL unless an ACTIVE portfolio with that slug exists. NEVER
--    references portfolio_private or portfolio_documents; images filtered to
--    visibility='public'. PUBLIC attributes bag only.
-- -----------------------------------------------------------------------------
create or replace function public.get_public_portfolio(_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    -- teaser scalar columns (PUBLIC only) ------------------------------------
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
    -- COARSE pin only (D30). Exact coords (portfolio_private) NEVER selected.
    'approx_lat',       p.approx_lat,
    'approx_lng',       p.approx_lng,
    'created_at',       p.created_at,
    -- D33 PUBLIC bag ONLY. The LOCKED portfolio_private.attributes is never read.
    'attributes',       p.attributes,
    -- PUBLIC images only (D34). visibility='locked' rows are excluded. Client
    -- builds the public-bucket URL from `path` (bucket is public-read).
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
    -- owner's PUBLIC profile fields (D8: agent's own contact is OPEN). No id,
    -- no status, no auth/email fields beyond the OPEN contact_email.
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
  'D13: anon-callable SECURITY DEFINER teaser for /p/$slug. Returns a jsonb allow-list of PUBLIC columns ONLY for an ACTIVE portfolio (else NULL). Never references portfolio_private/portfolio_documents; images filtered to visibility=public; only the PUBLIC attributes bag and the COARSE approx pin (D30) are exposed; the agent block is the owner OPEN contact (D8). Anon has EXECUTE on this function and NO base-table grants.';

-- -----------------------------------------------------------------------------
-- 2) get_public_profile(_username) — the anon public agent profile.
--    Returns NULL unless the profile is status='verified' (D27). Allow-list of
--    PUBLIC display fields; never id/status/auth fields.
-- -----------------------------------------------------------------------------
create or replace function public.get_public_profile(_username text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'username',          pr.username,
    'full_name',         pr.full_name,
    'title',             pr.title,
    'company_name',      pr.company_name,
    'location',          pr.location,
    'avatar_url',        pr.avatar_url,
    'bio',               pr.bio,
    -- D8: agent's own contact is OPEN.
    'contact_phone',     pr.contact_phone,
    'contact_email',     pr.contact_email,
    'contact_whatsapp',  pr.contact_whatsapp,
    'expertise_regions', pr.expertise_regions,
    'expertise_types',   pr.expertise_types,
    'membership_tier',   pr.membership_tier   -- D21: display-only badge
  )
  from public.profiles pr
  where pr.username = _username
    and pr.status = 'verified'::public.profile_status;
$$;

comment on function public.get_public_profile(text) is
  'D27/D13: anon-callable SECURITY DEFINER public agent profile. Returns a jsonb allow-list of PUBLIC display fields ONLY for a VERIFIED profile (else NULL). Never returns id, status, or auth fields. contact_* are OPEN (D8); membership_tier is display-only (D21). Anon has EXECUTE on this function and NO base-table grants.';

-- -----------------------------------------------------------------------------
-- 3) EXECUTE GRANTS — anon (the customer page has no session) + authenticated.
--    Lock down first (revoke from public), then grant to the two app roles.
-- -----------------------------------------------------------------------------
revoke execute on function public.get_public_portfolio(text) from public;
revoke execute on function public.get_public_profile(text)   from public;

grant execute on function public.get_public_portfolio(text) to anon, authenticated;
grant execute on function public.get_public_profile(text)   to anon, authenticated;

-- =============================================================================
-- RISKS / NOTES
--   (a) COARSE PIN: the only coordinates ever returned are approx_lat/approx_lng,
--       the server-derived coarse pin (M2 design, D30). Confirmed: exact_lat/
--       exact_lng live only in portfolio_private and are NEVER selected by these
--       functions — the body does not reference portfolio_private at all.
--   (b) IMAGE URLS: the function returns the public image `path` only; the client
--       builds the final URL from the PUBLIC `portfolio-images` bucket (public-
--       read). Locked photos (visibility='locked', in the PRIVATE
--       portfolio-images-locked bucket) are excluded here and remain reachable
--       only via short-lived, access-checked signed URLs (M2c).
--   (c) ALLOW-LIST DRIFT: because the shape is an explicit jsonb_build_object,
--       any future LOCKED column added to portfolios/profiles is NOT exposed
--       unless someone edits these functions. Treat any addition of a key here
--       as a security-relevant change requiring audit.
--   (d) ENUM/ARRAY KEYS: enum values (currency, transaction_type, category) and
--       text[] arrays (features, expertise_*) serialize to their natural jsonb
--       (string / array) forms — safe, no locked data implied.
-- =============================================================================
-- END Slice 3 public teaser RPCs
-- =============================================================================
