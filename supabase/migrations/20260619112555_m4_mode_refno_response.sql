-- =============================================================================
-- Migration: 20260619112555_m4_mode_refno_response
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     M4 (additive) — portfolio mode (D36), ref_no (D39),
--            detail_requests.response_message (D38), attributes note (D40)
--
-- WHAT THIS DOES (ADDITIVE ONLY — no destructive changes)
--   1) D36 — portfolios.mode: new enum public.portfolio_mode
--      ('controlled','call_only') + column `mode` (not null default 'controlled').
--      A PUBLIC teaser column (drives the "kapalı portföy" badge).
--   2) D39 — portfolios.ref_no: human-readable UNIQUE portfolio number (BU-XXXXXX),
--      generated server-side, COLLISION-SAFE via a dedicated sequence + a small
--      base36 encoder + a SEPARATE BEFORE INSERT trigger. Existing rows backfilled,
--      then UNIQUE index + NOT NULL enforced. ref_no is PUBLIC (teaser-visible).
--   3) D38 — detail_requests.response_message: nullable text, the owner's
--      approve/reject note (set by the approve/reject RPCs LATER, not here).
--   4) D40 — attributes: NO schema change. The public/locked attributes jsonb bags
--      already exist (portfolios.attributes [PUBLIC] + portfolio_private.attributes
--      [LOCKED], D33). The standard field set (ATTRIBUTE_MAP.md) is expressed only
--      in the app-side attribute registry; expanding it needs NO migration (D33).
--      This file adds NO column for D40 — see the section-4 comment.
--
-- ref_no GENERATION (why it is collision-safe)
--   A dedicated SEQUENCE (portfolio_ref_seq) hands out a distinct bigint per call.
--   generate_ref_no() base36-encodes nextval(), left-pads to a stable min width,
--   uppercases, and prefixes 'BU-'. Because a sequence value is NEVER reused, two
--   inserts can never produce the same ref_no — there is NO retry loop and NO race
--   (unlike a count()/random scheme). The backfill draws one sequence value per
--   existing row, so every backfilled row also gets a distinct value. The UNIQUE
--   index is a belt-and-suspenders guard, not the primary collision defense.
--
-- D36 ENFORCEMENT NOTE (no DB CHECK on call_only)
--   'call_only' (kapalı portföy) means: no Detay Talebi flow, contact-only. An
--   agent MAY still have filled locked fields; only the app FLOW changes. So there
--   is intentionally NO CHECK constraint forcing portfolio_private to be empty for
--   call_only — that behavior is owned by app code, not the schema.
--
-- DECISIONS HONORED
--   D36 — portfolio mode controlled|call_only (teaser column; app-enforced flow).
--   D38 — owner approve/reject response message on detail_requests.
--   D39 — human-readable unique portfolio number (BU-XXXXXX), server-side.
--   D40 — standard field set lives in the app registry; attributes bags unchanged.
--
-- RLS / TEASER IMPACT
--   `mode` and `ref_no` are PUBLIC, NON-SENSITIVE teaser columns (a mode label and
--   a reference number — neither identifies the property/owner). They are SAFE to
--   expose. They are NOT yet in any teaser payload: this migration does NOT edit
--   any RPC. FOLLOW-UP (separate migration): add `mode` + `ref_no` to the
--   get_public_portfolio allow-list and to the agent-portfolios read path.
--   `response_message` lives on detail_requests (member-only, RLS+forced) — it is
--   NOT a teaser/public field and must never be returned by an anon path.
--
-- DOES NOT MODIFY (additive only)
--   * Existing slug function/trigger (set_portfolio_slug / generate_portfolio_slug
--     / portfolios_set_slug) — ref_no uses its OWN function + OWN trigger.
--   * Existing RPCs (get_public_portfolio, get_public_profile) — follow-up only.
--   * Any RLS policy, table, or column — only ADDs the three columns + helpers.
--
-- RISKS / APPLY
--   * A human runs `supabase db push`. Do NOT auto-apply.
--   * Regenerate TS types after this lands: new enum portfolio_mode + 2 new
--     portfolios columns (mode, ref_no) + 1 new detail_requests column
--     (response_message).
--   * FOLLOW-UP: update get_public_portfolio (anon teaser) AND the agent-portfolios
--     read path to expose `mode` + `ref_no`; surface `response_message` to the
--     requester in the request inbox (and set it from the approve/reject RPCs).
--   * Backfill writes one ref_no per existing row in a single statement; on an
--     empty/small table this is trivial. On a large table it is a one-time UPDATE.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) D36 — portfolio mode enum + column
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'portfolio_mode') then
    create type public.portfolio_mode as enum ('controlled', 'call_only');
  end if;
end$$;

alter table public.portfolios
  add column if not exists mode public.portfolio_mode not null default 'controlled';

comment on column public.portfolios.mode is
  'D36 — portfolio mode. ''controlled'' = teaser + locked fields + Detay Talebi flow (default). ''call_only'' (kapalı portföy) = no locked-field reveal flow, no detail-request flow, contact-only ("detaylar için arayın" + agent phone). PUBLIC teaser column (drives the kapalı-portföy badge). The call_only behavior is enforced in APP CODE, not by a DB constraint — an agent may still have filled locked fields; only the flow changes. No CHECK empties locked fields here.';

-- -----------------------------------------------------------------------------
-- 2) D39 — ref_no: sequence + base36 encoder + generator + trigger + backfill
-- -----------------------------------------------------------------------------

-- Add the column FIRST as nullable so the trigger + backfill can populate it
-- before we enforce NOT NULL / UNIQUE (order matters; see end of this section).
alter table public.portfolios
  add column if not exists ref_no text;

-- Dedicated sequence — guarantees a distinct value per call, so ref_no needs no
-- retry loop and has no race (unlike count()/random schemes).
create sequence if not exists public.portfolio_ref_seq;

-- to_base36(bigint): Postgres has no built-in base36. Small immutable helper that
-- divides by 36 and maps remainders to [0-9A-Z]. Returns '0' for 0.
create or replace function public.to_base36(_n bigint)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  digits constant text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  n      bigint := abs(_n);
  out    text   := '';
  rem    integer;
begin
  if n = 0 then
    return '0';
  end if;
  while n > 0 loop
    rem := (n % 36)::integer;
    out := substr(digits, rem + 1, 1) || out;  -- substr is 1-based
    n   := n / 36;
  end loop;
  return out;
end;
$$;

comment on function public.to_base36(bigint) is
  'D39 helper: encodes a non-negative bigint to upper-case base36 ([0-9A-Z]). Used by generate_ref_no(); Postgres has no built-in base36.';

-- generate_ref_no(): 'BU-' || base36(nextval(seq)) left-padded to a stable min
-- width of 5 (zero-ish '0' padding) and uppercased. Sequence => no collisions.
create or replace function public.generate_ref_no()
returns text
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  seq_val bigint;
  encoded text;
begin
  seq_val := nextval('public.portfolio_ref_seq');
  -- base36 of the sequence value, padded to a stable minimum width for a tidy
  -- BU-XXXXX shape; grows naturally past width 5 once values get large.
  encoded := lpad(public.to_base36(seq_val), 5, '0');
  return 'BU-' || encoded;
end;
$$;

comment on function public.generate_ref_no() is
  'D39 — human-readable UNIQUE portfolio number. Format: ''BU-'' || base36(nextval(portfolio_ref_seq)) left-padded to min width 5, uppercase (e.g. BU-00001, BU-002VF). COLLISION-SAFE by construction: a sequence never reuses a value, so no retry loop / no race. The UNIQUE index on portfolios.ref_no is a guard, not the primary defense.';

-- set_portfolio_ref_no: SEPARATE BEFORE INSERT trigger fn for ref_no — mirrors
-- set_portfolio_slug but does NOT modify it. Fills ref_no only when null/empty.
create or replace function public.set_portfolio_ref_no()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.ref_no is null or length(trim(new.ref_no)) = 0 then
    new.ref_no := public.generate_ref_no();
  end if;
  return new;
end;
$$;

comment on function public.set_portfolio_ref_no() is
  'D39 — BEFORE INSERT on portfolios: fills ref_no from generate_ref_no() when null/empty. SEPARATE from the slug trigger (set_portfolio_slug is untouched).';

drop trigger if exists portfolios_set_ref_no on public.portfolios;
create trigger portfolios_set_ref_no
  before insert on public.portfolios
  for each row
  execute function public.set_portfolio_ref_no();

-- Lock down helper execution (mirror M2): revoke from public/anon, grant to
-- authenticated. The trigger fn runs as table owner; no extra grant needed for it.
revoke execute on function public.to_base36(bigint)   from public, anon;
revoke execute on function public.generate_ref_no()   from public, anon;
grant  execute on function public.to_base36(bigint)   to authenticated;
grant  execute on function public.generate_ref_no()   to authenticated;

-- BACKFILL existing rows BEFORE enforcing NOT NULL / UNIQUE. Each row draws a
-- distinct value from the sequence, so all backfilled ref_no values are unique.
update public.portfolios
set ref_no = public.generate_ref_no()
where ref_no is null;

-- UNIQUE index AFTER backfill (idempotent).
create unique index if not exists portfolios_ref_no_key on public.portfolios (ref_no);

-- NOT NULL AFTER backfill — safe now: every existing row is filled and the
-- BEFORE INSERT trigger fills every future row.
alter table public.portfolios
  alter column ref_no set not null;

comment on column public.portfolios.ref_no is
  'D39 — human-readable UNIQUE portfolio number (BU-XXXXXX). Server-generated via the portfolios_set_ref_no BEFORE INSERT trigger (generate_ref_no + portfolio_ref_seq); UNIQUE + NOT NULL. PUBLIC teaser column (safe, non-identifying). Add to the public teaser RPC + agent read path in a FOLLOW-UP.';

-- -----------------------------------------------------------------------------
-- 3) D38 — detail_requests.response_message
-- -----------------------------------------------------------------------------

alter table public.detail_requests
  add column if not exists response_message text;

comment on column public.detail_requests.response_message is
  'D38 — owner''s OPTIONAL approve/reject note, shown to the requester. SET by the approve/reject RPCs LATER (this migration only adds the column; existing RPCs are NOT modified here). Member-only (detail_requests RLS); NEVER a teaser/anon/public field.';

-- -----------------------------------------------------------------------------
-- 4) D40 — standard field set: NO schema change (intentional)
-- -----------------------------------------------------------------------------
-- The standard Sahibinden/Emlakjet-style field set (docs/ATTRIBUTE_MAP.md) is
-- modeled entirely in the APP-SIDE attribute registry (D33). The storage already
-- exists: portfolios.attributes (PUBLIC bag) and portfolio_private.attributes
-- (LOCKED bag). Expanding the registry — even adding new per-category fields —
-- needs NO migration (D33). Therefore this migration adds NO column for D40.
-- (Documented here so a future reader knows the omission is deliberate.)

-- =============================================================================
-- END M4 — mode (D36) + ref_no (D39) + response_message (D38) + D40 note
-- =============================================================================
