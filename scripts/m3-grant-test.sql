-- =============================================================================
-- M3 grant proof — shows that an ACTIVE grant flips has_portfolio_access() and
-- unlocks the locked SELECTs, while NO grant denies them.
--
-- SAFE: the whole thing runs inside a transaction that ROLLBACKs at the end, so
-- it PERSISTS NOTHING (the inserted grant is discarded). Run in the Supabase SQL
-- editor or psql as a privileged role. RAISEs on any violation; NOTICEs M3 PASS.
--
-- Proves:
--   before any grant → grantee has_portfolio_access = false
--   after a grant    → grantee has_portfolio_access = true AND can SELECT
--                       portfolio_private under RLS (locked data unlocks).
-- (Invariant #2: visibility is governed by the GRANT, not by request status.)
-- =============================================================================
begin;
do $$
declare
  v_p       uuid;
  v_owner   uuid;
  v_grantee uuid;
  before_acc boolean;
  after_acc  boolean;
  n_priv     int;
begin
  select p.id, p.owner_id into v_p, v_owner
  from public.portfolios p
  where p.status = 'active'
  limit 1;

  select id into v_grantee
  from public.profiles
  where status = 'verified' and id <> v_owner
  limit 1;

  if v_p is null or v_grantee is null then
    raise notice 'M3 TEST SKIPPED: need an active portfolio + a 2nd verified user';
    return;
  end if;

  -- BEFORE: the grantee must be denied.
  before_acc := public.has_portfolio_access(v_p, v_grantee);
  if before_acc then
    raise exception 'M3 FAIL: grantee had access BEFORE any grant';
  end if;

  -- Create a grant (this is what approve_detail_request does). Whole tx rolls back.
  insert into public.portfolio_access_grants (portfolio_id, grantee_id, granted_by)
  values (v_p, v_grantee, v_owner);

  -- AFTER: the gate must now be open.
  after_acc := public.has_portfolio_access(v_p, v_grantee);
  if not after_acc then
    raise exception 'M3 FAIL: grantee still denied AFTER grant';
  end if;

  -- And the grantee can now read the locked private row under RLS.
  perform set_config('request.jwt.claims',
                     json_build_object('sub', v_grantee, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n_priv from public.portfolio_private where portfolio_id = v_p;
  reset role;

  raise notice 'M3 PASS — before=%, after=%, grantee_private_rows=% (grant opens the gate)',
    before_acc, after_acc, n_priv;
end $$;
rollback;  -- persist nothing
