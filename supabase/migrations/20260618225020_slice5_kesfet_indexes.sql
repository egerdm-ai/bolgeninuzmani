-- =============================================================================
-- Migration: 20260618225020_slice5_kesfet_indexes  (DRAFT — NOT APPLIED)
-- Slice 5 — Keşfet list/filter/search performance indexes.
--
-- Supports listNetworkPortfolios(): active portfolios filtered by category /
-- transaction_type / price / city-district-neighborhood (ilike) / room_count,
-- text-searched on title+location, ordered by created_at desc.
--
-- Index-only / additive; no data change. Safe to apply anytime. A human runs
-- `supabase db push`. (M2 already created indexes on status, (city,district),
-- owner_id, slug — these add the remaining filter/search columns.)
--
-- pg_trgm enables fast ILIKE '%...%' (leading-wildcard) text search via GIN.
-- =============================================================================

create extension if not exists pg_trgm;

-- Equality / range filters
create index if not exists portfolios_transaction_type_idx
  on public.portfolios (transaction_type);
create index if not exists portfolios_category_idx
  on public.portfolios (category);
create index if not exists portfolios_price_idx
  on public.portfolios (price);

-- The default Keşfet feed: active portfolios, newest first.
create index if not exists portfolios_active_created_idx
  on public.portfolios (created_at desc)
  where status = 'active'::public.portfolio_status;

-- Trigram GIN indexes for ILIKE '%term%' search/filter.
create index if not exists portfolios_title_trgm
  on public.portfolios using gin (title gin_trgm_ops);
create index if not exists portfolios_city_trgm
  on public.portfolios using gin (city gin_trgm_ops);
create index if not exists portfolios_district_trgm
  on public.portfolios using gin (district gin_trgm_ops);
create index if not exists portfolios_neighborhood_trgm
  on public.portfolios using gin (neighborhood gin_trgm_ops);

-- =============================================================================
-- NOTE: purely performance; no RLS/teaser/leak implications. Optional until the
-- network grows (small datasets are fine without these). Regenerating TS types
-- is NOT required (no schema shape change).
-- =============================================================================
