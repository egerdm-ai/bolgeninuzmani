-- =============================================================================
-- Migration: 20260618171728_m1_auth_profiles_roles_verification
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     M1 — Auth + profiles + user_roles + verification gate
--
-- WHAT THIS DOES
--   * Defines core enums (profile_status, app_role, membership_tier,
--     application_status).
--   * Creates public.profiles (1:1 with auth.users), public.user_roles
--     (D9: roles live here, NEVER on profiles), and public.applications
--     (D28: landing application form intake).
--   * Adds SECURITY DEFINER helpers used by RLS to avoid recursion:
--     has_role(), is_admin(), is_verified(), generate_username().
--   * Wires triggers: handle_new_user (auto profile + 'agent' role),
--     set_updated_at, guard_profile_status (only admin/service-role may flip
--     profile.status — D27 verification gate integrity).
--   * Enables + FORCES RLS on all three tables and defines policies that
--     implement the verification gate (D27) and admin/owner access model.
--
-- DECISIONS HONORED
--   D9  — roles in user_roles + has_role() SECURITY DEFINER (never profiles col).
--   D14 — hybrid onboarding: self-serve signup allowed but lands 'pending';
--         admin promotes founders/agents to 'verified'.
--   D21 — membership_tier is DISPLAY-ONLY (billing/badge), no access logic.
--   D27 — verification gate: network reads require status='verified';
--         'pending' user reads only its own profile.
--   D28 — applications table for the landing intake form.
--   Invariant #3 — roles via user_roles + has_role security-definer.
--   Invariant #4 — exploration/reads via anon/authenticated; service role
--         server-side only. No client INSERT/UPDATE on profiles/user_roles.
--
-- MANUAL ADMIN-BOOTSTRAP STEP (done by a human, after this migration applies;
-- no secrets in this file):
--   1. Create the founder users (Ege, Taylan) via the Supabase dashboard
--      (Authentication > Users > Add user) or have them self-sign-up.
--      The handle_new_user trigger creates their profile (status='pending')
--      and a 'agent' role row automatically.
--   2. For each founder, in the dashboard SQL editor / Table editor:
--        UPDATE public.profiles SET status = 'verified' WHERE id = '<uuid>';
--        INSERT INTO public.user_roles (user_id, role)
--          VALUES ('<uuid>', 'admin') ON CONFLICT DO NOTHING;
--      (Running as the service role / dashboard owner bypasses RLS and the
--       guard_profile_status trigger — see the trigger comment for the nuance.)
--
-- AUTH PROVIDER CONFIG (NOT done here — configure in the Supabase dashboard):
--   * Email/password provider only (no social/magic-link for MVP).
--   * Admin "invite user" flow + self-serve signup with email confirmation on.
--   * Use Supabase's own built-in auth emails for now; Resend is NOT wired yet
--     (Resend is a P1 / D4 item for transactional/admin-notice email later).
--
-- APPLY: a human runs `supabase db push`. Do NOT auto-apply. Regenerate TS
-- types after this lands.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_status') then
    create type public.profile_status as enum ('pending', 'verified', 'suspended');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'agent');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'membership_tier') then
    create type public.membership_tier as enum ('standard', 'pro', 'elite');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum ('new', 'reviewed', 'invited', 'rejected');
  end if;
end$$;

-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

-- public.profiles — 1:1 with auth.users. Created automatically by the
-- handle_new_user trigger; clients never INSERT here.
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,

  -- always present (trigger fills full_name/username; status/tier defaulted)
  full_name          text not null,
  username           text not null unique,
  status             public.profile_status  not null default 'pending',
  membership_tier    public.membership_tier not null default 'standard', -- D21: display only
  expertise_regions  text[] not null default '{}',
  expertise_types    text[] not null default '{}',

  -- nullable: a 'pending' user completes these during onboarding (D14)
  title              text,
  company_name       text,
  location           text,
  avatar_url         text,
  bio                text,

  -- agent's OWN contact (D8): OPEN everywhere; distinct from locked malik_info
  contact_phone      text,
  contact_email      text,
  contact_whatsapp   text,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.profiles is
  'Member profile, 1:1 with auth.users. Roles live in user_roles (D9), not here. status drives the verification gate (D27). contact_* are the agent''s own contact and are OPEN (D8).';
comment on column public.profiles.status is
  'D27 verification gate: pending = no network access; verified = full network reads; suspended = access closed.';
comment on column public.profiles.membership_tier is
  'D21: display/billing badge only. Carries NO access semantics; access is decided by user_roles + status.';

create index if not exists profiles_status_idx   on public.profiles (status);
create index if not exists profiles_username_idx on public.profiles (username);

-- public.user_roles — D9: the ONLY source of truth for roles.
-- Clients never write here; managed server-side / by admin.
create table if not exists public.user_roles (
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        public.app_role not null,
  granted_at  timestamptz not null default now(),
  primary key (user_id, role)
);

comment on table public.user_roles is
  'D9 / Invariant #3: authoritative role assignments. Never a column on profiles. Checked via has_role()/is_admin() SECURITY DEFINER helpers.';

-- public.applications — D28: landing-page application intake. NOT an account.
create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text not null,
  email       text not null,
  company     text,
  regions     text[] not null default '{}',
  message     text,
  status      public.application_status not null default 'new',
  created_at  timestamptz not null default now()
);

comment on table public.applications is
  'D28: landing application form submissions. An application is NOT an account; an admin reviews and then invites/creates the agent (D14).';

create index if not exists applications_status_idx on public.applications (status);

-- -----------------------------------------------------------------------------
-- 3. SECURITY DEFINER HELPERS
--    Used by RLS policies to read user_roles/profiles WITHOUT triggering RLS
--    recursion. All are SECURITY DEFINER, owned by the migration role, with a
--    pinned search_path and execute granted only to authenticated.
-- -----------------------------------------------------------------------------

-- has_role: does _user_id hold _role?
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
  );
$$;

comment on function public.has_role(uuid, public.app_role) is
  'D9/Invariant #3: SECURITY DEFINER role check against user_roles. Use this in RLS, never a profiles column, never a direct user_roles select from a policy (recursion).';

-- is_admin: convenience wrapper, defaults to the caller.
create or replace function public.is_admin(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.has_role(_user_id, 'admin'::public.app_role);
$$;

comment on function public.is_admin(uuid) is
  'True if _user_id (default auth.uid()) holds the admin role.';

-- is_verified: D27 gate predicate. Defaults to the caller.
create or replace function public.is_verified(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = _user_id
      and p.status = 'verified'::public.profile_status
  );
$$;

comment on function public.is_verified(uuid) is
  'D27: true if _user_id (default auth.uid()) has a verified profile. Network-read RLS hangs off this.';

-- generate_username: derive a clean, incremental, collision-safe username from
-- an email local-part. NOT random hex. e.g. "Ege.Erdem@x.com" -> "egeerdem",
-- then "egeerdem1", "egeerdem2", ... if taken.
create or replace function public.generate_username(_email text)
returns text
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  base    text;
  candidate text;
  n       integer := 0;
begin
  -- local-part before '@', lowercased
  base := lower(split_part(coalesce(_email, ''), '@', 1));

  -- keep only [a-z0-9]; everything else (dots, +, spaces, unicode) is dropped.
  -- Note: lower() above does not transliterate Turkish chars; non-ascii is
  -- simply stripped here, which keeps the slug URL-safe.
  base := regexp_replace(base, '[^a-z0-9]', '', 'g');

  -- guarantee a non-empty base
  if base is null or length(base) = 0 then
    base := 'uye';
  end if;

  -- find the smallest free suffix: base, base1, base2, ...
  candidate := base;
  loop
    exit when not exists (
      select 1 from public.profiles p where p.username = candidate
    );
    n := n + 1;
    candidate := base || n::text;
  end loop;

  return candidate;
end;
$$;

comment on function public.generate_username(text) is
  'Clean incremental username from email local-part: slug then smallest free integer suffix (base, base1, base2 ...). Collision-safe against profiles.username.';

-- Lock down helper execution: revoke from PUBLIC/anon, grant to authenticated.
-- (handle_new_user calls generate_username, but it runs as the function owner
--  via SECURITY DEFINER, so execute grants on it don't matter for the trigger.)
revoke execute on function public.has_role(uuid, public.app_role)      from public, anon;
revoke execute on function public.is_admin(uuid)                       from public, anon;
revoke execute on function public.is_verified(uuid)                    from public, anon;
revoke execute on function public.generate_username(text)              from public, anon;

grant execute on function public.has_role(uuid, public.app_role)       to authenticated;
grant execute on function public.is_admin(uuid)                        to authenticated;
grant execute on function public.is_verified(uuid)                     to authenticated;
grant execute on function public.generate_username(text)               to authenticated;

-- -----------------------------------------------------------------------------
-- 4. TRIGGERS
-- -----------------------------------------------------------------------------

-- handle_new_user: on every new auth.users row, create the profile (pending)
-- and a default 'agent' role. SECURITY DEFINER so it can write into public.*
-- regardless of the inserting context.
--
-- The trigger ALWAYS creates status='pending' (D14). Admin-created founders are
-- promoted to 'verified' (and granted 'admin') separately, server-side / via
-- the dashboard — never automatically here.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, username, status)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Yeni Üye'),
    public.generate_username(new.email),
    'pending'::public.profile_status
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'agent'::public.app_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'AFTER INSERT on auth.users: creates pending profile + default agent role (D14). Verification/admin promotion happens separately.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- set_updated_at: keep profiles.updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE: maintains updated_at.';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- guard_profile_status: protect the verification gate (D27). A user must not be
-- able to flip their own status (e.g. pending -> verified). Only admins, and
-- trusted server-side / service-role context, may change status.
--
-- SERVICE-ROLE NUANCE: in a normal end-user request, auth.uid() returns the
-- user's id (a non-null JWT subject). In service-role / dashboard / migration
-- contexts there is no end-user JWT, so auth.uid() is NULL — we treat that as
-- trusted and allow the change. (Note: the service role also BYPASSES RLS, but
-- triggers still fire, which is exactly why this guard explicitly allows the
-- auth.uid() IS NULL case so legitimate server-side promotion isn't blocked.)
--
-- So: block only when status actually changes AND there IS an end-user JWT
-- (auth.uid() is not null) AND that end user is not an admin.
create or replace function public.guard_profile_status()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status is distinct from old.status then
    if auth.uid() is not null and not public.is_admin(auth.uid()) then
      raise exception
        'Only an admin may change profile status (verification gate, D27).'
        using errcode = '42501'; -- insufficient_privilege
    end if;
  end if;
  return new;
end;
$$;

comment on function public.guard_profile_status() is
  'D27: blocks status changes by non-admin end users. Allows admins and trusted server/service-role context (auth.uid() IS NULL).';

drop trigger if exists profiles_guard_status on public.profiles;
create trigger profiles_guard_status
  before update on public.profiles
  for each row
  execute function public.guard_profile_status();

-- -----------------------------------------------------------------------------
-- 5. RLS ENABLE (+ FORCE per Supabase best practice)
-- -----------------------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.profiles     force  row level security;

alter table public.user_roles   enable row level security;
alter table public.user_roles   force  row level security;

alter table public.applications enable row level security;
alter table public.applications force  row level security;

-- -----------------------------------------------------------------------------
-- 6. POLICIES
-- -----------------------------------------------------------------------------

-- ---- profiles ----------------------------------------------------------------
-- SELECT: a user can always read their own profile (incl. while 'pending').
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- SELECT: network reads require the CALLER to be verified AND the row to be a
-- verified profile (D27). pending/suspended callers see only themselves (above).
drop policy if exists profiles_select_network on public.profiles;
create policy profiles_select_network
  on public.profiles
  for select
  to authenticated
  using (
    public.is_verified((select auth.uid()))
    and status = 'verified'::public.profile_status
  );

-- SELECT: admins read everything.
drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin
  on public.profiles
  for select
  to authenticated
  using (public.is_admin((select auth.uid())));

-- UPDATE: a user may update their own profile. (status changes are still
-- blocked by guard_profile_status for non-admins — D27.)
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- UPDATE: admins may update any profile (e.g. verify/suspend).
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
  on public.profiles
  for update
  to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

-- NOTE: intentionally NO INSERT or DELETE policy on profiles.
-- Rows are created only by handle_new_user (SECURITY DEFINER, bypasses RLS) and
-- removed only via the auth.users ON DELETE CASCADE.

-- ---- user_roles --------------------------------------------------------------
-- SELECT: a user can see their own role rows; admins can see all.
drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select
  on public.user_roles
  for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin((select auth.uid())));

-- NOTE: intentionally NO INSERT/UPDATE/DELETE policy.
-- Role writes happen only via SECURITY DEFINER paths (handle_new_user) or the
-- service role / dashboard (admin bootstrap). Clients can never escalate roles.

-- ---- applications ------------------------------------------------------------
-- INSERT: the public landing form (anon) and logged-in users may submit an
-- application, but only as status='new' (can't pre-set reviewed/invited).
drop policy if exists applications_insert_public on public.applications;
create policy applications_insert_public
  on public.applications
  for insert
  to anon, authenticated
  with check (status = 'new'::public.application_status);

-- SELECT: admins only (intake is private).
drop policy if exists applications_select_admin on public.applications;
create policy applications_select_admin
  on public.applications
  for select
  to authenticated
  using (public.is_admin((select auth.uid())));

-- UPDATE: admins only (move new -> reviewed/invited/rejected).
drop policy if exists applications_update_admin on public.applications;
create policy applications_update_admin
  on public.applications
  for update
  to authenticated
  using (public.is_admin((select auth.uid())))
  with check (public.is_admin((select auth.uid())));

-- -----------------------------------------------------------------------------
-- 7. TABLE GRANTS
--    RLS still applies on top of these; grants only open the privilege surface.
--    Invariant #4: anon is read/write-limited to the application intake path.
-- -----------------------------------------------------------------------------

-- profiles: authenticated may select/update (policies scope it); no anon access.
grant select, update on public.profiles to authenticated;

-- user_roles: authenticated may select (policy scopes to self/admin); no writes.
grant select on public.user_roles to authenticated;

-- applications: anon + authenticated may insert (landing form); admins read/
-- update via policy. Grant select/update to authenticated so the admin policy
-- has a privilege to ride on; grant only insert to anon.
grant insert on public.applications to anon;
grant insert, select, update on public.applications to authenticated;
