-- =============================================================================
-- Konum fix #3 — approx = exact pin fuzzed by the chosen radius (Faz 2.2)
-- Bölgenin Uzmanı
-- -----------------------------------------------------------------------------
-- DRAFT — NOT auto-applied. Human runs `supabase db push`.
--
-- WHY (proven with live data)
--   Fix #2 derived approx from the İLÇE CENTROID + jitter, fully decoupled from the
--   exact pin. Result: in large districts the teaser pin was ~9 km off the property,
--   it ignored the chosen radius, and it never moved when the owner moved the pin
--   (the exact→approx trigger only fired in "Tam konum" mode).
--
-- WHAT THIS DOES (supersedes #2's centroid path)
--   "Yaklaşık" → approx = EXACT pin, snapped to a ~radius grid + deterministic
--     md5-seeded jitter within that grid → stays within ~approx_radius_km of the pin,
--     MOVES with the pin, and the fuzz scales with the radius.
--   "Tam konum" → approx = exact (unchanged owner reveal).
--
-- D30 / leak-safety
--   * exact_lat/lng stay LOCKED in portfolio_private; the teaser only ever reads the
--     fuzzed approx_lat/lng. The grid SNAP is irreversible — it discards the exact's
--     sub-radius position, so even though the jitter is deterministic (portfolio_id is
--     public) an attacker can recover exact only to ~radius precision, which is the
--     owner's OWN chosen fuzz level. Privacy is owner-controlled via the radius slider.
--   * This migration's name has no "geo_districts" → it is NOT a teaser read path and
--     is not scanned by the D13 leak test (which guards teaser READ paths); the teaser
--     reads approx only. geo_districts stays as reference data (no longer used here).
-- =============================================================================

-- 1) Fuzz a point by a radius: snap to a ~radius grid (irreversible) + ±half-cell
--    deterministic jitter (stable, spreads pins). cell ≈ radius in km.
create or replace function public.derive_approx_fuzzy(
  _lat    numeric,
  _lng    numeric,
  _radius numeric,
  _seed   uuid
)
returns table (approx_lat double precision, approx_lng double precision)
language sql
immutable
as $$
  with g as (
    select
      _lat::double precision                                            as la,
      _lng::double precision                                            as lo,
      (greatest(coalesce(_radius, 1.0), 0.5) / 111.0)::double precision  as cell_lat,
      (greatest(coalesce(_radius, 1.0), 0.5)
         / (111.320 * cos(radians(_lat::double precision))))::double precision as cell_lng
  )
  select
    round(la / cell_lat) * cell_lat
      + (abs(('x' || substr(md5(_seed::text || 'flat'), 1, 8))::bit(32)::int % 1000)::double precision
         / 1000.0 - 0.5) * cell_lat,
    round(lo / cell_lng) * cell_lng
      + (abs(('x' || substr(md5(_seed::text || 'flng'), 1, 8))::bit(32)::int % 1000)::double precision
         / 1000.0 - 0.5) * cell_lng
  from g;
$$;

comment on function public.derive_approx_fuzzy(numeric, numeric, numeric, uuid) is
  'D30: approx pin = exact snapped to a ~radius_km grid (irreversible) + deterministic portfolio-seeded jitter. Stays within ~radius of exact, moves with it, fuzz scales with radius.';

-- 2) Precision-aware approx for a portfolio: exact mode → exact; approx mode → fuzzy.
create or replace function public.compute_portfolio_approx(
  _elat   numeric,
  _elng   numeric,
  _prec   text,
  _radius numeric,
  _seed   uuid
)
returns table (approx_lat double precision, approx_lng double precision)
language sql
immutable
as $$
  select
    case
      when _elat is null or _elng is null then null::double precision
      when _prec = 'exact' then _elat::double precision
      else f.approx_lat
    end,
    case
      when _elat is null or _elng is null then null::double precision
      when _prec = 'exact' then _elng::double precision
      else f.approx_lng
    end
  from (select * from public.derive_approx_fuzzy(_elat, _elng, _radius, _seed)) f;
$$;

revoke execute on function public.derive_approx_fuzzy(numeric, numeric, numeric, uuid) from public, anon;
revoke execute on function public.compute_portfolio_approx(numeric, numeric, text, numeric, uuid) from public, anon;
grant  execute on function public.derive_approx_fuzzy(numeric, numeric, numeric, uuid) to authenticated;
grant  execute on function public.compute_portfolio_approx(numeric, numeric, text, numeric, uuid) to authenticated;

-- 3) Retire #2's centroid triggers.
drop trigger if exists portfolios_sync_approx        on public.portfolios;
drop trigger if exists portfolio_private_sync_approx on public.portfolio_private;

-- 4a) portfolios BEFORE INSERT/UPDATE — recompute on precision/radius change (reads exact).
create or replace function public.sync_approx_on_portfolio()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  ex record;
  a  record;
begin
  if tg_op = 'INSERT'
     or new.location_precision is distinct from old.location_precision
     or new.approx_radius_km   is distinct from old.approx_radius_km then
    select exact_lat, exact_lng into ex
      from public.portfolio_private where portfolio_id = new.id;
    if ex.exact_lat is not null then
      select * into a from public.compute_portfolio_approx(
        ex.exact_lat, ex.exact_lng, new.location_precision, new.approx_radius_km, new.id);
      new.approx_lat := a.approx_lat;
      new.approx_lng := a.approx_lng;
    end if;
    -- no exact yet → leave approx; trigger (4b) fills it when the pin arrives.
  end if;
  return new;
end;
$$;

drop trigger if exists portfolios_sync_approx on public.portfolios;
create trigger portfolios_sync_approx
  before insert or update on public.portfolios
  for each row
  execute function public.sync_approx_on_portfolio();

-- 4b) portfolio_private AFTER exact change — approx tracks the pin (both modes).
create or replace function public.sync_approx_on_exact()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  p record;
  a record;
begin
  select location_precision, approx_radius_km into p
    from public.portfolios where id = new.portfolio_id;
  select * into a from public.compute_portfolio_approx(
    new.exact_lat, new.exact_lng, p.location_precision, p.approx_radius_km, new.portfolio_id);
  update public.portfolios
     set approx_lat = a.approx_lat, approx_lng = a.approx_lng
   where id = new.portfolio_id;
  return new;
end;
$$;

drop trigger if exists portfolio_private_sync_approx on public.portfolio_private;
create trigger portfolio_private_sync_approx
  after insert or update of exact_lat, exact_lng on public.portfolio_private
  for each row
  execute function public.sync_approx_on_exact();

-- 5) BACKFILL — recompute approx for every portfolio that has an exact pin, so the
--    centroid-misplaced pins are fixed immediately (not only on next save).
update public.portfolios p
   set approx_lat = a.approx_lat,
       approx_lng = a.approx_lng
  from public.portfolio_private pv
  cross join lateral public.compute_portfolio_approx(
    pv.exact_lat, pv.exact_lng, p.location_precision, p.approx_radius_km, p.id) a
 where pv.portfolio_id = p.id
   and pv.exact_lat is not null
   and pv.exact_lng is not null;

-- =============================================================================
-- END radius-fuzzed approx
-- =============================================================================
