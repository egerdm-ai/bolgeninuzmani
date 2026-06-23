-- =============================================================================
-- Locked-model redesign — BELGELER teaser visibility (K1 / Faz 2.1)
-- Bölgenin Uzmanı
-- -----------------------------------------------------------------------------
-- DRAFT — NOT auto-applied. A human runs `supabase db push` after review, then
-- regenerates TS types (the new enum value + column land in database.types.ts).
--
-- WHAT THIS DOES
--   K1: a portfolio's locked DOCUMENTS show their TYPE in the teaser
--   ("Kilitli: Kat Planı") while the CONTENT stays gated by has_portfolio_access.
--   To expose only the TYPE in a teaser-safe way (no path, no content, no row
--   access to portfolio_documents), we DENORMALIZE the distinct document kinds
--   onto portfolios.locked_document_kinds — the same pattern as the existing
--   locked_photo_count (m4c). The teaser reads this column; signed-URL content is
--   unchanged and still owner/grant-only.
--
-- LEAK-SAFETY
--   * locked_document_kinds holds ONLY the kind enum values (e.g. 'kat_plani') —
--     never a storage path or document content.
--   * It lives on `portfolios`, which verified agents may already read for ACTIVE
--     rows via portfolios_select_network — so teaser paths never touch the
--     portfolio_documents table (the leak test keeps forbidding that table name).
--   * The recompute trigger reads portfolio_documents, but a trigger is not a
--     teaser READ path; document CONTENT is still minted only through an
--     access-checked signed URL (unchanged).
--
-- 1) document_kind: add the primary type "Kat Planı" (first). Tapu stays in the
--    enum but is NOT a default in the UI (handled in Faz 2.4 media wiring).
-- 2) portfolios.locked_document_kinds text[] (teaser-safe) + recompute trigger.
-- 3) Backfill existing rows.
-- =============================================================================

-- 1) Enum: primary document type. ADD VALUE is not used in the same transaction
--    below, so this is safe. IF NOT EXISTS makes it idempotent.
alter type public.document_kind add value if not exists 'kat_plani' before 'tapu';

-- 2) Teaser-safe denormalized column: which locked document TYPES a portfolio has.
alter table public.portfolios
  add column if not exists locked_document_kinds text[] not null default '{}';

comment on column public.portfolios.locked_document_kinds is
  'Teaser-safe (K1/Faz 2.1): DISTINCT kinds of this portfolio''s locked documents, e.g. {kat_plani}. Type only — never a path or content. Maintained by sync_portfolio_locked_doc_kinds(); content stays gated by has_portfolio_access via signed URLs.';

-- Recompute helper: set portfolios.locked_document_kinds from portfolio_documents.
create or replace function public.sync_portfolio_locked_doc_kinds()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid := coalesce(new.portfolio_id, old.portfolio_id);
begin
  update public.portfolios p
     set locked_document_kinds = coalesce(
       (select array_agg(distinct d.kind::text order by d.kind::text)
          from public.portfolio_documents d
         where d.portfolio_id = pid),
       '{}'
     )
   where p.id = pid;
  return null;
end;
$$;

drop trigger if exists trg_sync_locked_doc_kinds on public.portfolio_documents;
create trigger trg_sync_locked_doc_kinds
  after insert or update of kind, portfolio_id or delete
  on public.portfolio_documents
  for each row
  execute function public.sync_portfolio_locked_doc_kinds();

-- 3) Backfill existing portfolios.
update public.portfolios p
   set locked_document_kinds = coalesce(
     (select array_agg(distinct d.kind::text order by d.kind::text)
        from public.portfolio_documents d
       where d.portfolio_id = p.id),
     '{}'
   );

-- NOTE (follow-up, Faz 2.4 / customer page): to also show the locked document TYPE
-- on the ANON /p/$slug customer teaser, add `locked_document_kinds` to the
-- get_public_portfolio RPC allow-list (kinds only). Not done here to keep the public
-- allow-list change explicit. For network (logged-in) agents no RPC change is needed —
-- they read the column directly via portfolios_select_network.
-- =============================================================================
-- END locked-model docs
-- =============================================================================
