# Route Inventory — Bölgenin Uzmanı (Task 2 + Task 5)

> Read-only audit. TanStack file-based routing (`src/routes/`). Phase tags map to
> `DECISIONS_LOCKED.md` (MVP vs Later). "Do not remove routes" gate respected —
> dead ends are **flagged**, not deleted.

## Public routes (no auth)

| Route | File | Purpose | Phase | View mode |
|-------|------|---------|-------|-----------|
| `/` | `index.tsx` | Landing (hero, nasıl çalışır, özellikler, başvuru, SSS) | MVP | public |
| `/p/$slug` | `p.$slug.tsx` | **Public portfolio teaser** (customer shared link) | MVP | `mode="public"` |
| `/v/$username` | `v.$username.tsx` | Public professional profile | Later | public |

## Dashboard routes (`/dashboard/*`, `AppShell`)

| Route | File | Purpose | Phase |
|-------|------|---------|-------|
| `/dashboard` | `dashboard.index.tsx` | Dashboard home / overview | MVP |
| `/dashboard/portfolios` | `dashboard.portfolios.index.tsx` | **Portföylerim** (list) | MVP |
| `/dashboard/portfolios/new` | `dashboard.portfolios.new.tsx` | Create wizard | MVP |
| `/dashboard/portfolios/$id` | `dashboard.portfolios.$id.index.tsx` | Owner detail | MVP |
| `/dashboard/portfolios/$id/share` | `dashboard.portfolios.$id.share.tsx` | Share Studio (link + WhatsApp) | MVP (simplified) |
| `/dashboard/search` | `dashboard.search.tsx` | **Keşfet** search/filter (+ map) | MVP |
| `/dashboard/detail-requests` | `dashboard.detail-requests.tsx` | **Detay Talepleri** inbox | MVP |
| `/dashboard/professionals` | `dashboard.professionals.index.tsx` | Profesyoneller list | Later |
| `/dashboard/professionals/$id` | `dashboard.professionals.$id.tsx` | Professional profile | Later |
| `/dashboard/regions` | `dashboard.regions.index.tsx` | Bölgeler list | Later |
| `/dashboard/regions/$slug` | `dashboard.regions.$slug.tsx` | Region detail | Later |
| `/dashboard/favorites` | `dashboard.favorites.tsx` | Kaydedilenler | Later |
| `/dashboard/searches` | `dashboard.searches.index.tsx` | Arayışlar (network) | Later |
| `/dashboard/searches/$id` | `dashboard.searches.$id.tsx` | Network search detail | Later |
| `/dashboard/my-searches` | `dashboard.my-searches.index.tsx` | Arayışlarım | Later |
| `/dashboard/my-searches/new` | `dashboard.my-searches.new.tsx` | New buyer search | Later |
| `/dashboard/my-searches/$id` | `dashboard.my-searches.$id.tsx` | Own search detail | Later |
| `/dashboard/matches` | `dashboard.matches.tsx` | Eşleşmeler | Later |
| `/dashboard/notifications` | `dashboard.notifications.tsx` | Bildirimler | Later |
| `/dashboard/assistant` | `dashboard.assistant.tsx` | VAULT Asistan (chat) | Later |
| `/dashboard/concierge` | `dashboard.concierge.tsx` | Legacy "AI Concierge" chat — **DUPLICATE** | Later |
| `/dashboard/ai-import` | `dashboard.ai-import.tsx` | AI portfolio import hub | Later |
| `/dashboard/profile` | `dashboard.profile.tsx` | **Profilim** | MVP |
| `/dashboard/settings` | `dashboard.settings.tsx` | Ayarlar | MVP/Later |

**Totals:** 3 public + 24 dashboard route files (+ `__root.tsx`, `dashboard.tsx`
layout). MVP-critical: portfolios CRUD, share, search, detail-requests, profile,
auth (not yet present).

---

## Dead buttons / dead ends (Task 5)

Confirmed by reading surrounding code (grep false-positives for multi-line buttons
and `DropdownMenuTrigger asChild` were excluded):

| Location | Element | Issue |
|----------|---------|-------|
| `dashboard.profile.tsx:49` | "Profili Önizle" `<Button>` | No `onClick`, no `Link` → does nothing. Should route to `/v/$username` preview. |
| `dashboard.portfolios.$id.index.tsx:31` | "Düzenle" `<Button>` | No handler **and no edit route exists** (`…/$id/edit` missing). Dead end. |
| `dashboard.portfolios.index.tsx:75` | (verify) | Multi-line button — confirm handler during refactor. |
| `dashboard.search.tsx:242` | (verify) | Confirm handler. |

> Not dead (false positives, verified): `topbar.tsx:57`, `portfolio-list-row.tsx:63`,
> all `DropdownMenuTrigger`/`Dialog`/`Sheet` trigger buttons, shadcn primitives
> (`calendar`, `carousel`, `pagination`, `sidebar`). These wrap menus/triggers.

**Missing route:** portfolio **edit** (`/dashboard/portfolios/$id/edit`) — the
"U" in CRUD. Add in the Portföy CRUD slice.

---

## Label / term issues (brand drift)

Public-facing wordmark renders literal **"Vault"** and should be **Bölgenin Uzmanı**:
`p.$slug.tsx:41`, `v.$username.tsx:40`, `dashboard.portfolios.$id.share.tsx:187`,
`sidebar.tsx:87,152`. Page `<title>`/OG say "— VAULT" (`p.$slug.tsx:15-17`,
`v.$username.tsx:15-17`). Fake domain `vault.app` in share copy
(`dashboard.portfolios.$id.share.tsx:54`). Full list in `current-code-audit.md` §4.

---

## Duplicate / consolidation candidates (flag, do not delete in audit)

- `dashboard.concierge.tsx` duplicates `dashboard.assistant.tsx` (both AI chat).
  Recommend consolidating to **one** "Asistan" route; retire "Concierge" naming.
- `dashboard.ai-import.tsx` is a distinct AI-import surface — keep separate but
  Later-phase. All three AI routes are Later phase.

---

## Screenshots

Baseline route screenshots are **not captured** in this pass (no dev server /
Playwright run during read-only audit). Recommend capturing via the `qa` agent
after `bun run dev` as a separate, safe step — see `docs/23_SCREENSHOT_CAPTURE_PLAN.md`.
