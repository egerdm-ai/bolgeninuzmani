# Backend Integration Plan — Bölgenin Uzmanı (Tasks 8, 9, 10)

> Audit-phase document. Describes the data access layer (Task 8), the migration
> plan mapped to existing mock data (Task 9), and the first backend slice
> breakdown (Task 10). **GATED:** no migrations are written and nothing is applied
> until a human creates `.claude/AUDIT_APPROVED`. Migrations, once approved, are
> drafted to `supabase/migrations/` and a human runs `supabase db push`.

---

## 1. Data access layer design (Task 8)

### 1.1 Principles (from `CLAUDE.md` invariants)
- **Masking at the backend/RLS layer, never client-side.** Teaser paths must
  select only teaser columns; locked columns are gated by RLS on
  `portfolio_access_grants`.
- **Reads use anon/read-only**; **service role only in server-side write paths**,
  never shipped to the client.
- **Roles via `user_roles` + `has_role()`** security-definer; never a profiles col.
- Locked documents in a **private bucket**; short-lived signed URLs, access-checked.

### 1.2 Proposed layering (replaces mock modules incrementally)
```
src/lib/mock/*          (existing — kept until each slice flips)
        │  replace per entity, behind a stable accessor signature
        ▼
src/lib/data/           (NEW) typed data-access functions
  ├─ portfolios.ts      getPortfolioTeaser(slug) | getPortfolioFull(id, viewer)
  ├─ access.ts          requestDetail() | listRequests() | approveRequest() | hasAccess()
  ├─ profiles.ts        getProfile() | updateProfile()
  └─ auth.ts            session, currentProfile, role
        │
        ▼
TanStack Start server functions (*.server.ts / createServerFn)
  - read paths  → anon/publishable key + RLS
  - write paths → service role, server-only, never in client bundle
        │
        ▼
Supabase (Postgres + RLS + Storage + Auth)
```

### 1.3 Two query shapes for portfolios (the core distinction)
- `getPortfolioTeaser(...)` — used by `/p/$slug` (customer), list, search, and
  other-agent teaser. Selects **teaser columns only**. Backed by a SQL **view** or
  explicit column list so locked columns are physically absent from the payload.
- `getPortfolioFull(id, viewer)` — owner OR agent-with-grant only. RLS on the base
  table + `has_portfolio_access(viewer, portfolio)` returns locked columns.

> Refactor target: `PortfolioDetailView` must receive **already-masked data**
> from the server. The `mode` prop stays for layout, but it must no longer be the
> thing that decides whether locked data is present (it currently is —
> `portfolio-detail-view.tsx:47`). Public/teaser loaders call the teaser accessor;
> locked fields simply won't be in the object.

### 1.4 `has_portfolio_access()` contract
```
has_portfolio_access(viewer_id uuid, portfolio_id uuid) RETURNS boolean
  = viewer is owner
    OR EXISTS a row in portfolio_access_grants(portfolio_id, agent_id=viewer_id)
  -- security definer; RLS on locked columns/rows references THIS, never
  -- detail_requests.status (Invariant #2).
```

---

## 2. Migration plan mapped to mock data (Task 9)

Order respects FK dependencies and the MVP build order in `CLAUDE.md`.

| # | Migration | Tables / objects | Maps from mock |
|---|-----------|------------------|----------------|
| M1 | auth & roles | `profiles` (FK auth.users), `user_roles`, `has_role()` | `currentUser`, `Professional` core |
| M2 | portfolios | `portfolios` (teaser + locked cols), `portfolio_documents`, teaser **view**, enums (type/category/status/purpose/currency/location_mode/visibility) | `Portfolio`, `PortfolioDocument` |
| M3 | controlled access | `detail_requests`, `portfolio_access_grants`, `has_portfolio_access()`, RLS policies | `DetailRequest`, detail-request-store |
| M4 | storage | private bucket for documents + signed-URL access policy | `documents[].isLocked` |
| M5 | discovery (later) | `regions`, `region_watches`, `buyer_searches`, `saved_*`, `follows`, `notifications`, `applications` | matching/insights/notification mocks |

**RLS sketch (M2/M3):**
- `portfolios`: anyone authenticated can `SELECT` **teaser columns** of `active`
  portfolios; locked columns/rows require `has_portfolio_access()`. Customer
  (anon, shared link) → teaser view only.
- `detail_requests`: `requester_id` NOT NULL → must be a logged-in agent (D5);
  owner can read requests for their portfolios; requester can read own.
- `portfolio_access_grants`: insert only by portfolio owner (on approval);
  bulk + permanent (`expires_at` NULL).
- `user_roles`: readable by self + admin; never client-writable.

**Types:** after any approved migration, regenerate TS types
(`mcp__supabase__generate_typescript_types`) into `src/lib/database.types.ts`.

---

## 3. First backend slice breakdown (Task 10)

**Slice 1 — Auth + profiles + roles** (smallest shippable, unblocks everything).

| Step | Work | DoD |
|------|------|-----|
| 1 | (gated) Draft M1 migration → `supabase/migrations/` | human reviews + `db push` |
| 2 | Regenerate TS types | `database.types.ts` committed |
| 3 | `src/lib/data/auth.ts` + Supabase client (anon read; server fn for writes) | typed session/profile/role |
| 4 | Sign-up / sign-in UI wired (uses existing `/dashboard/profile`, landing apply form for invite) | real auth round-trip |
| 5 | Route guard on `/dashboard` (`dashboard.tsx` adds session check + redirect) | unauth → login |
| 6 | Replace `currentUser` mock with session-backed profile; keep mock fallback off | Profilim shows real data |
| 7 | `has_role()` wired; admin vs agent gating | role respected |

**Acceptance:** typecheck+build+lint green · a real user can sign in, sees their
profile, `/dashboard` is guarded · roles come from `user_roles` (verified: no role
on `profiles`) · no service-role key in client bundle · docs + Jira updated.

**Then, in order:** Slice 2 Portföy CRUD (incl. the **missing edit route** and
locked columns) → Slice 3 detail + WhatsApp share (flip `/p/$slug` to the teaser
accessor) → Slice 4 controlled-access engine (`detail_requests` + grants +
`has_portfolio_access` + request inbox + unlock) → Slice 5 Keşfet (search/filter +
MapLibre, teaser data only).

---

## 4. Gate reminder
Per `CLAUDE.md`: **Audit first.** This plan is for human approval. Do not write
or apply migrations, and do not call Supabase write tools, until
`.claude/AUDIT_APPROVED` exists. The Supabase MCP is connected and the official
Supabase + Postgres-best-practices skills are installed for when work begins.
