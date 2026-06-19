-- =============================================================================
-- Migration: 20260619140000_b7_searches  ⚠️ REVIEW GEREKLİ — DRAFT, NOT APPLIED
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     B7 — Arayış (buyer search / talep ilanı)
--
-- WHAT THIS DOES
--   * enums public.search_status ('active','matched','closed') and
--     public.search_urgency ('low','medium','high').
--   * table public.searches — a verified agent's "şunu arıyorum" criteria for a
--     customer (region / type / budget / rooms / features). MEMBER-ONLY: it is
--     shared inside the verified network for matching, NOT public/anon.
--   * RLS: ENABLE + FORCE. Members (is_verified) read ACTIVE searches; an owner
--     reads ALL of their own (any status). Owner writes/updates/deletes ONLY own
--     rows. NO anon access. NO security-definer RPC needed: owner-scoped writes
--     are plain RLS (no cross-user authority is granted, unlike M3 grants).
--
-- ====================== WHY THIS IS SAFE (D13) ===============================
-- (1) searches holds NO locked/sensitive D13 fields — no exact address, no
--     malik/owner PII, no documents, no customer name/phone. It stores only
--     search CRITERIA + the agent's own free-text note (intended for the network).
--     So there is no locked-table split to make and nothing for a teaser/anon path
--     to leak. It is member-only by RLS, never anon (no anon grant, no RPC).
-- (2) RLS ENABLED + FORCED. SELECT requires is_verified() AND (status='active'
--     OR owner). INSERT/UPDATE/DELETE require owner_id = (select auth.uid()).
--     anon role gets NO grants. Every policy uses (select auth.uid()) (initplan
--     idiom + repo convention).
-- (3) is_verified() already exists (M1); reused unchanged.
--
-- APPLY: a human runs `supabase db push`, then regenerate TS types (the 2 enums +
--   1 table appear). Only AFTER that, add src/lib/data/searches.ts + wire the
--   my-searches pages and flip featureFlags.arayis (see RETURN_CHECKLIST.md).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENUMS (idempotent)
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'search_status') then
    create type public.search_status as enum ('active', 'matched', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'search_urgency') then
    create type public.search_urgency as enum ('low', 'medium', 'high');
  end if;
end$$;

-- -----------------------------------------------------------------------------
-- 2. TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.searches (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users (id) on delete cascade,
  title            text not null,
  transaction_type public.transaction_type not null,
  category         public.portfolio_category not null,
  city             text,
  district         text,
  neighborhood     text,
  budget_min       numeric,
  budget_max       numeric,
  currency         public.currency not null default 'TRY',
  room_count       text,
  min_m2           integer,
  features         text[] not null default '{}',
  urgency          public.search_urgency not null default 'medium',
  status           public.search_status not null default 'active',
  -- agent's own description of the need; member-readable (shared for matching).
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists searches_owner_idx  on public.searches (owner_id);
create index if not exists searches_status_idx on public.searches (status);
create index if not exists searches_geo_idx     on public.searches (city, district);

-- -----------------------------------------------------------------------------
-- 3. RLS — enable + FORCE
-- -----------------------------------------------------------------------------
alter table public.searches enable row level security;
alter table public.searches force row level security;

-- Members read ACTIVE searches (for matching); owner reads own (any status).
drop policy if exists searches_select on public.searches;
create policy searches_select on public.searches
  for select
  using (
    public.is_verified()
    and (status = 'active' or owner_id = (select auth.uid()))
  );

-- Owner-only writes (verified). No cross-user authority → plain RLS, no RPC.
drop policy if exists searches_insert on public.searches;
create policy searches_insert on public.searches
  for insert
  with check (owner_id = (select auth.uid()) and public.is_verified());

drop policy if exists searches_update on public.searches;
create policy searches_update on public.searches
  for update
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists searches_delete on public.searches;
create policy searches_delete on public.searches
  for delete
  using (owner_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- 4. GRANTS — authenticated only (RLS restricts to own/active). NO anon.
-- -----------------------------------------------------------------------------
revoke all on public.searches from public, anon;
grant select, insert, update, delete on public.searches to authenticated;

comment on table public.searches is
  'B7 Arayış: verified agent buyer-search criteria. Member-only (is_verified), owner-writes. No D13 locked fields → no anon, no locked split.';
