-- =============================================================================
-- Migration: 20260619141000_b11_follows_saved_notifications  ⚠️ REVIEW GEREKLİ — DRAFT, NOT APPLIED
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     B11 — Supporting features: Takip Et / Kaydet / Bildirimler
--
-- WHAT THIS DOES
--   * table public.follows            — agent A follows agent B (own-scoped).
--   * table public.saved_portfolios   — agent bookmarks a portfolio (own-scoped).
--   * table public.notifications      — per-user inbox; system-written, user-read.
--   * RLS ENABLE + FORCE on all three; every row is owned by a user_id and only
--     that user can read/write it. NO anon. notifications are NOT client-insertable
--     (created server-side later via triggers/definer RPC); users may only read +
--     mark-as-read their own rows.
--
-- ====================== WHY THIS IS SAFE (D13) ===============================
-- (1) None of these hold locked/sensitive D13 data. follows/saved store only ids;
--     notifications store a title/body/link the user already has access to. They
--     reference portfolios/profiles by id but expose NO locked column.
-- (2) RLS ENABLED + FORCED, owner-scoped via (select auth.uid()). anon gets NO
--     grants. saved_portfolios/follows: full owner CRUD. notifications: owner gets
--     SELECT + UPDATE(read flag) only — NO client INSERT (no insert grant/policy);
--     they are written by future server-side triggers/definer RPC, so a client
--     cannot fabricate notifications for itself or others.
-- (3) A portfolio reference in saved_portfolios uses ON DELETE CASCADE; following
--     a non-existent / unverified target is prevented by the FK to auth.users.
--
-- APPLY: human `supabase db push`, then regen TS types. Only AFTER that, add the
--   data layers + wire Favoriler / Takip / Bildirimler pages + a notify-writer
--   (trigger or definer RPC) for notifications. See RETURN_CHECKLIST.md.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. follows
-- -----------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id  uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);

alter table public.follows enable row level security;
alter table public.follows force row level security;

-- Owner (the follower) reads/creates/deletes own follow edges.
drop policy if exists follows_select on public.follows;
create policy follows_select on public.follows
  for select using (follower_id = (select auth.uid()));
drop policy if exists follows_insert on public.follows;
create policy follows_insert on public.follows
  for insert with check (follower_id = (select auth.uid()) and public.is_verified());
drop policy if exists follows_delete on public.follows;
create policy follows_delete on public.follows
  for delete using (follower_id = (select auth.uid()));

revoke all on public.follows from public, anon;
grant select, insert, delete on public.follows to authenticated;

-- -----------------------------------------------------------------------------
-- 2. saved_portfolios
-- -----------------------------------------------------------------------------
create table if not exists public.saved_portfolios (
  user_id      uuid not null references auth.users (id) on delete cascade,
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, portfolio_id)
);
create index if not exists saved_portfolios_user_idx on public.saved_portfolios (user_id);

alter table public.saved_portfolios enable row level security;
alter table public.saved_portfolios force row level security;

drop policy if exists saved_select on public.saved_portfolios;
create policy saved_select on public.saved_portfolios
  for select using (user_id = (select auth.uid()));
drop policy if exists saved_insert on public.saved_portfolios;
create policy saved_insert on public.saved_portfolios
  for insert with check (user_id = (select auth.uid()) and public.is_verified());
drop policy if exists saved_delete on public.saved_portfolios;
create policy saved_delete on public.saved_portfolios
  for delete using (user_id = (select auth.uid()));

revoke all on public.saved_portfolios from public, anon;
grant select, insert, delete on public.saved_portfolios to authenticated;

-- -----------------------------------------------------------------------------
-- 3. notifications — system-written, user-read (+ mark read)
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null,
  title      text not null,
  body       text,
  link       jsonb,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, read);

alter table public.notifications enable row level security;
alter table public.notifications force row level security;

-- Owner reads own; owner may UPDATE (only to flip the read flag). NO client INSERT
-- (no insert policy + no insert grant) — written server-side later.
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select using (user_id = (select auth.uid()));
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.notifications from public, anon;
grant select, update on public.notifications to authenticated;

comment on table public.follows is 'B11 Takip: own-scoped follow edges. Member-only, no anon.';
comment on table public.saved_portfolios is 'B11 Kaydet: own-scoped bookmarks. Member-only, no anon.';
comment on table public.notifications is 'B11 Bildirim: per-user inbox; system-written, user reads + marks read. No client insert.';
