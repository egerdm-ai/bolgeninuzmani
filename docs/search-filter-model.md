# Search / Filter Model

How the shared taxonomy (`src/lib/taxonomy.ts`) maps across the three surfaces
that consume it. Mock-only today; the "Backend" column lists what each filter
maps to once a real database exists.

## Shared filter state

All three screens drive a flat `FilterState = Record<string, FilterValue>`
(`FilterValue = string | number | boolean | string[] | undefined`). Reusable UI:

- `FilterSection` — collapsible group (`src/components/vault/filter-section.tsx`)
- `FilterField` / `FilterFieldGrid` — generic renderer driven by `FieldDef.type`

## Portföy Ara (`/dashboard/search`)

Filter sections (from `filterSections`), category-aware:

| Section | Filters | Backend mapping |
| --- | --- | --- |
| Hızlı Filtreler | feature chips | `features @> {...}` |
| Lokasyon | city, region/district, neighborhood | `city`, `region_label`, `neighborhood` |
| Portföy Tipi | category, subcategory, transaction | `category`, `subcategory`, `purpose` |
| Fiyat | priceMin, priceMax, currency | `price` range, `currency` |
| Alan / m² | grossM2, netM2, landM2, rooms | `gross_m2`, `net_m2`, `land_m2`, `rooms` |
| Konut Detayları | residential fields (konut only) | `details->>...` jsonb |
| Arsa Detayları | land fields (arsa only) | `details->>...` jsonb |
| Ticari Detaylar | commercial fields (ticari/endüstriyel) | `details->>...` jsonb |
| Luxury Özellikler | luxuryFeatures[] (konut/turizm) | `features @> {...}` |
| Gizlilik & Erişim | hasPhotos, hasPdf, hasMap, requestRequired, savedOnly, dateAdded | `documents`, `request_required`, `created_at`, saved table |
| Profesyonel / Bölge Uzmanı | followedOnly, regionExpertsOnly, verifiedOnly | follows table, `region_experts`, `is_verified` |

Mock behavior implemented locally:
- Selecting a **category** swaps the category-specific detail sections.
- Filters + quick chips recompute the result list (`filtered`) and the
  "N portföy bulundu" count live, including the map pins and preview card.
- "Arayış Olarak Kaydet" stores the active filter count + result count
  (toast only; persistence is a backend TODO).

## Yeni Portföy (`/dashboard/portfolios/new`)

6-step wizard. **Step 3 is dynamic** via `getDetailGroupsForCategory(category)`:

| Step | Fields |
| --- | --- |
| 1 Temel Bilgiler | category, subcategory, transaction, title, shortDescription |
| 2 Konum & Fiyat | locationMode (exact/approx), city, district, neighborhood, price, currency, priceVisibility |
| 3 Detaylar | dynamic detail groups for the chosen category + luxury |
| 4 Medya | photos, cover, PDF, deed, zoning, floor plan, video |
| 5 Gizlilik | visibility, requestRequired, hideAddress, hidePhone, lockPdf, accessValidity |
| 6 Önizleme | live data-completeness score + missing fields + publish |

The wizard writes into the same flat `values` record, so
`computeCompleteness(values, category)` updates the score ring, required/optional
counts and missing-field chips in real time.

## Yeni Arayış (`/dashboard/searches/new`)

Buyer search uses the same taxonomy:

1. **Doğal dil arayışı** textarea + **"AI ile Filtrelere Çevir"** →
   `parsePromptToFilters()` fills `FilterState` and the must-have features.
2. **Detaylı filtreler** — collapsible Lokasyon, Portföy Tipi (category +
   subcategory chips), Fiyat & Alan, category criteria, Özellikler.
3. **Özellikler** split into three chip groups: olmazsa olmaz (must-have),
   olursa iyi olur (nice-to-have), istenmeyen (excluded).
4. Notification frequency + visibility.
5. "Eşleşmeleri Bul ve Kaydet" → `getMatchesForSearch()` /
   `getExpertsForSearch()` (mock matching), category mapped to `PortfolioType`
   via `toPortfolioType()`.

## Field → portfolio mapping summary

Buyer search filters mirror portfolio creation fields one-to-one (same `key`s),
so AI matching can compare a saved Arayış to a Portföy field-by-field. The
`important` flag identifies the high-signal fields used both for the
completeness score and as primary match criteria.

## Backend TODOs

- Persist `FilterState` for saved searches (`saved_searches` / `buyer_searches`).
- Store dynamic detail fields as a `details jsonb` column keyed by field `key`.
- Replace `parsePromptToFilters` with a real LLM call (Lovable AI Gateway).
- Implement server-side filtering + match scoring (currently client-side mock).
- Wire privacy/access flags to RLS + Detay Talebi approval gating.
