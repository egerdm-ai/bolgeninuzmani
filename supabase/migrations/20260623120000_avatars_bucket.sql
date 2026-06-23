-- =============================================================================
-- Avatars bucket + storage.objects RLS for profile photos (FAZ 0 — bug: "Profil
-- foto editlenmiyor", PDF s.17)
-- Bölgenin Uzmanı
-- -----------------------------------------------------------------------------
-- DRAFT — NOT auto-applied. A human runs `supabase db push` after review.
--
-- WHAT THIS DOES
--   Creates a PUBLIC `avatars` bucket and the storage.objects RLS that lets each
--   authenticated user write ONLY their own avatar. profiles.avatar_url stores
--   the resulting public URL (already an editable column; no schema change).
--
-- PRIVACY MODEL (mirrors portfolio-images)
--   - PUBLIC-READ: avatars appear on public profile pages (/v/$username) served
--     to anon visitors, so the bytes must be reachable without a session. Served
--     via the bucket's public URL.
--   - NO LISTING: no SELECT policy → clients cannot enumerate objects. The random
--     uuid filename keeps the URL unguessable.
--   - WRITE (insert/update/delete): restricted to the owner. The object's FIRST
--     path segment is the owner's user id: "<uid>/<random-uuid>.webp". RLS derives
--     it with (storage.foldername(name))[1]::uuid and compares to auth.uid().
--
-- IDEMPOTENT: bucket insert uses ON CONFLICT DO NOTHING; every policy is preceded
--   by DROP POLICY IF EXISTS.
-- =============================================================================

-- 1) Bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2) storage.objects RLS (RLS is already enabled by Supabase; we only add policies)
--    NO SELECT policy on purpose: public-read via URL, listing stays closed.

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1]::uuid = (select auth.uid())
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1]::uuid = (select auth.uid())
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1]::uuid = (select auth.uid())
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1]::uuid = (select auth.uid())
  );

-- =============================================================================
-- END avatars bucket
-- =============================================================================
