# Mock Data Inventory — Bölgenin Uzmanı (Task 4 + Task 9 mapping)

> Read-only audit. Every mock module already names its target Supabase table in a
> `TODO[backend]` comment. This file inventories the mock surface and maps each
> entity to its future table (Task 9). **No migrations written.**

## A. Mock data modules (`src/lib/mock/`)

### `types.ts` — the de-facto data model
Types: `User`, `Broker`, `Professional` (= `Broker` + profile extras),
`RegionExpertise`, `ProfessionalActivity`, `Portfolio`, `PortfolioDocument`,
`PortfolioType`, `PortfolioCategory`, `PortfolioStatus`, `Purpose`, `Currency`,
`LocationMode`, `Visibility`, `DetailRequest`, `DetailRequestStatus`,
`SavedSearch`, `Activity`, `BuyerSearch`, `MatchResult`, `Region`,
`AppNotification`, `NotificationLink`, `NotificationKind`, `NotificationFrequency`,
`RegionWatch`.

### `data.ts` — seed data + accessors
Exports: `propertyImages`, `currentUser` (single hard-coded user, `id="b_001"`),
`professionals`, `getProfessionalById`, `getProfessionalByUsername`, `portfolios`,
`getPortfolioBySlug`, `getPortfolioById`, `getPortfoliosByProfessional`,
`myPortfolios`, `detailRequests`, `savedSearches`, `activities`, `dashboardKpis`,
`conciergeSuggestions`.

### `matching.ts` — regions, buyer searches, matching, valuation, analytics
`regions`, `getRegionBySlug`, `getPortfoliosByRegion`, `regionSlugForName`,
`getExpertsForRegion`, `buyerSearches`, `mySearches`, `networkSearches`,
`getMySearchById`, `getNetworkSearchById`, `getBuyerSearchById`,
`getBuyerSearchesByProfessional`, `getMatchesForSearch`, `getMyMatchesForSearch`,
`getMyMatchesForBuyerSearch`, `getExpertsForSearch`,
`getMatchingSearchesForPortfolio`, `getValuationInsight`, `getPortfolioAnalytics`,
`networkAnalytics`. → **All Later phase** (matching engine, valuation).

### `insights.ts` — derived UI metrics
`getPortfolioDataScore`, `getMarketContext`, `getPortfolioTimeline`,
`isRegionExpert`, `topExpertRegion`, `getShareAnalytics`. → Computed/derived;
backend should derive from real columns or analytics events.

### `notifications.ts`
`appNotifications`. → `notifications` table (Later).

## B. In-memory stores (`src/lib/*-store.tsx`) — React context, no persistence

| Store | Hook | Future table | Phase |
|-------|------|--------------|-------|
| `detail-request-store` | `useDetailRequest` | `detail_requests` (+ opens modal only today) | **MVP** |
| `saved-store` | `useSaved` | `saved_portfolios` (favorites) | Later |
| `follow-store` | `useFollow` | `follows` | Later |
| `my-searches-store` | `useMySearches` | `buyer_searches` | Later |
| `region-watch-store` | `useRegionWatch` | `region_watches` | Later |
| `notification-store` | `useNotifications` | `notifications` | Later |

> Note: `detail-request-store` currently only **opens a modal** — it does not
> persist requests or track status. The real MVP flow needs status + grants.

## C. Entity → Supabase table mapping (Task 9)

| Mock entity | Table | Key columns / notes | Phase |
|-------------|-------|--------------------|-------|
| `currentUser`, `User` | `auth.users` + `profiles` | profile = display fields; FK to `auth.users.id` | **MVP** |
| (roles) | **`user_roles`** | `(user_id, role)` role ∈ {admin, agent}; `has_role()` security-definer. **NOT a profiles column** (Invariant #3) | **MVP** |
| `Professional` / `Broker` | `profiles` (+ aggregates) | expertise_regions, expertise_types, bio, cover; follower/portfolio counts derived | MVP (core) / Later (rich) |
| `Portfolio` | `portfolios` | **split teaser vs locked columns** (see below) | **MVP** |
| `PortfolioDocument` | `portfolio_documents` | `is_locked`; files in **private bucket**, signed URLs | **MVP** |
| `DetailRequest` | `detail_requests` | `requester_id` NOT NULL (member-only, D5), status enum | **MVP** |
| (grants) | **`portfolio_access_grants`** | bulk + permanent (`expires_at` NULL, D6/D7); RLS keys off this, not request status | **MVP** |
| `Region` | `regions` | slug, market context | Later |
| `RegionWatch` | `region_watches` | `(user_id, region_slug, frequency)` | Later |
| `BuyerSearch` | `buyer_searches` | owner_id, visibility (private/network) | Later |
| `MatchResult` | (derived) | matching service / view | Later |
| `SavedSearch` | `saved_searches` | | Later |
| (favorites) | `saved_portfolios` | | Later |
| `follow` | `follows` | | Later |
| `AppNotification` | `notifications` | realtime channel per uid | Later |
| `Activity` | `activity_log` | | Later |
| landing application form | `applications` | + admin email (Resend, P1) | P1 |

## D. Teaser vs locked column split for `portfolios` (CRITICAL, Task 9)

Per `DECISIONS_LOCKED.md`. RLS / a teaser view must guarantee locked columns
**never** reach teaser/list/public/customer paths.

**Public / teaser (always visible incl. customer link):** title, slug,
short_description, type, category, status, purpose, price, currency, city,
district, region_label, location_mode, approx_radius_km, rooms, gross_m2, net_m2,
land_m2, bathrooms, parking, features, tags, cover_image, images, view/request
counts, **owner agent's own contact** (phone/email/WhatsApp — OPEN per D8).

**LOCKED (unlock only via `portfolio_access_grants`, never to customer):**
`exact_address`, `exact_lat`, `exact_lng`, `malik_info` (property-owner name +
contact), `private_description`, `private_notes`, and `portfolio_documents` where
`is_locked = true` (tapu/PDF/deed).

**Gap:** the mock `Portfolio` type today has only `exactAddress?` + `documents`.
It is **missing** `exact_lat/lng`, `malik_info`, `private_description`,
`private_notes`. These must be added as locked columns in the schema (and to the
create-wizard form), and must **not** be present on teaser query results.

## E. Data integrity notes
- `currentUser.id = "b_001"` is deliberately aligned with `professionals[0]` so
  `myPortfolios` resolves — replace with `auth.uid()` join to `profiles`.
- `myPortfolios` / `mySearches` are module-level constants computed against
  `currentUser` — these become per-request, RLS-scoped queries.
- `companyName: "VAULT Network"` (`data.ts:85`) is brand drift in seed data.
