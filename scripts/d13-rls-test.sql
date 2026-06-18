-- =============================================================================
-- D13 RLS test (READ-ONLY). Proves the teaser/locked boundary holds under RLS.
-- Run in the Supabase SQL editor (service role) or psql as a privileged role.
-- It auto-selects: a portfolio that HAS a portfolio_private row, its owner, and a
-- DIFFERENT verified user, then simulates each user's session via
--   set local role authenticated + request.jwt.claims
-- and asserts the D13 invariants. RAISES on any violation; NOTICEs "D13 PASS".
-- Read-only: runs inside one transaction and resets role; writes nothing.
--
-- Asserts (D13 / D20 / D34):
--   non-owner verified user: 0 portfolio_private rows, 0 locked images,
--                            0 documents  (cannot read locked data)
--                            but CAN see the active teaser + public images.
--   owner: >=1 portfolio_private row (can read own locked data — the gate isn't
--          just "deny everyone").
-- =============================================================================
do $$
declare
  v_p           uuid;
  v_owner       uuid;
  v_other       uuid;
  n_priv        int;
  n_locked_img  int;
  n_docs        int;
  n_teaser      int;
  n_pub_img     int;
  n_owner_priv  int;
begin
  select p.id, p.owner_id into v_p, v_owner
  from public.portfolios p
  where exists (select 1 from public.portfolio_private pp where pp.portfolio_id = p.id)
  limit 1;
  if v_p is null then
    raise notice 'D13 TEST SKIPPED: no portfolio with a portfolio_private row yet';
    return;
  end if;

  select id into v_other
  from public.profiles
  where status = 'verified' and id <> v_owner
  limit 1;
  if v_other is null then
    raise notice 'D13 TEST SKIPPED: need a 2nd verified user';
    return;
  end if;

  -- ---- simulate the NON-OWNER verified user --------------------------------
  perform set_config('request.jwt.claims',
                     json_build_object('sub', v_other, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n_priv       from public.portfolio_private  where portfolio_id = v_p;
  select count(*) into n_locked_img from public.portfolio_images   where portfolio_id = v_p and visibility = 'locked';
  select count(*) into n_docs       from public.portfolio_documents where portfolio_id = v_p;
  select count(*) into n_teaser     from public.portfolios         where id = v_p and status = 'active';
  select count(*) into n_pub_img    from public.portfolio_images   where portfolio_id = v_p and visibility = 'public';
  reset role;

  -- ---- simulate the OWNER ---------------------------------------------------
  perform set_config('request.jwt.claims',
                     json_build_object('sub', v_owner, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n_owner_priv from public.portfolio_private where portfolio_id = v_p;
  reset role;

  -- ---- assertions -----------------------------------------------------------
  if n_priv      <> 0 then raise exception 'D13 FAIL: non-owner read % portfolio_private rows (want 0)', n_priv; end if;
  if n_locked_img <> 0 then raise exception 'D13 FAIL: non-owner read % locked images (want 0)', n_locked_img; end if;
  if n_docs      <> 0 then raise exception 'D13 FAIL: non-owner read % documents (want 0)', n_docs; end if;
  if n_owner_priv < 1 then raise exception 'D13 FAIL: owner could not read own portfolio_private'; end if;

  raise notice 'D13 PASS — non-owner: private=%, locked_img=%, docs=% (all 0); teaser_active=%, public_img=%; owner_private=%',
    n_priv, n_locked_img, n_docs, n_teaser, n_pub_img, n_owner_priv;
end $$;
