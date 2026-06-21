-- =============================================================================
-- Migration: 20260621140000_admin_verify  ⚠️ REVIEW GEREKLİ — DRAFT, NOT APPLIED
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     Admin doğrulama UI (emlakçı onayı — ekrandan, SQL yerine)
--
-- WHAT THIS DOES
--   (1) admin_set_profile_status(_user_id, _status): the ONLY write path for the
--       verification gate from the app. Admin-validated SECURITY DEFINER RPC — flips a
--       profile to 'verified' (onayla) or 'suspended' (reddet, reversible). The client
--       NEVER writes profiles.status directly.
--   (2) am_i_admin(): no-arg boolean for the route guard / sidebar (caller-only; avoids
--       the existing is_admin(_user_id) which lets a caller probe ANY user's admin flag).
--
--   Listing pending profiles / applications needs NO migration: admins already read them
--   via existing RLS (profiles_select_admin, applications_select_admin).
--
-- ====================== WHY THIS IS SAFE (authority) =========================
-- (1) admin_set_profile_status RAISES unless is_admin(auth.uid()) — a non-admin (or anon)
--     caller is rejected before any write. Defense-in-depth: the profiles_guard_status
--     trigger ALSO blocks non-admin status changes (D27); this RPC is the second gate.
-- (2) _status is constrained to verified|suspended (cannot set 'pending'); an admin cannot
--     change their OWN status (no self-lockout / self-suspend).
-- (3) security definer + `set search_path = public, pg_temp` (pinned). EXECUTE granted to
--     authenticated only; revoked from public + anon.
-- (4) NOTE: blanket table-grant tightening (B11.2) is intentionally OUT OF SCOPE here —
--     this migration stays focused on the admin RPC.
--
-- APPLY: human `supabase db push`, then regen TS types (both functions appear under
--   Database['public']['Functions']). Then wire src/lib/data/admin.ts + the /dashboard/admin UI.
-- =============================================================================

-- 1) Caller-only admin check (no-arg) for the route guard / nav visibility.
create or replace function public.am_i_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_admin(auth.uid());
$$;

comment on function public.am_i_admin() is
  'Caller-only admin flag for the admin UI route guard. Wraps is_admin(auth.uid()) so a client cannot probe another user''s admin status.';

revoke execute on function public.am_i_admin() from public, anon;
grant  execute on function public.am_i_admin() to authenticated;

-- 2) The ONLY app write path for the verification gate. Admin-validated.
create or replace function public.admin_set_profile_status(
  _user_id uuid,
  _status  public.profile_status
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Authority gate: only an admin may verify/suspend.
  if not public.is_admin(auth.uid()) then
    raise exception 'Yetkisiz: yalnızca admin profil durumunu değiştirebilir.'
      using errcode = '42501';
  end if;

  -- Only verify | suspend are settable from the UI (never back to pending).
  if _status not in ('verified'::public.profile_status, 'suspended'::public.profile_status) then
    raise exception 'Geçersiz durum: yalnızca verified veya suspended.'
      using errcode = '22023';
  end if;

  -- No self-lockout: an admin cannot change their own status.
  if _user_id = auth.uid() then
    raise exception 'Admin kendi durumunu değiştiremez.'
      using errcode = '42501';
  end if;

  update public.profiles
     set status = _status
   where id = _user_id;

  if not found then
    raise exception 'Profil bulunamadı: %', _user_id
      using errcode = 'P0002';
  end if;
end;
$$;

comment on function public.admin_set_profile_status(uuid, public.profile_status) is
  'Admin doğrulama: verified (onayla) | suspended (reddet, geri alınabilir). is_admin gate + guard_profile_status (D27) = iki kat. Client profiles.status''u doğrudan yazmaz.';

revoke execute on function public.admin_set_profile_status(uuid, public.profile_status) from public, anon;
grant  execute on function public.admin_set_profile_status(uuid, public.profile_status) to authenticated;
