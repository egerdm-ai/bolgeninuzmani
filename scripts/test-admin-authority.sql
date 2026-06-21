-- Admin authority test — run in the Supabase SQL editor (or psql).
-- Proves the verification gate rejects non-admins. Picks a real non-admin verified agent,
-- simulates them via request.jwt.claims (auth.uid()), and asserts:
--   1) am_i_admin() = false for a non-admin
--   2) admin_set_profile_status(...) RAISES for a non-admin (no status write happens)
-- A passing run prints a NOTICE; a failing assert aborts with an error. Read-only
-- (the rejected RPC never writes; we target a random uuid so even a gate bug wouldn't
-- verify a real user — is_admin is checked before the row is touched).
do $$
declare
  _non_admin uuid;
  _rejected  boolean := false;
begin
  select p.id into _non_admin
  from public.profiles p
  where p.status = 'verified'
    and not exists (select 1 from public.user_roles ur where ur.user_id = p.id and ur.role = 'admin')
  limit 1;
  if _non_admin is null then
    raise exception 'No non-admin verified agent to test with (seed first).';
  end if;

  -- Simulate the non-admin caller.
  perform set_config('request.jwt.claims', json_build_object('sub', _non_admin)::text, true);

  -- 1) am_i_admin must be false.
  assert public.am_i_admin() = false, 'FAIL: non-admin am_i_admin() returned true';

  -- 2) admin_set_profile_status must raise (authority gate).
  begin
    perform public.admin_set_profile_status(
      '00000000-0000-0000-0000-000000000000'::uuid,
      'verified'::public.profile_status
    );
  exception
    when others then _rejected := true;
  end;
  assert _rejected, 'FAIL: non-admin admin_set_profile_status was NOT rejected';

  raise notice 'ADMIN AUTHORITY OK ✓ — non-admin: am_i_admin()=false + admin_set_profile_status rejected';
end $$;
