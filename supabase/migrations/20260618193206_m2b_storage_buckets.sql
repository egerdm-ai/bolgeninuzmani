-- =============================================================================
-- M2b — Storage buckets + storage.objects RLS for portfolio media
-- Bölgenin Uzmanı
-- -----------------------------------------------------------------------------
-- WHAT THIS DOES
--   Creates the two storage buckets that hold portfolio media and adds the
--   RLS policies on storage.objects that gate who may write/read those objects.
--   Depends on M2 (20260618190718_m2_portfolios.sql), which created
--   public.portfolios and the SECURITY DEFINER helpers:
--       public.owns_portfolio(_portfolio_id uuid, _user_id uuid default auth.uid())
--       public.has_portfolio_access(_portfolio_id uuid, _user_id uuid default auth.uid())
--   Both live in schema public and are granted to `authenticated`.
--
-- THE TWO BUCKETS AND THEIR PRIVACY MODEL
--   1) portfolio-images   (public = true)  — D29 teaser media.
--      - PUBLIC-READ: object bytes are served via the bucket's public URL.
--        This is intentional: customer share links (/p/$slug, Slice 3) are
--        served to ANON visitors who have no Supabase session, so the image
--        bytes must be reachable without auth.
--      - NO LISTING: there is deliberately NO SELECT policy on storage.objects
--        for this bucket, so an authenticated client cannot enumerate/list the
--        objects. Discovery is prevented by an UNGUESSABLE path (a random uuid
--        filename). Public-read + no-listing + unguessable path = the teaser
--        media is viewable only by someone who already holds the exact URL.
--      - WRITE (insert/update/delete) is restricted to the portfolio OWNER.
--
--   2) portfolio-documents (public = false) — D20 LOCKED document set
--      (tapu / ruhsat / imar / proje / pdf).
--      - PRIVATE: never public-read. Object bytes are reachable only through a
--        short-lived, access-checked SIGNED URL minted server-side.
--      - SELECT is grant-aware via public.has_portfolio_access(): to mint a
--        signed URL the caller must pass RLS SELECT on the object, so the same
--        predicate that gates the locked-data tables gates the documents.
--        M2 = owner-only (the helper resolves to ownership today); when M3 makes
--        has_portfolio_access() grant-aware, signed-URL access follows it
--        automatically — no change needed here.
--      - WRITE (insert/update/delete) is restricted to the portfolio OWNER.
--
-- PATH CONVENTION (the app MUST follow this)
--   Every object's FIRST path segment is the owning portfolio's id:
--       "<portfolio_id>/<random-uuid>.<ext>"
--   e.g. "3f9a1c2e-....-...../9b1d....-....-...../photo.jpg"
--   RLS derives the portfolio id from the object path with
--       (storage.foldername(name))[1]::uuid
--   and feeds it to owns_portfolio() / has_portfolio_access().
--   The app MUST upload to "<portfolio_id>/<uuid>.<ext>"; the random uuid in
--   the images bucket is what keeps the public URL unguessable.
--
-- NOTE ON THE PATH CAST
--   (storage.foldername(name))[1]::uuid will RAISE on a malformed path (first
--   segment not a valid uuid, or no folder). That is ACCEPTABLE: the app always
--   uses the convention above, so a malformed path is a client bug, and a hard
--   error simply means such an upload/read is rejected rather than silently
--   matching the wrong portfolio. Worth knowing when debugging.
--
-- RLS OWNERSHIP
--   storage.objects already has RLS ENABLED by Supabase. We do NOT enable or
--   take ownership of it — we only add policies. Policies are scoped per bucket
--   via bucket_id. Per convention every auth.uid() is wrapped as
--   (select auth.uid()) so the planner evaluates it once per statement.
--
-- IDEMPOTENT: bucket inserts use ON CONFLICT DO NOTHING; every policy is
--   preceded by DROP POLICY IF EXISTS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Buckets
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio-documents', 'portfolio-documents', false)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 2) RLS policies on storage.objects
--    (RLS is already enabled by Supabase; we only add policies.)
-- -----------------------------------------------------------------------------

-- ===== portfolio-images (public-read teaser media; owner-only writes) ========
--
-- NO SELECT policy is intentional: listing/enumeration stays CLOSED. Image
-- bytes are served via the bucket's PUBLIC url using the unguessable uuid path,
-- not via an authenticated list/select. Do NOT add a SELECT policy here.

drop policy if exists "portfolio_images_owner_insert" on storage.objects;
create policy "portfolio_images_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-images'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

drop policy if exists "portfolio_images_owner_update" on storage.objects;
create policy "portfolio_images_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portfolio-images'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  )
  with check (
    bucket_id = 'portfolio-images'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

drop policy if exists "portfolio_images_owner_delete" on storage.objects;
create policy "portfolio_images_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio-images'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

-- ===== portfolio-documents (private; grant-aware read, owner-only writes) =====
--
-- SELECT is grant-aware via has_portfolio_access(). This is the predicate that
-- gates createSignedUrl: the caller must pass RLS SELECT on the object to mint
-- a signed URL. M2 = owner-only; M3 makes has_portfolio_access() grant-aware
-- → signed-URL access automatically follows.

drop policy if exists "portfolio_documents_access_select" on storage.objects;
create policy "portfolio_documents_access_select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'portfolio-documents'
    and public.has_portfolio_access((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

drop policy if exists "portfolio_documents_owner_insert" on storage.objects;
create policy "portfolio_documents_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-documents'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

drop policy if exists "portfolio_documents_owner_update" on storage.objects;
create policy "portfolio_documents_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portfolio-documents'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  )
  with check (
    bucket_id = 'portfolio-documents'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

drop policy if exists "portfolio_documents_owner_delete" on storage.objects;
create policy "portfolio_documents_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio-documents'
    and public.owns_portfolio((storage.foldername(name))[1]::uuid, (select auth.uid()))
  );

-- =============================================================================
-- END M2b
-- =============================================================================
