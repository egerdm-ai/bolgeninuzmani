-- =============================================================================
-- Migration: 20260618190718_m2_portfolios
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     M2 — Portföy CRUD schema (teaser vs locked split)
--
-- WHAT THIS DOES
--   * Defines portfolio enums (transaction_type, portfolio_status,
--     portfolio_category, currency, document_kind).
--   * Creates the TEASER table public.portfolios (PUBLIC columns only — no exact
--     location, no malik/owner-of-property info) plus public.portfolio_images.
--   * Creates the LOCKED data tables (D13/D20), kept in SEPARATE tables so RLS
--     (row-level, cannot hide columns) can gate them independently:
--       - public.portfolio_private    (1:1 with portfolios; the locked field set)
--       - public.portfolio_documents  (locked files; object paths in a PRIVATE bucket)
--   * Adds SECURITY DEFINER helpers used by RLS without recursion:
--     owns_portfolio(), portfolio_teaser_visible(), has_portfolio_access().
--   * Adds slug derivation (generate_portfolio_slug + BEFORE INSERT trigger) and
--     a SERVER-SIDE coarse approx-pin derivation (derive_approx + a trigger on
--     portfolio_private that writes portfolios.approx_lat/lng) — exact coords
--     NEVER live in the teaser table.
--   * Enables + FORCES RLS on all four tables and defines policies.
--
-- THE D13 SPLIT (most critical invariant honored here)
--   Postgres RLS is row-level and cannot hide individual columns. If locked
--   fields lived as columns on portfolios, any agent who gets SELECT on a teaser
--   row would also read the locked columns. So locked data lives in SEPARATE
--   tables (portfolio_private, portfolio_documents) with their own RLS. The
--   teaser table holds PUBLIC columns ONLY. The anon public `/p/$slug` teaser is
--   served later via a SECURITY DEFINER view/RPC (D13) — anon never touches the
--   portfolios base table; there is intentionally NO anon policy here.
--
-- THE M3 GRANT HOOK (forward-compatible; no policy churn later)
--   has_portfolio_access() is the SINGLE predicate that all locked-data SELECT
--   policies call. In M2 its body is OWNER-ONLY. M3 will EXTEND only this
--   function's body to: owner OR EXISTS an active row in
--   portfolio_access_grants(portfolio_id, agent_id = _user_id, expires_at IS NULL
--   per D6/D7 bulk + permanent). Because policies already call the helper, M3
--   edits one function body and touches no policies.
--
-- DECISIONS HONORED
--   D13 — locked data in SEPARATE table(s), own RLS; teaser is public-only.
--   D20 — locked field set: exact_lat/exact_lng, exact_address, malik_info,
--         private_description, private_notes (+ documents/tapu files).
--   D8  — the AGENT'S OWN contact lives on profiles (M1) and is OPEN; it is NOT
--         in portfolio_private. malik_info (property owner) IS locked here.
--   D27 — verification gate: only verified agents create/own/read network teasers
--         (reuses is_verified() from M1).
--   D30 — coarse approx pin derived server-side from the exact coords; teaser
--         never reveals exact.
--   Invariant #1 — locked fields never reach teaser/list/public/customer paths.
--   Invariant #2 — locked visibility decided on grants (has_portfolio_access),
--         never on detail_requests.status.
--
-- NOT IN THIS FILE (separate steps)
--   * The PRIVATE storage bucket for portfolio_documents and its storage RLS
--     (short-lived, access-checked signed URLs) — done in the dashboard or a
--     dedicated storage migration, not here.
--   * Auth provider config and TS type regeneration — after this applies.
--
-- APPLY: a human runs `supabase db push`. Do NOT auto-apply. Regenerate TS
-- types after this lands.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'transaction_type') then
    create type public.transaction_type as enum ('satilik', 'kiralik');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'portfolio_status') then
    create type public.portfolio_status as enum ('draft', 'active', 'passive', 'sold');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'portfolio_category') then
    create type public.portfolio_category as enum
      ('konut', 'ticari', 'arsa', 'turizm', 'isletme', 'ozel_varlik');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'currency') then
    create type public.currency as enum ('TRY', 'USD', 'EUR');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_kind') then
    create type public.document_kind as enum
      ('tapu', 'ruhsat', 'imar_plani', 'proje', 'pdf', 'diger');
  end if;
end$$;

-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

-- public.portfolios — TEASER table. PUBLIC columns ONLY (D13/Invariant #1).
-- NO exact location, NO owner-of-property/malik info, NO private notes — those
-- live in portfolio_private / portfolio_documents.
create table if not exists public.portfolios (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references public.profiles (id) on delete cascade,

  title              text not null,
  public_description text,

  price              numeric(14, 2),
  currency           public.currency not null default 'TRY',

  transaction_type   public.transaction_type   not null,
  category           public.portfolio_category not null,
  subcategory        text,

  room_count         text,        -- e.g. "5+1"
  gross_m2           integer,
  net_m2             integer,
  land_m2            integer,

  features           text[] not null default '{}',

  city               text,
  district           text,
  neighborhood       text,

  -- COARSE pin ONLY (D30). Derived server-side from portfolio_private.exact_lat/lng
  -- by the approx trigger. The EXACT coordinates NEVER live in this teaser table.
  approx_lat         double precision,
  approx_lng         double precision,

  status             public.portfolio_status not null default 'draft',

  -- derived from title by generate_portfolio_slug via BEFORE INSERT trigger
  slug               text not null unique,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.portfolios is
  'TEASER table — PUBLIC columns only (D13/Invariant #1). Locked data lives in portfolio_private and portfolio_documents. approx_lat/lng are COARSE pins (D30); exact coords are never stored here.';
comment on column public.portfolios.approx_lat is
  'D30: coarse, server-derived approximation of exact_lat. Exact coords live ONLY in portfolio_private. Never write exact values here.';
comment on column public.portfolios.approx_lng is
  'D30: coarse, server-derived approximation of exact_lng. Exact coords live ONLY in portfolio_private. Never write exact values here.';

create index if not exists portfolios_owner_idx           on public.portfolios (owner_id);
create index if not exists portfolios_status_idx          on public.portfolios (status);
create index if not exists portfolios_slug_idx            on public.portfolios (slug);
create index if not exists portfolios_city_district_idx   on public.portfolios (city, district);

-- public.portfolio_images — PUBLIC/teaser images.
create table if not exists public.portfolio_images (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios (id) on delete cascade,
  path          text not null,
  sort_order    integer not null default 0,
  is_cover      boolean not null default false
);

comment on table public.portfolio_images is
  'PUBLIC/teaser images for a portfolio. Visibility mirrors portfolios teaser via portfolio_teaser_visible().';

create index if not exists portfolio_images_portfolio_idx on public.portfolio_images (portfolio_id);

-- public.portfolio_private — D13/D20: the LOCKED field set, 1:1 with portfolios,
-- in a SEPARATE table with its own RLS. M2 RLS is owner-only; M3 makes the SELECT
-- grant-aware via has_portfolio_access().
create table if not exists public.portfolio_private (
  portfolio_id        uuid primary key references public.portfolios (id) on delete cascade,
  exact_address       text,
  exact_lat           double precision,
  exact_lng           double precision,
  malik_info          jsonb,   -- property owner name + contact (locked; distinct from D8 agent contact)
  private_description text,
  private_notes       text
);

comment on table public.portfolio_private is
  'D13/D20: the LOCKED field set (exact_address, exact_lat/lng, malik_info, private_description, private_notes). SEPARATE table so RLS can gate it independently of the teaser row. M2: owner-only; M3: grant-aware via has_portfolio_access(). malik_info is the property owner''s info and is LOCKED — distinct from the agent''s own OPEN contact (D8, on profiles).';

-- public.portfolio_documents — D20: locked files (tapu/ruhsat/etc.). The `path`
-- references an object in the PRIVATE storage bucket (bucket + storage RLS +
-- short-lived signed URLs are a SEPARATE step, not in this migration).
create table if not exists public.portfolio_documents (
  id            uuid primary key default gen_random_uuid(),
  portfolio_id  uuid not null references public.portfolios (id) on delete cascade,
  path          text not null,                       -- object path in the PRIVATE bucket
  kind          public.document_kind not null default 'diger',
  uploaded_at   timestamptz not null default now()
);

comment on table public.portfolio_documents is
  'D20: LOCKED documents (tapu/ruhsat/imar/proje/pdf). path = object path in the PRIVATE storage bucket; serve via short-lived, access-checked signed URLs (separate storage step). RLS SELECT is grant-aware via has_portfolio_access().';

create index if not exists portfolio_documents_portfolio_idx on public.portfolio_documents (portfolio_id);

-- -----------------------------------------------------------------------------
-- 3. SECURITY DEFINER HELPERS
--    Used by RLS to avoid recursion. SECURITY DEFINER, pinned search_path,
--    execute revoked from public/anon and granted to authenticated.
--    NOTE: helper BODIES use plain auth.uid() (the default arg); POLICIES wrap
--    it as (select auth.uid()) for the initplan perf pattern.
-- -----------------------------------------------------------------------------

-- owns_portfolio: is _user_id the owner of _portfolio_id?
create or replace function public.owns_portfolio(
  _portfolio_id uuid,
  _user_id      uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.portfolios p
    where p.id = _portfolio_id
      and p.owner_id = _user_id
  );
$$;

comment on function public.owns_portfolio(uuid, uuid) is
  'True if _user_id (default auth.uid()) owns _portfolio_id. Used by owner-write policies and by the other portfolio helpers.';

-- portfolio_teaser_visible: who may see the teaser row / its images?
-- Owner always; otherwise a verified agent may see an 'active' portfolio (D27).
-- Mirrors the portfolios teaser SELECT policy without RLS recursion, so
-- portfolio_images can reuse it directly.
create or replace function public.portfolio_teaser_visible(
  _portfolio_id uuid,
  _user_id      uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.owns_portfolio(_portfolio_id, _user_id)
      or (
        public.is_verified(_user_id)
        and exists (
          select 1
          from public.portfolios p
          where p.id = _portfolio_id
            and p.status = 'active'::public.portfolio_status
        )
      );
$$;

comment on function public.portfolio_teaser_visible(uuid, uuid) is
  'Teaser visibility predicate: owner, OR a verified agent (D27) viewing an active portfolio. Used by portfolio_images SELECT to match portfolios teaser visibility without recursion.';

-- has_portfolio_access: THE locked-data gate. M2 = OWNER-ONLY.
--
-- ============================ M3 GRANT HOOK ============================
-- M3 will EXTEND this function BODY to:
--     owner OR EXISTS an active row in
--       portfolio_access_grants(portfolio_id = _portfolio_id,
--                               agent_id     = _user_id)
--     (grants are bulk + permanent — D6/D7 — so expires_at IS NULL).
-- All locked-data SELECT policies already call this helper, so M3 only edits
-- this body and changes NO policies. Do not inline grant logic into policies.
-- ======================================================================
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
  -- M2: owner-only. M3 extends to: owner OR active portfolio_access_grants row.
  select public.owns_portfolio(_portfolio_id, _user_id);
$$;

comment on function public.has_portfolio_access(uuid, uuid) is
  'Locked-data gate (Invariant #2: decided on grants, never on detail_requests.status). M2 = owner-only. M3 EXTENDS this body to owner OR active portfolio_access_grants row (bulk+permanent, D6/D7); policies already call it so M3 touches no policies.';

-- derive_approx: D30 coarse pin from exact coords. Rounds to ~2 decimals (~1km
-- grid) then adds a small DETERMINISTIC offset seeded by the portfolio id, so
-- the pin is stable per portfolio and not merely grid-snapped, while total
-- displacement stays a few hundred metres. When a neighborhood-centers table
-- exists (later), prefer the neighborhood centroid instead.
create or replace function public.derive_approx(
  _lat  double precision,
  _lng  double precision,
  _seed uuid
)
returns table (approx_lat double precision, approx_lng double precision)
language sql
immutable
as $$
  -- Two stable, deterministic unit values in [0,1) from the md5 of the seed.
  -- ('x'||hex8)::bit(32)::int is the canonical text->int hash idiom; the int can
  -- be NEGATIVE, so take `% 1000` FIRST (result in (-999,999)) then abs() — abs
  -- of an already-bounded value cannot overflow (abs(INT_MIN) would). u in [0,0.999];
  -- (u - 0.5) * 0.005 => SYMMETRIC jitter bounded to ±0.0025° (~±280 m).
  select
    round(_lat::numeric, 2)::double precision
      + (
          abs(('x' || substr(md5(_seed::text || 'lat'), 1, 8))::bit(32)::int % 1000)::double precision
          / 1000.0 - 0.5
        ) * 0.005,     -- +/- 0.0025 deg lat  (~ +/- 280 m)
    round(_lng::numeric, 2)::double precision
      + (
          abs(('x' || substr(md5(_seed::text || 'lng'), 1, 8))::bit(32)::int % 1000)::double precision
          / 1000.0 - 0.5
        ) * 0.005;     -- +/- 0.0025 deg lng
$$;

comment on function public.derive_approx(double precision, double precision, uuid) is
  'D30: coarse approx pin from exact coords — rounded to ~2 decimals (~1km) plus a small deterministic, portfolio-seeded jitter (a few hundred m). Coarsened so the teaser never reveals exact. Later, prefer a neighborhood centroid from a neighborhood-centers table.';

-- Lock down helper execution: revoke from PUBLIC/anon, grant to authenticated.
revoke execute on function public.owns_portfolio(uuid, uuid)             from public, anon;
revoke execute on function public.portfolio_teaser_visible(uuid, uuid)   from public, anon;
revoke execute on function public.has_portfolio_access(uuid, uuid)       from public, anon;
revoke execute on function public.derive_approx(double precision, double precision, uuid) from public, anon;

grant execute on function public.owns_portfolio(uuid, uuid)              to authenticated;
grant execute on function public.portfolio_teaser_visible(uuid, uuid)    to authenticated;
grant execute on function public.has_portfolio_access(uuid, uuid)        to authenticated;
grant execute on function public.derive_approx(double precision, double precision, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 4. SLUG + APPROX FUNCTIONS / TRIGGERS
-- -----------------------------------------------------------------------------

-- generate_portfolio_slug: Turkish-aware slug from a title, then smallest free
-- integer suffix (base, base-2, base-3, ...) against portfolios.slug. Mirrors
-- M1's generate_username incremental pattern (but suffix is '-N' to keep slugs
-- URL-readable).
create or replace function public.generate_portfolio_slug(_title text)
returns text
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  base      text;
  candidate text;
  n         integer := 1;
begin
  base := coalesce(_title, '');

  -- transliterate Turkish characters (handle both cases before lowercasing)
  base := translate(
    base,
    'çÇğĞıİöÖşŞüÜ',
    'cCgGiIoOsSuU'
  );

  base := lower(base);

  -- collapse any run of non-[a-z0-9] into a single '-'
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');

  -- trim leading/trailing '-'
  base := trim(both '-' from base);

  if base is null or length(base) = 0 then
    base := 'portfoy';
  end if;

  -- smallest free suffix: base, base-2, base-3, ...
  candidate := base;
  loop
    exit when not exists (
      select 1 from public.portfolios p where p.slug = candidate
    );
    n := n + 1;
    candidate := base || '-' || n::text;
  end loop;

  return candidate;
end;
$$;

comment on function public.generate_portfolio_slug(text) is
  'Turkish-aware slug from title (ç->c, ğ->g, ı/İ->i, ö->o, ş->s, ü->u), lowercased, non-alnum runs -> single ''-'', trimmed; empty -> ''portfoy''. Then smallest free suffix base, base-2, base-3 ... against portfolios.slug.';

revoke execute on function public.generate_portfolio_slug(text) from public, anon;
grant  execute on function public.generate_portfolio_slug(text) to authenticated;

-- set_portfolio_slug: BEFORE INSERT — fill slug from title when missing/empty.
create or replace function public.set_portfolio_slug()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.slug is null or length(trim(new.slug)) = 0 then
    new.slug := public.generate_portfolio_slug(new.title);
  end if;
  return new;
end;
$$;

comment on function public.set_portfolio_slug() is
  'BEFORE INSERT on portfolios: derives slug from title via generate_portfolio_slug when slug is null/empty.';

drop trigger if exists portfolios_set_slug on public.portfolios;
create trigger portfolios_set_slug
  before insert on public.portfolios
  for each row
  execute function public.set_portfolio_slug();

-- Reuse M1's global public.set_updated_at() — just add the trigger here.
drop trigger if exists portfolios_set_updated_at on public.portfolios;
create trigger portfolios_set_updated_at
  before update on public.portfolios
  for each row
  execute function public.set_updated_at();

-- sync_portfolio_approx: D30 server-side coarse-pin derivation.
--
-- WHY A TRIGGER (not a server-side function the app must call): a trigger on
-- portfolio_private cannot be bypassed — it ALWAYS runs whenever exact coords
-- are written, so the teaser's approx pin can never drift from / leak the exact
-- value through a forgotten call path. It is SECURITY DEFINER so it can UPDATE
-- public.portfolios regardless of the writer's RLS (the writer is the owner of
-- portfolio_private, but may not be writing portfolios in the same statement).
--
-- CAVEAT: an owner could still manually overwrite approx_lat/lng via a direct
-- portfolios UPDATE (owner+verified policy). That is acceptable — it is their
-- OWN listing and not a cross-agent leak; exact coords still never leave
-- portfolio_private.
create or replace function public.sync_portfolio_approx()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  d record;
begin
  if new.exact_lat is not null and new.exact_lng is not null then
    select * into d
    from public.derive_approx(new.exact_lat, new.exact_lng, new.portfolio_id);

    update public.portfolios
    set approx_lat = d.approx_lat,
        approx_lng = d.approx_lng
    where id = new.portfolio_id;
  end if;
  return new;
end;
$$;

comment on function public.sync_portfolio_approx() is
  'D30: AFTER INSERT/UPDATE on portfolio_private — when exact coords are present, writes a coarse derive_approx() pin onto portfolios.approx_lat/lng. SECURITY DEFINER so it can update the teaser regardless of caller RLS. Trigger (not app-fn) so it can never be bypassed.';

drop trigger if exists portfolio_private_sync_approx on public.portfolio_private;
create trigger portfolio_private_sync_approx
  after insert or update of exact_lat, exact_lng on public.portfolio_private
  for each row
  execute function public.sync_portfolio_approx();

-- -----------------------------------------------------------------------------
-- 5. RLS ENABLE (+ FORCE per Supabase best practice)
-- -----------------------------------------------------------------------------

alter table public.portfolios          enable row level security;
alter table public.portfolios          force  row level security;

alter table public.portfolio_images    enable row level security;
alter table public.portfolio_images    force  row level security;

alter table public.portfolio_private   enable row level security;
alter table public.portfolio_private   force  row level security;

alter table public.portfolio_documents enable row level security;
alter table public.portfolio_documents force  row level security;

-- -----------------------------------------------------------------------------
-- 6. POLICIES
--    Every policy wraps auth.uid() as (select auth.uid()) (initplan perf).
--    NO anon policies: the public /p/$slug teaser comes later via a SECURITY
--    DEFINER view/RPC (D13); anon never touches these base tables.
-- -----------------------------------------------------------------------------

-- ---- portfolios --------------------------------------------------------------
-- SELECT: owner reads own portfolios (any status, incl. draft).
drop policy if exists portfolios_select_owner on public.portfolios;
create policy portfolios_select_owner
  on public.portfolios
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

-- SELECT: verified agents (D27) read others' ACTIVE portfolios (teaser).
drop policy if exists portfolios_select_network on public.portfolios;
create policy portfolios_select_network
  on public.portfolios
  for select
  to authenticated
  using (
    public.is_verified((select auth.uid()))
    and status = 'active'::public.portfolio_status
  );

-- INSERT: a verified agent creates a portfolio they own.
drop policy if exists portfolios_insert_owner on public.portfolios;
create policy portfolios_insert_owner
  on public.portfolios
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and public.is_verified((select auth.uid()))
  );

-- UPDATE: owner (still verified) updates own portfolio.
drop policy if exists portfolios_update_owner on public.portfolios;
create policy portfolios_update_owner
  on public.portfolios
  for update
  to authenticated
  using (
    owner_id = (select auth.uid())
    and public.is_verified((select auth.uid()))
  )
  with check (
    owner_id = (select auth.uid())
    and public.is_verified((select auth.uid()))
  );

-- DELETE: owner (still verified) deletes own portfolio.
drop policy if exists portfolios_delete_owner on public.portfolios;
create policy portfolios_delete_owner
  on public.portfolios
  for delete
  to authenticated
  using (
    owner_id = (select auth.uid())
    and public.is_verified((select auth.uid()))
  );

-- ---- portfolio_images --------------------------------------------------------
-- SELECT: same visibility as the teaser row.
drop policy if exists portfolio_images_select on public.portfolio_images;
create policy portfolio_images_select
  on public.portfolio_images
  for select
  to authenticated
  using (public.portfolio_teaser_visible(portfolio_id, (select auth.uid())));

-- INSERT/UPDATE/DELETE: owner only.
drop policy if exists portfolio_images_insert_owner on public.portfolio_images;
create policy portfolio_images_insert_owner
  on public.portfolio_images
  for insert
  to authenticated
  with check (public.owns_portfolio(portfolio_id, (select auth.uid())));

drop policy if exists portfolio_images_update_owner on public.portfolio_images;
create policy portfolio_images_update_owner
  on public.portfolio_images
  for update
  to authenticated
  using (public.owns_portfolio(portfolio_id, (select auth.uid())))
  with check (public.owns_portfolio(portfolio_id, (select auth.uid())));

drop policy if exists portfolio_images_delete_owner on public.portfolio_images;
create policy portfolio_images_delete_owner
  on public.portfolio_images
  for delete
  to authenticated
  using (public.owns_portfolio(portfolio_id, (select auth.uid())));

-- ---- portfolio_private (LOCKED) ----------------------------------------------
-- SELECT: gated by has_portfolio_access() (M2 owner-only; M3 grant-aware).
drop policy if exists portfolio_private_select on public.portfolio_private;
create policy portfolio_private_select
  on public.portfolio_private
  for select
  to authenticated
  using (public.has_portfolio_access(portfolio_id, (select auth.uid())));

-- INSERT/UPDATE/DELETE: owner only.
drop policy if exists portfolio_private_insert_owner on public.portfolio_private;
create policy portfolio_private_insert_owner
  on public.portfolio_private
  for insert
  to authenticated
  with check (public.owns_portfolio(portfolio_id, (select auth.uid())));

drop policy if exists portfolio_private_update_owner on public.portfolio_private;
create policy portfolio_private_update_owner
  on public.portfolio_private
  for update
  to authenticated
  using (public.owns_portfolio(portfolio_id, (select auth.uid())))
  with check (public.owns_portfolio(portfolio_id, (select auth.uid())));

drop policy if exists portfolio_private_delete_owner on public.portfolio_private;
create policy portfolio_private_delete_owner
  on public.portfolio_private
  for delete
  to authenticated
  using (public.owns_portfolio(portfolio_id, (select auth.uid())));

-- ---- portfolio_documents (LOCKED) --------------------------------------------
-- SELECT: gated by has_portfolio_access() (M2 owner-only; M3 grant-aware).
drop policy if exists portfolio_documents_select on public.portfolio_documents;
create policy portfolio_documents_select
  on public.portfolio_documents
  for select
  to authenticated
  using (public.has_portfolio_access(portfolio_id, (select auth.uid())));

-- INSERT/UPDATE/DELETE: owner only.
drop policy if exists portfolio_documents_insert_owner on public.portfolio_documents;
create policy portfolio_documents_insert_owner
  on public.portfolio_documents
  for insert
  to authenticated
  with check (public.owns_portfolio(portfolio_id, (select auth.uid())));

drop policy if exists portfolio_documents_update_owner on public.portfolio_documents;
create policy portfolio_documents_update_owner
  on public.portfolio_documents
  for update
  to authenticated
  using (public.owns_portfolio(portfolio_id, (select auth.uid())))
  with check (public.owns_portfolio(portfolio_id, (select auth.uid())));

drop policy if exists portfolio_documents_delete_owner on public.portfolio_documents;
create policy portfolio_documents_delete_owner
  on public.portfolio_documents
  for delete
  to authenticated
  using (public.owns_portfolio(portfolio_id, (select auth.uid())));

-- -----------------------------------------------------------------------------
-- 7. TABLE GRANTS
--    RLS still applies on top of these. NO anon grants (anon teaser is a later
--    SECURITY DEFINER view/RPC — D13).
-- -----------------------------------------------------------------------------

grant select, insert, update, delete on public.portfolios          to authenticated;
grant select, insert, update, delete on public.portfolio_images    to authenticated;
grant select, insert, update, delete on public.portfolio_private   to authenticated;
grant select, insert, update, delete on public.portfolio_documents to authenticated;
