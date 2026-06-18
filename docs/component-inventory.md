# Component Inventory — Bölgenin Uzmanı (Task 3)

> Read-only audit. 162 `.ts/.tsx` files in `src/`. Component dirs below.

## Counts

| Directory | Count | Nature |
|-----------|-------|--------|
| `src/components/ui/` | 46 | shadcn/ui primitives (Radix wrappers). Keep as-is. |
| `src/components/vault/` | 49 | Product components. **Rename dir → not required**, but brand-internal only. |
| `src/components/landing/` | 10 | Landing-page sections + mock previews. |
| `src/components/layout/` | 4 | `app-shell`, `sidebar`, `topbar`, `page-header`. |

## `src/components/vault/` — product components (49)

Grouped by domain:

**Portfolio**: `portfolio-card`, `portfolio-list-row`, `portfolio-preview-card`,
`portfolio-detail-view` ⭐ (the 3-mode renderer; see security note),
`portfolio-gallery`, `portfolio-analytics-card`, `portfolio-match-panel`,
`key-facts-strip`, `data-score`, `market-context-card`, `pdf-cta-card`.

**Controlled access (the heart)**: `detail-request-modal`, `locked-info-panel`,
`locked-contact-card`, `document-lock-list`, `owner-card`. → These are the UI
hooks for `detail_requests` + `portfolio_access_grants`. Currently visual only.

**Professional**: `professional-identity-header` ⭐ (single-source identity
composition, fixes overlap bug — Task 7), `professional-card`,
`professional-profile`, `professional-profile-tabs`, `professional-about-section`,
`professional-expertise-regions`, `professional-links-section`,
`professional-mini-card`, `professional-portfolio-catalog`,
`professional-portfolio-list-item`, `professional-quick-actions`,
`professional-search-card`, `broker-avatar`, `similar-professionals`,
`share-profile-button`.

**Region**: `region-card`, `region-expert-card`, `region-link-chip`,
`expertise-map`, `expertise-region-card`, `approx-location-map`,
`map-canvas-mock` (← replace with MapLibre).

**Search / discovery**: `search-result-card`, `filter-modal`, `filter-section`,
`network-search-card`, `buyer-search-card`, `save-search-modal`,
`match-explanation-card`.

**Shared/misc**: `badges`, `cards`, `ai-button`, `follow-button`.

## `src/components/landing/` (10)
`ai-assistant-preview`, `application-form` (→ `applications` table, P1 email),
`closed-listing-showcase`, `faq`, `hero-mockup`, `primitives`,
`professional-profile-preview`, `region-watch-preview`, `share-studio-preview`,
`step-showcase`. Several contain `vault.app` / "VAULT" copy (brand drift).

## `src/components/layout/` (4)
`app-shell` (dashboard wrapper), `sidebar` (nav — contains "Vault" wordmark +
"VAULT Asistan"/"VAULT PRO"), `topbar` (notifications dropdown), `page-header`.

## Hooks / lib
`src/hooks/use-mobile.tsx`. State stores in `src/lib/` (see `mock-data-inventory.md`).

## Observations
- Components are **well-decomposed**, not the "dağınık" risk feared in
  `01_CURRENT_STATE_AUDIT.md`. Naming is consistent.
- `map-canvas-mock` / `approx-location-map` / `expertise-map` all mock maps →
  single MapLibre integration point for the Keşfet slice.
- The locked-* and detail-request components are the right seams to wire the
  controlled-access backend into — no new UI needed for MVP, just real data.
- `*-preview` landing components are presentational mocks; safe to leave.

No duplicate/component-level dead code found beyond the duplicate **route**
(`concierge` vs `assistant`) noted in `route-inventory.md`.
