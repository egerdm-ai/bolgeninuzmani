# Current Code Audit — Bölgenin Uzmanı

> Produced by Claude during the **audit phase** (read-only). No Supabase writes,
> no migrations. Source of truth: `docs/DECISIONS_LOCKED.md` + `CLAUDE.md`.
> Companion files: `route-inventory.md`, `component-inventory.md`,
> `mock-data-inventory.md`, `backend-integration-plan.md`, `refactor-plan.md`,
> `open-questions.md`.

Date: 2026-06-18 · Branch: `main` · Stack: TanStack Start (React 19) + Vite 8 +
Tailwind v4 + shadcn/ui. **No backend** — all data is mock + in-memory stores.

---

## 1. Build / Test status (Task 1)

| Check | Command | Result |
|-------|---------|--------|
| Typecheck | `npx tsc --noEmit` | ✅ **PASS** (0 errors) |
| Build | `npx vite build` | ✅ **PASS** (built in ~1.9s) |
| Lint | `npx eslint .` | ⚠️ **790 problems** — 773 `prettier/prettier` (formatting, auto-fixable via `--fix`/`bun run format`) + 17 `react-refresh/only-export-components` warnings. **No logic/correctness errors.** |
| Unit tests | — | ❌ None configured (no test runner in `package.json`). |

**Status:** code compiles and builds clean. Lint noise is 100% cosmetic. The
773 prettier errors are a one-shot `format` away; they are listed as build-blocking
only if CI runs `eslint` with `--max-warnings 0`. Recommend running `bun run format`
as the first refactor commit (see `refactor-plan.md`).

There is no typecheck script in `package.json` — only `dev/build/lint/format`.
Recommend adding `"typecheck": "tsc --noEmit"`.

---

## 2. Architecture snapshot

- **Routing:** TanStack file-based routes in `src/routes/` (28 route files,
  `routeTree.gen.ts` auto-generated). Three view surfaces: public landing (`/`),
  public share links (`/p/$slug`, `/v/$username`), and the authenticated-style
  `/dashboard/*` shell (`src/routes/dashboard.tsx` → `AppShell`).
- **Data layer:** `src/lib/mock/` (`data.ts`, `types.ts`, `matching.ts`,
  `insights.ts`, `notifications.ts`) + six React-context "stores" in `src/lib/`
  (`detail-request-store`, `follow-store`, `my-searches-store`,
  `notification-store`, `region-watch-store`, `saved-store`). All in-memory; no
  persistence. Every store and mock module carries a `TODO[backend]` marker
  naming its future Supabase table.
- **Server functions:** only scaffolding — `src/lib/api/example.functions.ts`,
  `src/lib/config.server.ts`, `src/server.ts`. No real server endpoints, no
  Supabase client anywhere in `src/`.
- **UI:** shadcn/ui primitives in `src/components/ui/` (61 files), product
  components in `src/components/vault/` (54 files), landing in
  `src/components/landing/`, layout in `src/components/layout/`.

See `component-inventory.md` and `mock-data-inventory.md` for the full breakdown.

---

## 3. Security & access-model findings (HIGHEST PRIORITY)

These map directly against the non-negotiable invariants in `CLAUDE.md`.

### 3.1 Locked-field masking is client-side — violates Invariant #1
`/p/$slug` (the public **customer** link) loads the **entire** `Portfolio`
object via `getPortfolioBySlug` and renders `<PortfolioDetailView … mode="public">`
(`src/routes/p.$slug.tsx:9,50`). `PortfolioDetailView` decides what to hide purely
from the `mode` prop on the client (`unlocked = mode === "owner"`,
`src/components/vault/portfolio-detail-view.tsx:47-48`). Any locked field present
on the object would be in the client bundle regardless of mode.

> Today the leak is **latent, not active**: the mock `Portfolio` type does not yet
> contain the most sensitive locked fields (`malik_info`,
> `private_description`, `private_notes`, `exact_lat/lng`) — see §3.3. But the
> *architecture* is exactly the anti-pattern the invariant forbids. The fix is a
> backend concern: teaser vs locked must be split at the query/RLS layer so locked
> columns never reach public/teaser paths. Tracked in `backend-integration-plan.md`.

### 3.2 No grant concept exists yet — access is binary owner/not-owner
The product's heart (Detay Talebi → owner approval → `portfolio_access_grants` →
unlock) is **not modeled**. `PortfolioDetailView` unlocks only for `mode === "owner"`;
there is no "other agent with a grant" state. `detail-request-store.tsx` only opens
a request **modal** — it does not track request status or grants. So the
controlled-access engine is UI-only and must be built on the backend
(`detail_requests` + `portfolio_access_grants` + `has_portfolio_access()`).

### 3.3 Mock `Portfolio` type is missing locked fields from DECISIONS_LOCKED
`src/lib/mock/types.ts` `Portfolio` has `exactAddress?` and `documents[].isLocked`
only. The locked set in `DECISIONS_LOCKED.md` also requires: `exact_lat/exact_lng`,
`malik_info` (owner name + contact), `private_description`, `private_notes`. These
do not exist in the type or data. Schema design must add them as **locked
columns**, never sent on teaser paths.

### 3.4 Roles not modeled
No `user_roles` / `has_role()` concept anywhere. `currentUser` is a single hard-coded
mock (`src/lib/mock/data.ts:26`) with `membershipTier` (a billing tier, **not** an
auth role). Roles (`admin`, `agent`) must come from a `user_roles` table per
Invariant #3.

### 3.5 No auth guard on `/dashboard`
`dashboard.tsx` is a bare `AppShell` + `<Outlet/>` with no session check (expected —
no backend). Auth gating is the first MVP slice.

---

## 4. Brand / terminology drift (Task 5 — term audit)

Retired **"VAULT"** brand is still pervasive in code and copy (should be
**Bölgenin Uzmanı**). Non-exhaustive hits:

- Public link wordmark literally renders **"Vault"**: `p.$slug.tsx:41`,
  `v.$username.tsx:40`, `dashboard.portfolios.$id.share.tsx:187`, `sidebar.tsx:87`.
- Fake share domain `vault.app/...`: `dashboard.portfolios.$id.share.tsx:54`,
  `share-studio-preview.tsx:79,136`, `step-showcase.tsx:200,216`.
- "VAULT Asistan" / "VAULT PRO" / "VAULT Network" / "VAULT ağı": `sidebar.tsx:49,152`,
  `ai-assistant-preview.tsx:47`, `mock/data.ts:85,95`, multiple route subtitles,
  page `<title>`/OG tags in `p.$slug.tsx:15-17`, `v.$username.tsx:15-17`.
- `styles.css` design-system header comments say "VAULT" (cosmetic).

Product term **"Portföy"** is used correctly throughout (no "İlan" drift found).
The AI surface is named "VAULT Asistan" — the retired English "Concierge" also
survives as a whole route (see §5 and `route-inventory.md`).

Full list and remediation in `refactor-plan.md` (brand sweep is a P0 cosmetic
pass, but **not** a redesign — copy/wordmark only).

---

## 5. Dead ends, duplicates & structural smells

- **Dead buttons** (no handler, no `asChild`, no submit) — confirmed by reading
  context, not just grep:
  - `dashboard.profile.tsx:49` — "Profili Önizle" (no action).
  - `dashboard.portfolios.$id.index.tsx:31` — "Düzenle" (no action **and** there
    is no portfolio-edit route — see below).
  - Several more candidates listed in `route-inventory.md` (§Dead buttons).
- **Missing edit route:** there is `dashboard.portfolios.new.tsx` but no
  `…/$id/edit`. The "Düzenle" CTA is therefore a dead end. Portföy CRUD's **U**
  is absent.
- **Triple AI surface / duplicate routes:** `dashboard.assistant.tsx` (VAULT
  Asistan), `dashboard.concierge.tsx` (legacy "AI Concierge", retired naming),
  and `dashboard.ai-import.tsx` (AI import hub) are three overlapping AI screens.
  `assistant` and `concierge` are near-duplicate chat UIs. All AI is **Later
  phase** per scope — recommend consolidating to one "Asistan" route and removing
  `concierge` (per "do not remove routes" gate: flag for human approval, don't
  delete during audit).
- **Arayışlar vs Arayışlarım** (`searches` vs `my-searches`) — intentional split
  (network vs own), documented in `docs/searches-vs-my-searches.md`; not a smell,
  but both are **Later phase**.

---

## 6. Task 7 — professional identity header/card overlap bug: STATUS

**Appears already resolved at the system level.** `ProfessionalIdentityHeader`
(`src/components/vault/professional-identity-header.tsx`) is documented as the
single source of truth and explicitly fixes the overlap: cover is decorative,
only the avatar overlaps (controlled negative margin, own `z-10` layer), identity
text always sits in the safe zone below the cover. Both consumers use it:
`professional-card.tsx:31` (`variant="card"`) and `professional-profile.tsx:98`
(`variant="hero"`). No competing/legacy header composition was found.

→ Remaining work is **verification, not a fix**: capture screenshots of card +
hero at mobile/desktop to confirm no clipping, and ensure no other component
re-implements the cover+avatar stack. Tracked in `refactor-plan.md` §Task 7.

---

## 7. What's solid

- Typecheck + build green; types are coherent and centralized (`mock/types.ts`).
- Clean separation already exists between teaser-ish display and "locked" UI
  affordances (`LockedInfoPanel`, `DocumentLockList`, `locked-contact-card`) —
  good scaffolding to wire to real grants.
- Every mock module names its target table in a `TODO[backend]` comment — the
  intended data model is legible (see `mock-data-inventory.md`).
- `mode`-based view in `PortfolioDetailView` already distinguishes
  owner/member/public — the right *shape*, wrong *layer* (move the decision to
  the backend).

---

## 8. Next steps (gated)

Per the **Audit-first** gate: no Supabase writes/migrations until a human approves
and creates `.claude/AUDIT_APPROVED`. Proposed first backend slice (auth + profiles
+ roles) and the full migration mapping are in `backend-integration-plan.md`.
Open decisions needing a human are in `open-questions.md`.
