-- =============================================================================
-- Migration: 20260619082344_m3_controlled_access
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     M3 — Controlled-access engine (the product's heart)
--
-- WHAT THIS DOES
--   * enum  public.detail_request_status ('pending','approved','rejected').
--   * table public.detail_requests        — member-only Detay Talepleri (D5).
--   * table public.portfolio_access_grants — bulk (D6) + permanent (D7) unlocks.
--   * WIDENS public.has_portfolio_access() — the SINGLE locked-data gate — from
--     owner-only to: owner OR an ACTIVE grant. SIGNATURE IS UNCHANGED, so every
--     M2 locked-data SELECT policy (portfolio_private / locked portfolio_images /
--     portfolio_documents) becomes grant-aware with ZERO policy edits.
--   * SECURITY DEFINER RPCs that encapsulate every write:
--       request_detail()         — verified non-owner asks for an active portfolio
--       approve_detail_request() — owner approves → ONE bulk+permanent grant
--       reject_detail_request()  — owner rejects → NO grant
--   * RLS: enable + FORCE on both new tables; SELECT-only policies; NO write
--     policies and NO write grants — writes happen ONLY through the definer RPCs.
--
-- ====================== WHY THIS IS SAFE =====================================
-- (1) has_portfolio_access(uuid, uuid) keeps its EXACT signature (same name, arg
--     names/types/defaults, return type). Only its BODY widens. The M2 policies
--     on portfolio_private, locked portfolio_images and portfolio_documents
--     already call this predicate, so they inherit grant-awareness automatically
--     — no policy is rewritten and there is no window where the gate is bypassed.
-- (2) Clients CANNOT write detail_requests or portfolio_access_grants directly:
--     both tables have RLS ENABLED + FORCED, have NO insert/update/delete
--     policies, and authenticated gets ONLY `select` (no write) grants. The only
--     thing that mutates them is the SECURITY DEFINER RPCs below, which run as the
--     function owner (bypassing RLS) AFTER validating the caller.
-- (3) Authorization is enforced inside the RPCs: request_detail requires a
--     VERIFIED, NON-owner caller on an ACTIVE portfolio; approve/reject require
--     the caller to be the portfolio OWNER (owns_portfolio). Nobody can approve a
--     grant for a portfolio they do not own.
-- (4) RLS is FORCED on both tables and EVERY policy uses (select auth.uid()) (the
--     initplan perf idiom and the repo convention). detail_requests is visible
--     only to its requester or owner; grants only to grantee or portfolio owner.
-- (5) Grants are BULK (D6 — one grant row unlocks the whole locked field set, not
--     per-column) and PERMANENT (D7 — expires_at IS NULL; no revoke UI yet). Even
--     so, the hook still honors revoked_at and expires_at, so a future revoke /
--     expiring grant works without touching this gate again.
--
-- INVARIANT #2 (CLAUDE.md): locked-field visibility is decided on GRANTS via
--   has_portfolio_access(), NEVER on detail_requests.status. The status column is
--   inbox bookkeeping only; no RLS policy anywhere reads it.
--
-- APPLY: a human runs `supabase db push`. Do NOT auto-apply. Regenerate TS types
--   afterwards (the 2 new tables, 1 enum and 3 new RPCs will appear). gen_random_uuid()
--   is the same default the M2 tables use (pgcrypto, available in PG13+/PG14).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENUM
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'detail_request_status') then
    create type public.detail_request_status as enum ('pending', 'approved', 'rejected');
  end if;
end$$;

-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

-- public.detail_requests — a member's Detay Talebi for a portfolio (D5).
-- requester_id is NOT NULL → only logged-in members can have a request; a
-- non-logged-in customer who taps "Detay Talebi" is routed to login (D22).
-- owner_id is denormalized (copied from the portfolio at insert time inside the
-- RPC) so the owner's inbox and the SELECT policy do not need a join.
create table if not exists public.detail_requests (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios (id) on delete cascade,
  requester_id  uuid not null references public.profiles (id),   -- member-only (D5)
  owner_id      uuid not null references public.profiles (id),   -- denormalized for inbox/RLS
  message       text,
  status        public.detail_request_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.detail_requests is
  'Detay Talepleri (D5, member-only). Inbox/state bookkeeping ONLY — Invariant #2: no RLS anywhere reads .status to decide locked visibility; that is decided on portfolio_access_grants via has_portfolio_access(). owner_id is denormalized from the portfolio for the owner inbox + SELECT policy. Writes happen ONLY via the SECURITY DEFINER RPCs (no write RLS policies, no write grants).';

create index if not exists detail_requests_owner_idx     on public.detail_requests (owner_id);
create index if not exists detail_requests_requester_idx on public.detail_requests (requester_id);
create index if not exists detail_requests_portfolio_idx on public.detail_requests (portfolio_id);

-- At most ONE pending request per (portfolio, requester). Partial unique index so
-- approved/rejected history rows don't collide. Defends idempotency at the DB
-- level even if request_detail()'s pre-check races.
create unique index if not exists detail_requests_one_pending_idx
  on public.detail_requests (portfolio_id, requester_id)
  where status = 'pending';

-- public.portfolio_access_grants — the unlock record. ONE active row makes
-- has_portfolio_access() true for (portfolio, grantee). BULK (D6: unlocks the
-- whole locked field set) + PERMANENT (D7: expires_at NULL). revoked_at is for a
-- future revoke flow; the gate already honors it.
create table if not exists public.portfolio_access_grants (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios (id) on delete cascade,
  grantee_id    uuid not null references public.profiles (id),
  granted_by    uuid not null references public.profiles (id),
  request_id    uuid references public.detail_requests (id),   -- nullable: grants may be created without a request later
  created_at    timestamptz not null default now(),
  expires_at    timestamptz,                                    -- NULL = permanent (D7)
  revoked_at    timestamptz                                     -- NULL = active
);

comment on table public.portfolio_access_grants is
  'Unlock records. ONE ACTIVE row (revoked_at IS NULL and (expires_at IS NULL or expires_at > now())) makes has_portfolio_access() true for (portfolio_id, grantee_id). D6 bulk: one row unlocks the entire locked field set. D7 permanent: expires_at NULL. Writes ONLY via approve_detail_request() (definer RPC); no write RLS policies, no write grants.';

-- Active-grant lookup index that mirrors the EXISTS in has_portfolio_access().
create index if not exists portfolio_access_grants_active_idx
  on public.portfolio_access_grants (portfolio_id, grantee_id)
  where revoked_at is null;

-- -----------------------------------------------------------------------------
-- 3. WIDEN THE HOOK — has_portfolio_access()
--    SIGNATURE MUST NOT CHANGE. Body widens from owner-only to owner OR active
--    grant. Body uses the bare auth.uid() default arg (POLICIES wrap as
--    (select auth.uid()); helper bodies do not — repo convention). Every M2
--    locked-data SELECT policy already calls this, so they all become
--    grant-aware here with NO policy edits.
-- -----------------------------------------------------------------------------

create or replace function public.has_portfolio_access(
  _portfolio_id uuid,
  _user_id      uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  -- owner OR an ACTIVE grant. M2 policies on portfolio_private / locked
  -- portfolio_images / portfolio_documents inherit this automatically.
  select public.owns_portfolio(_portfolio_id, _user_id)
      or exists (
        select 1
        from public.portfolio_access_grants g
        where g.portfolio_id = _portfolio_id
          and g.grantee_id   = _user_id
          and g.revoked_at is null
          and (g.expires_at is null or g.expires_at > now())
      );
$$;

comment on function public.has_portfolio_access(uuid, uuid) is
  'Locked-data gate (Invariant #2: decided on GRANTS, never on detail_requests.status). M3: owner OR an ACTIVE portfolio_access_grants row (bulk D6, permanent D7; revoked_at/expires_at honored for future-proofing). Signature unchanged from M2 — every locked-data SELECT policy (portfolio_private / locked portfolio_images / portfolio_documents) inherits grant-awareness with no policy edits.';

-- has_portfolio_access execute grant was already set in M2 (authenticated only).
-- create or replace preserves existing privileges, so no re-grant is needed here.

-- -----------------------------------------------------------------------------
-- 4. RPCs (SECURITY DEFINER) — the ONLY write path for the two tables.
--    All: SECURITY DEFINER, pinned search_path, execute revoked from public/anon
--    and granted to authenticated (NOT anon — members only).
-- -----------------------------------------------------------------------------

-- request_detail: a verified, non-owner member asks for access to an ACTIVE
-- portfolio. Idempotent: an existing pending request is returned unchanged (also
-- guarded by detail_requests_one_pending_idx). Raises on not-verified, portfolio
-- not found / not active, or requesting one's own portfolio.
create or replace function public.request_detail(
  _portfolio_id uuid,
  _message      text default null
)
returns public.detail_requests
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller   uuid := (select auth.uid());
  pf       record;
  existing public.detail_requests;
  inserted public.detail_requests;
begin
  if caller is null then
    raise exception 'Yetkisiz: oturum bulunamadı.' using errcode = '28000';
  end if;

  -- D5/D27: only verified members can send a request.
  if not public.is_verified(caller) then
    raise exception 'Detay talebi için doğrulanmış üye olmalısınız.' using errcode = '42501';
  end if;

  -- Load the portfolio; it must exist and be active.
  select p.id, p.owner_id, p.status
    into pf
  from public.portfolios p
  where p.id = _portfolio_id;

  if not found then
    raise exception 'Portföy bulunamadı.' using errcode = 'P0002';
  end if;

  if pf.status <> 'active'::public.portfolio_status then
    raise exception 'Bu portföy aktif değil; detay talebi gönderilemez.' using errcode = '42501';
  end if;

  -- Can't request access to your own portfolio.
  if pf.owner_id = caller then
    raise exception 'Kendi portföyünüz için detay talebi gönderemezsiniz.' using errcode = '42501';
  end if;

  -- Idempotent: return an existing pending request unchanged.
  select dr.*
    into existing
  from public.detail_requests dr
  where dr.portfolio_id = _portfolio_id
    and dr.requester_id = caller
    and dr.status = 'pending'::public.detail_request_status
  limit 1;

  if found then
    return existing;
  end if;

  -- Insert a fresh pending request; owner_id derived from the portfolio.
  insert into public.detail_requests (portfolio_id, requester_id, owner_id, message, status)
  values (_portfolio_id, caller, pf.owner_id, _message, 'pending'::public.detail_request_status)
  returning * into inserted;

  return inserted;
end;
$$;

comment on function public.request_detail(uuid, text) is
  'D5: verified, NON-owner member requests access to an ACTIVE portfolio. Idempotent (returns an existing pending row; also guarded by detail_requests_one_pending_idx). Raises on unverified caller, missing/inactive portfolio, or own portfolio. owner_id is derived from the portfolio. SECURITY DEFINER so it can insert despite the no-write RLS on detail_requests.';

-- approve_detail_request: portfolio owner approves a request. Atomic + idempotent:
-- if already approved, returns the existing ACTIVE grant; else marks the request
-- approved and creates ONE bulk (D6) + permanent (D7) grant. Caller must own the
-- portfolio.
create or replace function public.approve_detail_request(
  _request_id uuid
)
returns public.portfolio_access_grants
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller   uuid := (select auth.uid());
  req      public.detail_requests;
  existing public.portfolio_access_grants;
  granted  public.portfolio_access_grants;
begin
  if caller is null then
    raise exception 'Yetkisiz: oturum bulunamadı.' using errcode = '28000';
  end if;

  select dr.* into req
  from public.detail_requests dr
  where dr.id = _request_id;

  if not found then
    raise exception 'Detay talebi bulunamadı.' using errcode = 'P0002';
  end if;

  -- Only the portfolio owner may approve.
  if not public.owns_portfolio(req.portfolio_id, caller) then
    raise exception 'Yalnızca portföy sahibi talebi onaylayabilir.' using errcode = '42501';
  end if;

  -- Idempotent: if there is already an ACTIVE grant for this (portfolio, requester),
  -- ensure the request reads approved and return that grant — never a duplicate.
  select g.* into existing
  from public.portfolio_access_grants g
  where g.portfolio_id = req.portfolio_id
    and g.grantee_id   = req.requester_id
    and g.revoked_at is null
    and (g.expires_at is null or g.expires_at > now())
  limit 1;

  if found then
    if req.status <> 'approved'::public.detail_request_status then
      update public.detail_requests
      set status = 'approved'::public.detail_request_status,
          updated_at = now()
      where id = req.id;
    end if;
    return existing;
  end if;

  -- Mark the request approved.
  update public.detail_requests
  set status = 'approved'::public.detail_request_status,
      updated_at = now()
  where id = req.id;

  -- Create ONE bulk (D6) + permanent (D7, expires_at NULL) grant.
  insert into public.portfolio_access_grants
    (portfolio_id, grantee_id, granted_by, request_id, expires_at, revoked_at)
  values
    (req.portfolio_id, req.requester_id, caller, req.id, null, null)
  returning * into granted;

  return granted;
end;
$$;

comment on function public.approve_detail_request(uuid) is
  'Portfolio owner approves a request. Atomic + idempotent: returns the existing ACTIVE grant if one exists (no duplicate); else sets status=approved and inserts ONE bulk (D6) + permanent (D7, expires_at NULL) grant. Caller must own the portfolio (owns_portfolio). SECURITY DEFINER so it can write both no-write-RLS tables after validating ownership.';

-- reject_detail_request: portfolio owner rejects a request. Creates NO grant.
-- No-op return if already rejected.
create or replace function public.reject_detail_request(
  _request_id uuid
)
returns public.detail_requests
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller  uuid := (select auth.uid());
  req     public.detail_requests;
  updated public.detail_requests;
begin
  if caller is null then
    raise exception 'Yetkisiz: oturum bulunamadı.' using errcode = '28000';
  end if;

  select dr.* into req
  from public.detail_requests dr
  where dr.id = _request_id;

  if not found then
    raise exception 'Detay talebi bulunamadı.' using errcode = 'P0002';
  end if;

  -- Only the portfolio owner may reject.
  if not public.owns_portfolio(req.portfolio_id, caller) then
    raise exception 'Yalnızca portföy sahibi talebi reddedebilir.' using errcode = '42501';
  end if;

  -- No-op if already rejected.
  if req.status = 'rejected'::public.detail_request_status then
    return req;
  end if;

  update public.detail_requests
  set status = 'rejected'::public.detail_request_status,
      updated_at = now()
  where id = req.id
  returning * into updated;

  -- Deliberately NO grant created. Rejecting never unlocks anything.
  return updated;
end;
$$;

comment on function public.reject_detail_request(uuid) is
  'Portfolio owner rejects a request. Sets status=rejected (no-op if already rejected); creates NO grant. Caller must own the portfolio. Invariant #2: rejection is bookkeeping; locked visibility is governed by grants, not request status.';

-- Lock down RPC execution: revoke from public/anon, grant to authenticated only.
revoke execute on function public.request_detail(uuid, text)         from public, anon;
revoke execute on function public.approve_detail_request(uuid)        from public, anon;
revoke execute on function public.reject_detail_request(uuid)         from public, anon;

grant execute on function public.request_detail(uuid, text)           to authenticated;
grant execute on function public.approve_detail_request(uuid)         to authenticated;
grant execute on function public.reject_detail_request(uuid)          to authenticated;

-- -----------------------------------------------------------------------------
-- 5. RLS ENABLE + FORCE
-- -----------------------------------------------------------------------------

alter table public.detail_requests        enable row level security;
alter table public.detail_requests        force  row level security;

alter table public.portfolio_access_grants enable row level security;
alter table public.portfolio_access_grants force  row level security;

-- -----------------------------------------------------------------------------
-- 6. POLICIES
--    SELECT-only. NO insert/update/delete policies on EITHER table: with RLS
--    FORCED and no write grants, clients cannot mutate these tables at all —
--    only the SECURITY DEFINER RPCs (running as the function owner) do. Every
--    policy wraps auth.uid() as (select auth.uid()) (initplan perf / repo style).
-- -----------------------------------------------------------------------------

-- ---- detail_requests ---------------------------------------------------------
-- SELECT: the requester (their sent requests) or the portfolio owner (inbox).
drop policy if exists detail_requests_select on public.detail_requests;
create policy detail_requests_select
  on public.detail_requests
  for select
  to authenticated
  using (
    (select auth.uid()) = requester_id
    or (select auth.uid()) = owner_id
  );

-- NO insert/update/delete policies (RPC-only writes; FORCE RLS + no write grant
-- means a direct client write is denied).

-- ---- portfolio_access_grants -------------------------------------------------
-- SELECT: the grantee (their unlocks) or the portfolio owner (who they granted).
drop policy if exists portfolio_access_grants_select on public.portfolio_access_grants;
create policy portfolio_access_grants_select
  on public.portfolio_access_grants
  for select
  to authenticated
  using (
    (select auth.uid()) = grantee_id
    or public.owns_portfolio(portfolio_id, (select auth.uid()))
  );

-- NO insert/update/delete policies (RPC-only writes).

-- -----------------------------------------------------------------------------
-- 7. TABLE GRANTS
--    SELECT ONLY to authenticated (so the SELECT policies apply). NO write grants
--    to authenticated or anon — writes are exclusively via the definer RPCs.
-- -----------------------------------------------------------------------------

grant select on public.detail_requests        to authenticated;
grant select on public.portfolio_access_grants to authenticated;
