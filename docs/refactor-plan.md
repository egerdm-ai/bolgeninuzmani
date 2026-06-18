# Refactor Plan — Bölgenin Uzmanı

> Audit-phase recommendations, ordered. Respects the **gates**: no route removal
> and no large refactor without human approval; UI is preserved (incremental, no
> redesign). Each item is a small slice with acceptance criteria.

## P0 — Cheap, safe, do first (no approval needed beyond normal review)

### R0.1 — Run formatter (clears 773 lint errors)
`bun run format` (prettier). Fixes all `prettier/prettier` errors in one commit.
**AC:** `npx eslint .` drops to ~17 react-refresh warnings; build still green.

### R0.2 — Add `typecheck` script
Add `"typecheck": "tsc --noEmit"` to `package.json` scripts (DoD references
typecheck). **AC:** `bun run typecheck` exits 0.

### R0.3 — Brand sweep: "VAULT"/"Vault"/`vault.app` → Bölgenin Uzmanı
Copy/wordmark only — **not** a redesign, **not** the `components/vault/` folder
name (internal). Targets (from `current-code-audit.md` §4):
- Wordmarks: `p.$slug.tsx:41`, `v.$username.tsx:40`,
  `dashboard.portfolios.$id.share.tsx:187`, `sidebar.tsx:87,152`.
- Page `<title>`/OG: `p.$slug.tsx:15-17`, `v.$username.tsx:15-17`.
- Share domain `vault.app`: `dashboard.portfolios.$id.share.tsx:54`,
  `share-studio-preview.tsx:79,136`, `step-showcase.tsx:200,216` (use a
  placeholder like `bolgeninuzmani.app` / TBD real domain — see open-questions).
- Copy: "VAULT Asistan" → "Asistan" (or agreed name), "VAULT ağı", "VAULT PRO",
  `mock/data.ts:85,95` ("VAULT Network").
**AC:** `grep -rin "vault" src` returns only `components/vault/` paths + imports.
**Note:** "VAULT Asistan" rename needs the final assistant name (open question).

## P1 — Dead ends (do not break navigation)

### R1.1 — Portfolio edit route (missing CRUD "U")
Add `/dashboard/portfolios/$id/edit` and wire the "Düzenle" button
(`dashboard.portfolios.$id.index.tsx:31`). Reuse the create-wizard form
(`dashboard.portfolios.new.tsx`). **AC:** Düzenle navigates to a working edit form.

### R1.2 — "Profili Önizle" dead button
`dashboard.profile.tsx:49` → link to `/v/$username` (own public profile).
**AC:** button navigates.

### R1.3 — Verify remaining button candidates
Confirm handlers on `dashboard.portfolios.index.tsx:75`, `dashboard.search.tsx:242`
and any others flagged in `route-inventory.md`. Report-only until confirmed.

## P1 — Task 7: professional identity overlap (VERIFY, likely already fixed)

The overlap bug is architecturally resolved: `ProfessionalIdentityHeader` is the
single source of truth (cover decorative, avatar `z-10` controlled overlap, text
in safe zone) and both `professional-card.tsx:31` and `professional-profile.tsx:98`
use it. **Action = verification only:**
1. Screenshot card grid + hero at 375px / 768px / 1280px (via `qa` agent + dev server).
2. Confirm no other component re-implements cover+avatar stacking.
3. If clipping appears, adjust within `professional-identity-header.tsx` only
   (single point of change). **AC:** no overlap/clipping at all three widths.

## P1 — Duplicate AI routes (needs approval — route removal gate)

`dashboard/concierge` duplicates `dashboard/assistant` (both AI chat); "Concierge"
is retired naming. **Recommendation:** consolidate to one `assistant` route, retire
`concierge`. **Do not delete during audit** — flag for human decision
(see open-questions). `ai-import` stays as a distinct surface. All Later phase.

## P2 — Backend-readiness refactors (sequenced with backend slices)

### R2.1 — Introduce `src/lib/data/` access layer
Per `backend-integration-plan.md` §1. Move each entity from `mock/` behind a
stable accessor; flip to Supabase per slice. **AC:** routes import from
`lib/data/*`, not `lib/mock/*`, for migrated entities.

### R2.2 — Teaser vs locked at the data layer (security-critical)
Make `/p/$slug` and all teaser/list/search paths call a **teaser accessor** that
returns no locked columns. `PortfolioDetailView` keeps `mode` for layout only;
locked fields must be absent from public/teaser payloads — not hidden client-side
(`portfolio-detail-view.tsx:47`). Add missing locked fields to the model
(`exact_lat/lng`, `malik_info`, `private_description`, `private_notes`).
**AC:** network payload for `/p/$slug` contains zero locked fields (verified in
devtools / a test).

### R2.3 — Replace mock maps with MapLibre
`map-canvas-mock`, `approx-location-map`, `expertise-map` → single MapLibre
integration (Keşfet slice). Customer/teaser shows **approximate** location only.

## Ordering summary
R0.1–R0.3 (now) → R1.1–R1.3 + Task-7 verify → [approval] concierge consolidation
→ R2.x interleaved with backend Slices 1–5.

## Gate reminder
No large refactor or route deletion without human approval. UI preserved
(dark-luxury system, `docs/DESIGN_SYSTEM.md`). Add empty/loading/error states when
flipping any screen from mock to real data.
