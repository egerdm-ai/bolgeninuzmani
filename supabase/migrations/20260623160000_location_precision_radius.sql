-- =============================================================================
-- Konum adımı — exact/approx precision + radius (Faz 2.2)
-- Bölgenin Uzmanı
-- -----------------------------------------------------------------------------
-- DRAFT — NOT auto-applied. A human runs `supabase db push`, then regenerates TS
-- types (location_precision + approx_radius_km land in database.types.ts).
-- (For this session the two columns were hand-added to database.types.ts to keep
--  typecheck green; re-run gen types after applying for a byte-exact match.)
--
-- WHAT THIS DOES
--   The owner drops a pin (exact_lat/lng → portfolio_private, LOCKED) and chooses:
--     * "Tam konum"  (precision='exact')  → reveal the exact point on the teaser map.
--     * "Yaklaşık"   (precision='approx') → show a COARSE pin + a radius circle (km).
--   D30 stays intact: exact_lat/lng live ONLY in portfolio_private and are never
--   selected by a teaser path. The teaser map reads portfolios.approx_lat/lng — which
--   the trigger sets to EITHER the exact value (owner explicitly chose to reveal) OR a
--   coarse derive_approx() pin. precision + radius are teaser-safe display metadata.
--
-- 1) portfolios.location_precision ('exact'|'approx', default 'approx') + approx_radius_km.
-- 2) sync_portfolio_approx() becomes precision-aware (exact → reveal; approx → coarse).
-- 3) A BEFORE-UPDATE trigger on portfolios recomputes approx when the owner toggles
--    precision WITHOUT moving the pin (portfolio_private unchanged → its trigger won't fire).
-- =============================================================================

alter table public.portfolios
  add column if not exists location_precision text not null default 'approx'
    check (location_precision in ('exact', 'approx'));

alter table public.portfolios
  add column if not exists approx_radius_km numeric;

comment on column public.portfolios.location_precision is
  'Faz 2.2 teaser-safe: how the teaser map shows location. exact = approx_lat/lng hold the exact point (owner chose to reveal); approx = coarse pin + radius circle. exact_lat/lng never leave portfolio_private (D30).';
comment on column public.portfolios.approx_radius_km is
  'Faz 2.2 teaser-safe: fuzz circle radius (km) shown around the coarse pin when location_precision = approx. Display only.';

-- 2) Precision-aware exact→approx sync (replaces the M2 coarse-only version).
create or replace function public.sync_portfolio_approx()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  d    record;
  prec text;
begin
  if new.exact_lat is not null and new.exact_lng is not null then
    select location_precision into prec from public.portfolios where id = new.portfolio_id;
    if prec = 'exact' then
      -- Owner chose to reveal: the teaser pin IS the exact point.
      update public.portfolios
        set approx_lat = new.exact_lat, approx_lng = new.exact_lng
        where id = new.portfolio_id;
    else
      select * into d from public.derive_approx(new.exact_lat, new.exact_lng, new.portfolio_id);
      update public.portfolios
        set approx_lat = d.approx_lat, approx_lng = d.approx_lng
        where id = new.portfolio_id;
    end if;
  end if;
  return new;
end;
$$;

-- 3) Toggle precision without moving the pin → recompute approx from current exact.
create or replace function public.sync_approx_on_precision()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  ex record;
  d  record;
begin
  if new.location_precision is distinct from old.location_precision then
    select exact_lat, exact_lng into ex
      from public.portfolio_private where portfolio_id = new.id;
    if ex.exact_lat is not null and ex.exact_lng is not null then
      if new.location_precision = 'exact' then
        new.approx_lat := ex.exact_lat;
        new.approx_lng := ex.exact_lng;
      else
        select * into d from public.derive_approx(ex.exact_lat, ex.exact_lng, new.id);
        new.approx_lat := d.approx_lat;
        new.approx_lng := d.approx_lng;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists portfolios_sync_approx_on_precision on public.portfolios;
create trigger portfolios_sync_approx_on_precision
  before update of location_precision on public.portfolios
  for each row
  execute function public.sync_approx_on_precision();

-- =============================================================================
-- END location precision + radius
-- =============================================================================
