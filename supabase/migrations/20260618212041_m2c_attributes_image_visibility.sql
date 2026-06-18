-- =============================================================================
-- M2c — Attributes registry storage (D33) + per-photo visibility (D34)
-- Bölgenin Uzmanı
-- -----------------------------------------------------------------------------
-- WHAT THIS DOES
--   Extends the M2 portfolio schema with two forward-looking capabilities that
--   stay faithful to the D13 teaser/locked split:
--
--   D33 — FLEXIBLE ATTRIBUTES BAG, split PUBLIC vs LOCKED.
--     Property attributes (cephe, ısıtma, kat, bina yaşı, eşyalı, aidat, …) vary
--     wildly by category, so instead of one column per attribute we keep a jsonb
--     "bag" — but split across the SAME two tables that already enforce the D13
--     visibility boundary, so RLS keeps gating it for free:
--       * public.portfolios.attributes        — PUBLIC (teaser-safe) attributes.
--       * public.portfolio_private.attributes  — LOCKED attributes (e.g. bina/site
--         adı, daire no) — only owner/granted via has_portfolio_access().
--     The APP's attribute registry is the single source of truth for which key
--     belongs to which side; the DB only stores the bags (see RISKS).
--     A GIN index on portfolios.attributes supports teaser-side attribute filters
--     (Keşfet, Slice 5).
--
--   D34 — PER-PHOTO VISIBILITY.
--     A photo can be PUBLIC (teaser-safe; shown on /p/$slug and in the network
--     teaser; bytes live in the PUBLIC `portfolio-images` bucket) or LOCKED (an
--     interior/floor-plan/sensitive shot revealed only to owner/granted agents;
--     bytes live in a new PRIVATE `portfolio-images-locked` bucket and are served
--     only through short-lived, access-checked signed URLs — exactly the
--     `portfolio-documents` privacy model from M2b).
--     portfolio_images gets a `visibility` column; its SELECT RLS is rewritten so
--     public rows follow teaser visibility and locked rows follow
--     has_portfolio_access(). The write policies (owner-only via owns_portfolio)
--     are UNCHANGED and are intentionally not recreated here.
--
-- BUILDS ON (both APPLIED)
--   20260618190718_m2_portfolios.sql      — tables + SECURITY DEFINER helpers:
--       public.owns_portfolio(uuid, uuid default auth.uid())
--       public.portfolio_teaser_visible(uuid, uuid default auth.uid())
--       public.has_portfolio_access(uuid, uuid default auth.uid())
--     (schema public, EXECUTE granted to authenticated).
--   20260618193206_m2b_storage_buckets.sql — `portfolio-images` (public) and
--       `portfolio-documents` (private) buckets + their storage.objects policies.
--
-- STORAGE RLS OWNERSHIP
--   storage.objects already has RLS ENABLED by Supabase. We do NOT enable or take
--   ownership of it — we only ADD policies, scoped per bucket via bucket_id, and
--   reuse the M2b path convention: the object's first path segment is the owning
--   portfolio id → (storage.foldername(name))[1]::uuid.
--   The existing PUBLIC `portfolio-images` bucket and its M2b policies are LEFT
--   UNCHANGED by this migration.
--
-- CONVENTIONS
--   Idempotent throughout (do $$ … if not exists, add column if not exists,
--   create index if not exists, on conflict do nothing, drop policy if exists).
--   Every RLS policy wraps auth.uid() as (select auth.uid()) (initplan perf).
--
-- APPLY: a human runs `supabase db push`. Do NOT auto-apply. Regenerate TS types
--   after this lands.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) ATTRIBUTES (D33) — public bag on portfolios, locked bag on portfolio_private
-- -----------------------------------------------------------------------------

alter table public.portfolios
  add column if not exists attributes jsonb not null default '{}'::jsonb;

alter table public.portfolio_private
  add column if not exists attributes jsonb not null default '{}'::jsonb;

-- GIN index for teaser-side attribute containment/key filters (Keşfet, Slice 5).
create index if not exists portfolios_attributes_gin
  on public.portfolios using gin (attributes);

comment on column public.portfolios.attributes is
  'D33: PUBLIC (teaser-safe) attribute values — e.g. cephe, ısıtma, kat, bina yaşı, eşyalı, aidat. The APP attribute registry decides which keys are public vs locked; locked ones go to portfolio_private.attributes. GIN-indexed for teaser filters.';
comment on column public.portfolio_private.attributes is
  'D33: LOCKED attribute values — e.g. bina/site adı, daire no — gated by has_portfolio_access() via the portfolio_private SELECT policy. Counterpart to the PUBLIC portfolios.attributes bag; the APP attribute registry owns the split.';

-- -----------------------------------------------------------------------------
-- 2) PER-PHOTO VISIBILITY (D34) — image_visibility enum + portfolio_images column
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'image_visibility') then
    create type public.image_visibility as enum ('public', 'locked');
  end if;
end$$;

alter table public.portfolio_images
  add column if not exists visibility public.image_visibility not null default 'public';

comment on column public.portfolio_images.visibility is
  'D34: ''public'' photos are teaser-safe (shown on /p/$slug and the network teaser; bytes in the PUBLIC portfolio-images bucket). ''locked'' photos are revealed only to owner/granted agents (bytes in the PRIVATE portfolio-images-locked bucket, served via short-lived signed URLs gated by has_portfolio_access()).';

-- -----------------------------------------------------------------------------
-- 3) portfolio_images SELECT RLS — honor per-photo visibility (D34)
--    Replaces the M2 policy `portfolio_images_select`. Public rows follow teaser
--    visibility; locked rows follow has_portfolio_access(). The INSERT/UPDATE/
--    DELETE owner-only policies from M2 are UNCHANGED and not recreated here.
-- -----------------------------------------------------------------------------

drop policy if exists "portfolio_images_select" on public.portfolio_images;
create policy portfolio_images_select
  on public.portfolio_images
  for select
  to authenticated
  using (
    (
      visibility = 'public'::public.image_visibility
      and public.portfolio_teaser_visible(portfolio_id, (select auth.uid()))
    )
    or
    (
      visibility = 'locked'::public.image_visibility
      and public.has_portfolio_access(portfolio_id, (select auth.uid()))
    )
  );

-- -----------------------------------------------------------------------------
-- 4) STORAGE — private `portfolio-images-locked` bucket + storage.objects RLS
--    Same privacy model as portfolio-documents (M2b): NEVER public; grant-aware
--    SELECT (gates signed-URL minting); owner-only writes. Path convention is the
--    M2b one: first segment = portfolio id.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('portfolio-images-locked', 'portfolio-images-locked', false)
on conflict (id) do nothing;

-- SELECT is grant-aware via has_portfolio_access(): to mint a signed URL the
-- caller must pass RLS SELECT on the object, so the same predicate that gates the
-- locked-data tables gates locked photos. M2 = owner-only (the helper resolves to
-- ownership today); M3 makes has_portfolio_access() grant-aware → signed-URL
-- access follows automatically, no change needed here.
drop policy if exists "portfolio_images_locked_access_select" on storage.objects;
create policy "portfolio_images_locked_access_select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'portfolio-images-locked'
    and public.has_portfolio_access((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

drop policy if exists "portfolio_images_locked_owner_insert" on storage.objects;
create policy "portfolio_images_locked_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-images-locked'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

drop policy if exists "portfolio_images_locked_owner_update" on storage.objects;
create policy "portfolio_images_locked_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portfolio-images-locked'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  )
  with check (
    bucket_id = 'portfolio-images-locked'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

drop policy if exists "portfolio_images_locked_owner_delete" on storage.objects;
create policy "portfolio_images_locked_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio-images-locked'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

-- =============================================================================
-- RISKS / NOTES
--   (a) Existing public.portfolio_images rows default to visibility = 'public'.
--       This is CORRECT: every image that existed before M2c was uploaded to the
--       PUBLIC `portfolio-images` bucket and was always teaser-visible, so the
--       default preserves their current behavior. No backfill needed.
--   (b) The new `portfolio-images-locked` bucket follows the portfolio-documents
--       PRIVACY MODEL exactly — public = false, NEVER public-read; bytes reach a
--       client only through a short-lived, access-checked signed URL whose minting
--       passes the grant-aware SELECT policy (has_portfolio_access). Do NOT make
--       this bucket public.
--   (c) The attributes jsonb bags are UNVALIDATED at the DB level (free-form
--       jsonb, no shape/key/type constraints). The APP's attribute registry is the
--       single source of truth that enforces shape AND the public-vs-locked split
--       (which key may live in portfolios.attributes vs portfolio_private.attributes).
--       A buggy writer that puts a LOCKED key into portfolios.attributes would leak
--       it via the teaser — the registry, not the DB, prevents this.
-- =============================================================================
-- END M2c
-- =============================================================================
