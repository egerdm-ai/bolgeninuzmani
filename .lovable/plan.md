# VAULT — UI-First MVP Scaffold Plan

Build a polished, dark luxury real estate SaaS frontend matching the uploaded VAULT design reference. Mock data only — no backend, no auth, no Supabase. All interactions are local React state.

## 1. Design system (`src/styles.css` + fonts)

Replace the default theme with VAULT's dark-luxury tokens (converted to the required oklch format), dark-first:

- Base surfaces: near-black `#05080c` background, layered charcoal surfaces (`#0b1118`, `#101720`, `#151d27`).
- Accent: gold (`#d7a943`) as `--primary`, with gold-light/gold-dark for gradients and glows.
- Text: warm off-white primary, muted greys.
- Status colors: success green, danger red, warning amber, info blue.
- Map shadcn/sidebar tokens onto these values so existing UI components inherit the dark theme.
- Add gold gradient + soft glow shadow utility tokens for primary buttons and luxury emphasis.
- Force the app into dark mode (apply `dark` class on `<html>` in `__root.tsx`).
- Fonts via `<link>` in `__root.tsx` head: a serif for the VAULT logo/display (Cormorant Garamond / Playfair Display) and a clean sans for UI/body (Inter or Manrope). Register `--font-display` / `--font-sans` in `@theme`.

## 2. Mock data + types (`src/lib/mock/`)

Implement the data contracts from the docs as TypeScript types and seed arrays:
- `types.ts` — `User`, `Broker`, `Portfolio`, `PortfolioDocument`, `DetailRequest`, `SavedSearch`, `Activity`, `ConciergeResult`.
- `data.ts` — current user (Taylan Hersek), ~8–10 luxury portfolios (Bodrum/İstanbul villas, with locked docs), brokers/professionals, detail requests across all statuses, saved searches, activity feed, KPI figures.
- Property imagery: generate a small set of luxury real estate images (villas, interiors, sea views) into `src/assets/` and reference them from mock data so cards/galleries look real.

## 3. Layout system (`src/components/layout/`)

- `AppShell` — fixed left `Sidebar`, sticky `Topbar`, scrollable content area, optional right-rail slot.
- `Sidebar` — VAULT serif logo, main nav (Ana Sayfa, Portföy Ara, Portföylerim, Detay Talepleri, Kaydettiklerim, AI Concierge), account group (Profilim, Ayarlar), VAULT PRO membership card, user mini-card. Active item: gold text/icon + subtle gold background + left accent. Collapsible to icon-rail.
- `Topbar` — search input, primary CTA (Portföy Oluştur / AI ile Portföy Oluştur), notification bell with badge, user avatar dropdown.
- `PageHeader` — title, subtitle, breadcrumbs, actions.
- `RightRail` — reusable sticky right panel wrapper.

## 4. Reusable components (`src/components/vault/`)

Built on existing shadcn primitives, styled to the design system:
- Display: `StatCard`/`KpiCard`, `StatusBadge`, `FeatureChip`, `CategoryChip`, `VisibilityBadge`, `LockedBadge`, `PriceText`.
- Cards: `SurfaceCard`, `ActionCard`/`QuickActionCard`, `InfoPanel`, `EmptyStateCard`.
- Portfolio: `PortfolioCard`, `PortfolioListRow`, `PortfolioPreviewCard`, `PortfolioGallery`, `KeyFactsStrip`, `LockedInfoPanel`, `OwnerCard`, `ApproxLocationMap` (mocked dark map with gold radius), `DocumentLockList`.
- `MapCanvasMock` — stylized dark map with gold cluster/pins, selectable, for search + wizard.
- `AIButton` — gold-accented AI action button.

## 5. Routes / screens (`src/routes/`)

TanStack file-based routing. A `dashboard.tsx` layout route renders `AppShell` + `<Outlet />`; child routes are dot-separated files.

Public:
- `index.tsx` (`/`) — simple premium marketing landing with hero + CTA to enter dashboard.
- `p.$slug.tsx` (`/p/[slug]`) — public/shared portfolio teaser page (limited info, locked panels, Detay Talebi CTA).

Dashboard (under `dashboard` layout):
- `/dashboard` — Dashboard home: hero with property bg + welcome, quick-action cards, KPI cards, recent portfolios row, incoming requests preview, activity feed, AI Concierge CTA, right rail.
- `/dashboard/search` — Map-first search: filter chips + filter panel, `MapCanvasMock` as primary area, selected `PortfolioPreviewCard` in right rail, saved-search button, list/map toggle (default map).
- `/dashboard/portfolios` — My Portfolios: status tabs (Tümü/Aktif/Taslak/Pasif/Satıldı), KPI row, table of `PortfolioListRow` with row actions.
- `/dashboard/portfolios/new` — 6-step wizard (Temel Bilgiler, Konum & Fiyat, Detaylar, Medya, Gizlilik & Paylaşım, Önizleme) with `WizardStepper`, step forms, sticky live-preview right rail, AI ile Portföy Oluştur + Taslak Kaydet buttons. Publish → navigates to Share Studio.
- `/dashboard/portfolios/$id` — owner portfolio detail/preview (full info + edit/share actions).
- `/dashboard/portfolios/$id/share` — Share Studio: channel tabs (WhatsApp/Link/PDF/E-posta), WhatsApp preview card + generated message, copy message/link buttons, PDF preview + mock download, public link.
- `/dashboard/detail-requests` — Detail Requests inbox: status tabs, request list, right-side detail panel with Yanıtla / Erişim Ver / Reddet actions.
- `/dashboard/favorites` — saved portfolios grid.
- `/dashboard/concierge` — AI Concierge split screen: chat (suggested prompts, messages, extracted criteria chips) + results (portfolio cards + professional cards) with mocked AI response.
- `/dashboard/ai-import` — AI Import Hub single page: source tabs (WhatsApp/PDF/Fotoğraflar/Manuel), paste/upload area, mock extraction → draft preview with confidence indicators + missing fields, Portföy Taslağına Dönüştür CTA.
- `/dashboard/profile` — basic premium broker profile edit.
- `/dashboard/settings` — tabs (Hesap/Gizlilik/Tercihler) with basic controls.

Detail-request flow uses a modal (`DetailRequestModal`) on portfolio detail pages.

## 6. Interactivity (mock state)

- Save/unsave portfolios and searches toggle local state.
- Wizard step navigation + form state.
- Search filters update mock result list/pins.
- Concierge prompt produces a canned structured response.
- AI Import "extracts" a prefilled draft.
- Copy-to-clipboard for share message/link; toasts via existing sonner.
- Detail request actions change request status in local state.

## 7. Verification

After build, load the preview, confirm dark luxury styling, navigate every route via the sidebar, and screenshot the Dashboard, Search, Portfolio Detail, and Wizard to confirm visual fidelity to the reference.

---

### Technical notes
- Stack: TanStack Start + React 19, Tailwind v4 (CSS-first tokens in `src/styles.css`), shadcn/ui already present.
- No `createServerFn`, no Supabase, no auth — purely client-side mock data and state.
- All UI copy in Turkish per the spec; product term is "Portföy".
- Reuse shadcn components (tabs, dialog, dropdown, slider, switch, table, sonner, etc.) styled through the design tokens rather than rebuilding primitives.
- Generated property images stored as static assets in `src/assets/`.

### Scope excluded (per MVP freeze)
Messaging, trust score, references, company profiles, group visibility, advanced analytics, billing, real WhatsApp API, URL scraping — not built.