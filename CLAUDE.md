# CLAUDE.md — Bölgenin Uzmanı

**Bölgenin Uzmanı** is a private, invite-only real estate network for verified
agents (emlakçı). Agents share **Portföy** (portfolios) whose sensitive fields
are **locked**; other agents request access and the owner approves; agents also
share portfolios with their own customers via WhatsApp links. Behave as a lead
architect + senior full-stack engineer. Plan before building.

> Context lives in `docs/` (Company Brain). Human decisions are locked in
> `docs/DECISIONS_LOCKED.md` — treat that as source of truth.

---

## Brand & terminology (never drift)
- Product brand is **Bölgenin Uzmanı**. Technical/repo name: `bolgeninuzmani`.
  The old "VAULT" name is retired — do not use it anywhere.
- Main entity is **Portföy** (NOT "İlan" — İlan is never used as a product term).
- Concepts: Portföy, Detay Talebi, Kontrollü Erişim, Erişim İzni (grant),
  Kilitli Alanlar, Share Studio, Bölge Uzmanı. (Arayış, Eşleşme, Asistan = later.)
- Preserve Turkish product copy. No English product terms.

## The product's heart — controlled access
This is core, in the MVP, not deferred:
- A portfolio has PUBLIC (teaser) fields and LOCKED fields.
- Other agents see the teaser, send a **Detay Talebi**, the owner approves, and a
  **`portfolio_access_grants`** row unlocks the locked fields for that agent.
- Grants are **bulk** (all locked fields at once) and **permanent** (expires_at NULL).
- Only members (authenticated agents) can send a request.

## Access layers
- **Owner agent:** full access to own portfolio.
- **Other logged-in agent:** teaser + can request → grant unlocks locked fields.
- **Customer (not logged in, shared link):** PUBLIC teaser only, no unlock path.

## Locked field set
exact_address, exact_lat/exact_lng, tapu/documents/PDF, malik_info (property
owner + contact), private_description, private_notes.
(The **agent's own** contact — phone/email/WhatsApp — is OPEN everywhere; this is
how customers reach the agent via the shared link.)

## MVP scope (build order)
1. **Auth + profiles + `user_roles`**.
2. **Portföy CRUD** — create wizard, fields, images, status; teaser vs locked
   columns + RLS; "Portföylerim".
3. **Portföy detay + WhatsApp paylaşım** — `/p/$slug` public teaser link;
   detail view in 3 modes (owner full / other-agent teaser / customer public).
4. **Kontrollü erişim motoru** — detail_requests + access_grants +
   `has_portfolio_access()` + unlock + request inbox.
5. **Keşfet** — search / filter / MapLibre map (logged-in agents, teaser data).

## Later phases (do NOT build in MVP)
Arayış oluşturma · Arayış↔Portföy eşleştirme + bildirim · Bölge uzmanı dizini ·
Takip · AI asistan · Share Studio full (PDF/QR/analitik).

## Security invariants (non-negotiable)
1. Locked fields NEVER reach the client via teaser/list/public/customer paths.
   Masking at the backend/RLS layer, never client-side.
2. RLS decides locked-field visibility on **grants** (`has_portfolio_access`),
   never on `detail_requests.status`.
3. Roles from a **`user_roles` table** + `has_role()` security-definer — never
   from a `profiles` column. Roles: `admin`, `agent`.
4. Exploration/reads use anon/read-only role; service role only in server-side
   write paths, never client-side.
5. Locked documents in a private bucket; short-lived signed URLs, access-checked.

## Infra & providers
- Backend: **own Supabase** (free dev/staging now; org → Pro at real beta).
  Use the **official Supabase plugin** (MCP + skills) for platform mechanics.
- **Migrations drafted, not auto-applied:** write to `supabase/migrations/`; a
  human runs `supabase db push`. Regenerate TS types after schema changes.
- Map: **MapLibre**. Deploy: Vercel. Email: Resend (P1). AI (Anthropic): later.

## UI rules
- Preserve the dark-luxury visual system (see `docs/DESIGN_SYSTEM.md`), branded
  **Bölgenin Uzmanı**. No redesign; incremental refactor only. Add empty /
  loading / error states when moving from mock to real data.

## Git / Jira / Docs (auto-managed)
- Conventional commits, branch/worktree per slice, reference the Jira key.
- `jira-sync`: transition issues at start/done via Jira MCP.
- `docs-sync`: update affected `docs/` in the same slice.

## Definition of Done (every slice)
typecheck + build + lint green · acceptance criteria met · tests/screenshots ·
docs updated · Jira transitioned · committed with Jira key.

## Gates
- **Audit first.** No Supabase writes or migrations until the audit is produced
  and a human approves it (create `.claude/AUDIT_APPROVED`).
- Do not remove routes or create dead-end CTAs. Approval before large refactors.
