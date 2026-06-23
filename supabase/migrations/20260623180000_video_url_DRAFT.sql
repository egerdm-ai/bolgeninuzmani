-- =============================================================================
-- Portföy videosu — video_url (Faz 2.4)
-- Bölgenin Uzmanı
-- -----------------------------------------------------------------------------
-- DRAFT — NOT auto-applied. Run `supabase db push`, then regenerate TS types
-- (video_url lands in database.types.ts; hand-added this session to keep typecheck green).
--
-- A single PUBLIC video link (YouTube/Vimeo/vb.) for the portfolio. Teaser-safe
-- (a link the owner chooses to share) — lives on the teaser `portfolios` table, no
-- locked data. The anon /p teaser does not surface it yet; the owner detail shows it.
-- (Adding it to get_public_portfolio later is a small, explicit allow-list follow-up.)
-- =============================================================================

alter table public.portfolios
  add column if not exists video_url text;

comment on column public.portfolios.video_url is
  'Faz 2.4 teaser-safe: optional public video link (e.g. YouTube) the owner attaches to the portfolio. No locked data.';
-- =============================================================================
-- END video_url
-- =============================================================================
