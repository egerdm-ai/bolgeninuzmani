# Route Quarantine — Slice 0 / PARÇA C (D18)

> **Nothing is deleted.** Deferred / duplicate features are gated OFF: their routes
> still exist but `beforeLoad` redirects them, their nav entries are removed, and
> their reachable CTAs are hidden behind feature flags. Re-enable by flipping a
> flag in `src/lib/feature-flags.ts`. UI of MVP screens is otherwise unchanged.

## Feature flags (`src/lib/feature-flags.ts`)

| Flag | Covers | Value |
|------|--------|-------|
| `arayis` | `/dashboard/searches` (network) + `/dashboard/my-searches` (own) | `false` |
| `matches` | `/dashboard/matches` | `false` |
| `follow` | `/dashboard/favorites` (kaydedilenler / takip) | `false` |
| `assistant` | `/dashboard/assistant` (+ retired `/dashboard/concierge`) | `false` |
| `aiImport` | `/dashboard/ai-import` | `false` |
| `regions` | `/dashboard/regions` (bölge uzmanı dizini) | `false` |
| `professionals` | `/dashboard/professionals` **directory/index only** (individual `$id` profile stays reachable) | `false` |

## Routes — what happened (none deleted)

| Route | File | Action when flag OFF |
|-------|------|----------------------|
| `/dashboard/searches/` | `dashboard.searches.index.tsx` | `beforeLoad` → redirect `/dashboard` (`arayis`) |
| `/dashboard/searches/$id` | `dashboard.searches.$id.tsx` | redirect `/dashboard` (`arayis`) |
| `/dashboard/my-searches/` | `dashboard.my-searches.index.tsx` | redirect `/dashboard` (`arayis`) |
| `/dashboard/my-searches/new` | `dashboard.my-searches.new.tsx` | redirect `/dashboard` (`arayis`) |
| `/dashboard/my-searches/$id` | `dashboard.my-searches.$id.tsx` | redirect `/dashboard` (`arayis`) |
| `/dashboard/matches` | `dashboard.matches.tsx` | redirect `/dashboard` (`matches`) |
| `/dashboard/assistant` | `dashboard.assistant.tsx` | redirect `/dashboard` (`assistant`) |
| `/dashboard/ai-import` | `dashboard.ai-import.tsx` | redirect `/dashboard` (`aiImport`) |
| `/dashboard/regions/` | `dashboard.regions.index.tsx` | redirect `/dashboard` (`regions`) |
| `/dashboard/regions/$slug` | `dashboard.regions.$slug.tsx` | redirect `/dashboard` (`regions`) |
| `/dashboard/favorites` | `dashboard.favorites.tsx` | redirect `/dashboard` (`follow`) |
| `/dashboard/professionals/` | `dashboard.professionals.index.tsx` | redirect `/dashboard` (`professionals`) — directory only |
| `/dashboard/professionals/$id` | `dashboard.professionals.$id.tsx` | **kept reachable** (portfolio-owner profile; same component as public `/v/$username`) |
| `/dashboard/concierge` | `dashboard.concierge.tsx` | **retired** → always redirect `/dashboard/assistant` (merged, D18) |

> `concierge` → `assistant` → (assistant flag off) → `/dashboard`. When `assistant`
> is later enabled, concierge still lands users on the unified Asistan.

## Navigation changes (`src/components/layout/sidebar.tsx`)

Removed from sidebar (routes preserved):
- **Keşfet group:** removed **Bölgeler** (regions), **Arayışlar** (searches), **Profesyoneller** (professionals directory). Only Portföyler (`/dashboard/search`) remains.
- **Workspace group:** removed **Arayışlarım** (my-searches), **Eşleşmeler** (matches), **Asistan** (assistant). Kept Portföylerim, Detay Talepleri, **Bildirimler** (kept — Slice 4 controlled-access engine will populate it).
- Unused icons pruned (`Map`, `Target`, `GitCompareArrows`, `Sparkles`, `Users2`).

Remaining MVP nav: Ana Sayfa · Keşfet (Portföyler) · Portföylerim · Detay Talepleri · Bildirimler · Profilim · Ayarlar.

## CTA / component gates (avoid dead-end CTAs — CLAUDE.md gate)

Reusable components that surface on MVP-reachable pages now respect the flags:
- **`ai-button.tsx` (AIButton)** → renders `null` when `!assistant && !aiImport`. Hides AI entry points in **topbar (global)**, `dashboard.index`, `dashboard.portfolios.index`, `dashboard.portfolios.new`.
- **`region-link-chip.tsx`** → renders a static (non-link) chip when `!regions`. Region names still show on owner/professional cards; no broken link.
- **`portfolio-match-panel.tsx`** → renders `null` when `!arayis && !matches`. Removed from portfolio detail right rail.
- **`dashboard.index.tsx`** → "Yeni Arayış" quick action gated by `arayis`; "Asistan" quick action + "Asistan" right-rail CTA card gated by `assistant`. (Quick-actions grid shows 2 cards while deferred; refills when flags flip.)
- **`dashboard.search.tsx`** → "Asistan'a Sor" button gated by `assistant`.
- **`professional-search-card.tsx`** (on professional profile, reachable via `$id` + `/v/$username`) → "Arayışı Gör" gated by `arayis`, "Portföyümle Eşleştir" gated by `matches`; "Benzer Portföy Ara" (→ Keşfet) kept.
- **`professional-expertise-regions.tsx`** → "Bölge" link gated by `regions` (region name still shown).
- **`v.$username.tsx`** → public header "Profesyoneller" back-link gated by `professionals` (points to the quarantined directory).

> Individual professional profiles (`$id` / `/v/$username`) stay reachable, so the
> many owner-profile links across the app (owner-card, portfolio-card,
> search-result-card, similar-professionals, …) are **not** dead-ends — they were
> the reason `$id` is kept open while only the directory is quarantined.

## Residual links inside already-quarantined pages (no action needed)
Cards like `network-search-card`, `buyer-search-card`, `region-card` link to deferred
routes but are only rendered inside quarantined pages (searches/matches/regions/
my-searches), so they are unreachable while flags are off.

## Resolved decisions (PARÇA C final)
- **Profesyoneller — QUARANTINED (directory only).** The `/dashboard/professionals`
  index is gated + removed from nav (bölge uzmanı dizini, Later). The individual
  profile `/dashboard/professionals/$id` is **kept reachable** so portfolio-owner
  links across the app are not dead-ends; its deferred sub-card links
  (arayış/eşleşme/regions) are gated.
- **Bildirimler — KEPT in nav (not quarantined).** Slice 4 (controlled-access
  engine) will produce notifications (request received / approved). Renders an
  empty/placeholder list until then.

## Build status
typecheck ✅ · build ✅ · lint ✅ (0 errors, 17 pre-existing react-refresh warnings).

## To re-enable a feature later
Flip its flag to `true` in `src/lib/feature-flags.ts`, restore its nav entry in
`sidebar.tsx`, and (if needed) un-gate its CTAs. No route files need to be recreated.
