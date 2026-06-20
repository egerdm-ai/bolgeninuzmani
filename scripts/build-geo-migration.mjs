// Generates the B-geo DRAFT migration (geo_districts table + 973-row seed + the new
// district-centroid approx derivation, replacing the exact→approx path). Run once:
//   node scripts/build-geo-migration.mjs
// Output: supabase/migrations/20260621120000_geo_districts_DRAFT.sql  (push by human)
import fs from "node:fs";
import path from "node:path";

const districts = JSON.parse(fs.readFileSync("src/lib/geo/districts.json", "utf8"));
const esc = (s) => String(s).replace(/'/g, "''");

const values = districts
  .map((d) => `  ('${esc(d.province)}','${esc(d.name)}',${d.lat},${d.lng})`)
  .join(",\n");

const sql = `-- =============================================================================
-- Migration: 20260621120000_geo_districts  ⚠️ REVIEW GEREKLİ — DRAFT, NOT APPLIED
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     Adres sistemi — geo_districts (ilçe centroid) + approx derive from region
--
-- WHAT THIS DOES
--   1. table public.geo_districts (province, district, lat, lng) PK(province,district)
--      — ${districts.length} il/ilçe merkez koordinatı (NVI/açık veri türevi). READ-ONLY
--      reference: RLS enable+force, SELECT for authenticated, NO writes (seed only).
--   2. seeds all ${districts.length} rows (idempotent: on conflict do update).
--   3. derive_approx_centroid(lat,lng,seed): deterministic jitter (±0.01°, ~±1.1km)
--      around a centroid, seeded by the portfolio id.
--   4. sync_portfolio_approx_from_region(): BEFORE INSERT/UPDATE on portfolios — sets
--      portfolios.approx_lat/lng from geo_districts[(city,district)] + jitter. If the
--      (city,district) is unknown (legacy/free-text) → approx NULL (no error, no pin).
--   5. DROPS the old portfolio_private exact→approx trigger: exact coords NO LONGER
--      drive the approx pin.
--
-- ====================== WHY THIS IS SAFE (D13/D30) ===========================
-- (1) approx is now derived from the PUBLIC ilçe centroid (+ jitter), NOT from the
--     locked exact coordinates. This makes the teaser pin EVEN COARSER and fully
--     DECOUPLES it from exact — exact_lat/lng (D13) stay locked in portfolio_private
--     and no longer influence anything public. Privacy strictly improves.
-- (2) geo_districts holds only public administrative centroids (region name + lat/lng)
--     — no D13 field. RLS enable+force; authenticated SELECT only; no insert/update/
--     delete grant or policy (reference data, seeded here).
-- (3) The derive/sync functions are security definer + search_path pinned; they read
--     geo_districts + write only portfolios.approx_lat/lng (the coarse teaser pin).
-- (4) Deterministic per-portfolio jitter → stable pin (doesn't move on unrelated edits;
--     only recomputed when city/district changes).
--
-- APPLY: human \`supabase db push\`. No type regen needed (geo_districts is read only
--   via the trigger; the app reads approx_lat/lng as before).
-- =============================================================================

-- 1. TABLE ---------------------------------------------------------------------
create table if not exists public.geo_districts (
  province text not null,
  district text not null,
  lat      numeric not null,
  lng      numeric not null,
  primary key (province, district)
);

alter table public.geo_districts enable row level security;
alter table public.geo_districts force row level security;

drop policy if exists geo_districts_select on public.geo_districts;
create policy geo_districts_select on public.geo_districts for select using (true);

revoke all on public.geo_districts from public, anon, authenticated;
grant select on public.geo_districts to authenticated;

comment on table public.geo_districts is
  'İlçe merkez koordinatları (public, NVI türevi). Salt-okunur referans; approx pin (D30) türetmek için kullanılır. D13 alanı yok.';

-- 2. SEED (${districts.length} rows, idempotent) ------------------------------------------------
insert into public.geo_districts (province, district, lat, lng) values
${values}
on conflict (province, district) do update set lat = excluded.lat, lng = excluded.lng;

-- 3. CENTROID JITTER -----------------------------------------------------------
create or replace function public.derive_approx_centroid(
  _lat  numeric,
  _lng  numeric,
  _seed uuid
)
returns table (approx_lat double precision, approx_lng double precision)
language sql
immutable
as $$
  -- Deterministic, portfolio-seeded jitter around a centroid: (u-0.5)*0.02 => ±0.01°
  -- (~±1.1 km). Spreads pins within the district while staying coarse (D30). Same
  -- md5 unit-hash idiom as derive_approx.
  select
    _lat::double precision
      + (abs(('x' || substr(md5(_seed::text || 'clat'), 1, 8))::bit(32)::int % 1000)::double precision
         / 1000.0 - 0.5) * 0.02,
    _lng::double precision
      + (abs(('x' || substr(md5(_seed::text || 'clng'), 1, 8))::bit(32)::int % 1000)::double precision
         / 1000.0 - 0.5) * 0.02;
$$;

comment on function public.derive_approx_centroid(numeric, numeric, uuid) is
  'D30: deterministic ±0.01° jitter around a (district) centroid, seeded by portfolio id.';

revoke execute on function public.derive_approx_centroid(numeric, numeric, uuid) from public, anon;
grant  execute on function public.derive_approx_centroid(numeric, numeric, uuid) to authenticated;

-- 4. SYNC TRIGGER (portfolios.city/district → approx) --------------------------
create or replace function public.sync_portfolio_approx_from_region()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  c record;
  j record;
begin
  -- Recompute only on insert or when the region changed (stable pin otherwise).
  if tg_op = 'INSERT'
     or new.city is distinct from old.city
     or new.district is distinct from old.district then
    if new.city is not null and new.district is not null then
      select lat, lng into c
      from public.geo_districts
      where province = new.city and district = new.district;
      if found then
        select * into j from public.derive_approx_centroid(c.lat, c.lng, new.id);
        new.approx_lat := j.approx_lat;
        new.approx_lng := j.approx_lng;
      else
        new.approx_lat := null;  -- unknown/legacy region → no pin (no error)
        new.approx_lng := null;
      end if;
    else
      new.approx_lat := null;
      new.approx_lng := null;
    end if;
  end if;
  return new;
end;
$$;

comment on function public.sync_portfolio_approx_from_region() is
  'D30: BEFORE INSERT/UPDATE on portfolios — derives approx_lat/lng from geo_districts[(city,district)] centroid + jitter. exact coords are NOT used. Unknown region → NULL.';

drop trigger if exists portfolios_sync_approx_region on public.portfolios;
create trigger portfolios_sync_approx_region
  before insert or update on public.portfolios
  for each row
  execute function public.sync_portfolio_approx_from_region();

-- 5. RETIRE the old exact→approx path -----------------------------------------
-- approx no longer derives from the locked exact coordinates (privacy++).
drop trigger if exists portfolio_private_sync_approx on public.portfolio_private;
`;

const out = path.join("supabase/migrations", "20260621120000_geo_districts_DRAFT.sql");
fs.writeFileSync(out, sql);
console.log(
  `wrote ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${districts.length} seed rows)`,
);
