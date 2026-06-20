-- =============================================================================
-- Migration: 20260620160000_b11_tighten_grants  ⚠️ REVIEW GEREKLİ — DRAFT, NOT APPLIED
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     B11 fix — least-privilege table grants (defense-in-depth)
--
-- WHY
--   Supabase ships `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES
--   TO authenticated` (and anon). So EVERY table created without an explicit
--   `revoke ... from authenticated` ends up with the full
--   DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE grant — overriding the
--   intent of the B7/B11 migrations (which only revoked from public + anon). RLS is
--   FORCED with restrictive policies, so this is NOT an open door (rows stay gated);
--   but the GRANT matrix is wider than designed. This migration resets it to least
--   privilege for the tables whose write paths are UNAMBIGUOUS.
--
--   Scope here = tables with NO client-side direct writes OR clearly owner-scoped
--   writes:
--     notifications        → SELECT, UPDATE      (system-written; client reads + marks read)
--     follows              → SELECT, INSERT, DELETE        (owner edges)
--     saved_portfolios     → SELECT, INSERT, DELETE        (owner bookmarks)
--     searches             → SELECT, INSERT, UPDATE, DELETE (owner CRUD)
--     detail_requests      → SELECT only          (writes via SECURITY DEFINER RPCs)
--     portfolio_access_grants → SELECT only       (writes via SECURITY DEFINER RPCs)
--     user_roles           → SELECT only          (no client writes; roles managed server-side)
--
--   NOT touched here (client DOES write directly → need per-flow review before
--   tightening, see RETURN_CHECKLIST): portfolios, portfolio_private,
--   portfolio_images, portfolio_documents, profiles, applications.
--
-- SAFETY
--   * Only authenticated/anon/public are reset; service_role keeps its grants.
--   * SECURITY DEFINER RPCs/triggers run as `postgres` (BYPASSRLS) and own these
--     tables, so revoking `authenticated` write does NOT affect RPC/trigger writes
--     (e.g. detail_requests / portfolio_access_grants writes via request/approve/
--     reject; notifications writes via the notify trigger).
--   * RLS policies are unchanged; this only narrows table-level capabilities.
--
-- APPLY: human `supabase db push`. No type regen (grants only).
-- =============================================================================

-- notifications — system-written; client may read + flip read flag only.
revoke all on public.notifications from authenticated, anon, public;
grant select, update on public.notifications to authenticated;

-- follows — owner edge create/remove.
revoke all on public.follows from authenticated, anon, public;
grant select, insert, delete on public.follows to authenticated;

-- saved_portfolios — owner bookmark add/remove.
revoke all on public.saved_portfolios from authenticated, anon, public;
grant select, insert, delete on public.saved_portfolios to authenticated;

-- searches — owner full CRUD.
revoke all on public.searches from authenticated, anon, public;
grant select, insert, update, delete on public.searches to authenticated;

-- detail_requests — writes go ONLY through the request/approve/reject definer RPCs.
revoke all on public.detail_requests from authenticated, anon, public;
grant select on public.detail_requests to authenticated;

-- portfolio_access_grants — writes go ONLY through the approve definer RPC.
revoke all on public.portfolio_access_grants from authenticated, anon, public;
grant select on public.portfolio_access_grants to authenticated;

-- user_roles — never client-written; read-only for the current user (RLS scopes).
revoke all on public.user_roles from authenticated, anon, public;
grant select on public.user_roles to authenticated;
