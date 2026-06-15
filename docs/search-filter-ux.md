# VAULT Search Filter UX (Airbnb-inspired, dark luxury)

This document describes the discovery experience on `/dashboard/search` and how
it is reused on `/dashboard/searches/new`. The UX is inspired by Airbnb's
search/filter flow, re-skinned in VAULT's dark luxury black/gold language.

Mock-only. No backend. All state is local React state; data comes from
`src/lib/mock/data.ts`.

## Layout

```text
┌───────────────────────────────────────────────────────────────┐
│ Sticky top bar:                                               │
│  [ Portföy, bölge veya profesyonel ara... ]                  │
│  [VAULT Asistan'a Sor] [Filtreler (n)] [Arayış Olarak Kaydet]│
│  Quick chips: Fiyat · Portföy Tipi · Deniz Manzaralı · ...   │
├───────────────────────────────────────────────────────────────┤
│ "128 portföy"  · applied filter chips · Temizle              │
├──────────────────────────────┬────────────────────────────────┤
│ Results list (left)          │  Map (right, sticky)           │
│  SearchResultCard            │   gold/black price bubbles     │
│   - cover, price, key facts  │   cluster marker (+N)          │
│   - owner avatar + verified  │   floating selected card       │
│   - "Bölge Uzmanı" badge     │                                │
│   - Profili Gör / Detay Talep│                                │
└──────────────────────────────┴────────────────────────────────┘
```

## Components

- `src/routes/dashboard.search.tsx` — page shell, sticky bar, quick chips,
  result count, applied chips, split layout, local filtering.
- `src/components/vault/filter-modal.tsx` — the large Airbnb-style filter modal.
- `src/components/vault/save-search-modal.tsx` — "Arayış Olarak Kaydet" modal.
- `src/components/vault/search-result-card.tsx` — list card with owner identity
  and CTAs.
- `src/components/vault/map-canvas-mock.tsx` — mock map with price bubbles,
  hover highlight, cluster marker.

## Quick filter chips

Defined in `searchQuickChips` (`src/lib/taxonomy.ts`). Two kinds:

- `kind: "modal"` → opens the filter modal (Fiyat, Portföy Tipi).
- `kind: "toggle"` → flips a boolean filter key and live-updates the count
  (Deniz Manzaralı, Havuzlu, 5+ Oda, Otoparklı, PDF Hazır, Bölge Uzmanından,
  Detay Talebi Açık, Yeni Eklenen).

## Filter modal sections

The modal renders, in order:

1. **Önerilenler** — large selectable cards (`recommendedFilters`).
2. **Portföy Tipi** — segmented buttons (`modalCategories`). Drives which
   conditional detail sections show.
3. **İşlem Tipi** — segmented buttons (`modalTransactionTypes`).
4. **Fiyat Aralığı** — currency selector (TRY/USD/EUR), mock histogram
   (`priceHistogram`), dual range slider (`priceBounds`), min/max inputs.
5. **Alan / m²** — min m² range fields (`areaRangeFields`).
6. **Oda ve Yaşam Alanları** — plus/minus counters (`livingSpaceCounters`).
7. **Lokasyon** — Şehir / İlçe / Bölge inputs + "Haritada alan seç" mock.
   Note: exact address only after detail request approval.
8. **Konut / Villa Detayları** — shown for Konut/Villa/All (`konutDetailFields`).
9. **Luxury Özellikler** — premium feature chips (`luxuryFeatures`).
10. **Arsa Detayları** — shown when category = Arsa (`landFields`).
11. **Ticari Detaylar** — shown for Ticari/Endüstriyel/Otel (`commercialFields`).
12. **Gizlilik & Erişim** — (`privacyAccessFields`).
13. **Profesyonel / Bölge Uzmanı** — (`professionalFields`).
14. **Eşleşme & Arayış** — (`matchSearchFields`).

Sticky header ("Filtreler" + close). Sticky footer:
"Tümünü Temizle" + "{n} Portföy Göster" (live count).

## Conditional sections

| Category (modal value) | Maps to | Extra sections |
|------------------------|---------|----------------|
| Konut / Villa-Yalı / Özel Varlık | konut | Konut Detayları + Luxury |
| Arsa | arsa | Arsa Detayları |
| Ticari | ticari | Ticari Detaylar |
| Otel / Turizm | turizm | Ticari Detaylar + Luxury |
| Endüstriyel | endustriyel | Ticari Detaylar |
| Tümü | (none) | Konut Detayları + Luxury (default) |

## Applied filter chips

After applying filters, `dashboard.search.tsx` derives a chip list from the
filter state (`activeChips`). Each chip is removable; "Temizle" resets all.

## Arayış Olarak Kaydet

`SaveSearchModal` collects: Arayış adı, Müşteri notu, Bildirim sıklığı
(Anında / Günlük Özet / Haftalık Özet / Kapalı), and a "Yeni eşleşmelerde
bildir" toggle. CTA: "Arayışı Kaydet". Currently fires a toast (mock).

## Reuse on /dashboard/searches/new

The new-search form reuses the same taxonomy groups and exposes a
"Tüm Filtreler" button that opens the same `FilterModal`. It adds a natural
language input ("Müşteriniz ne arıyor?") with "AI ile Filtrelere Çevir", which
calls `parsePromptToFilters` to populate mock filter state. CTA:
"Eşleşmeleri Bul ve Kaydet".

### AI parse example (mock)

Input: `Bebek'te havuzlu, müstakil, 5+1 villa arıyorum. 8M USD üstüne çıkamam.`

Produces:
- Location: Bebek (İstanbul)
- Type: Villa
- Rooms: 5+1 (min 5)
- Must-have: Havuzlu (+ Müstakil noted)
- Currency: USD, Max price: 8M

## Local interactions that work

- Text search across title/region/city/owner.
- Quick chip toggles + modal-opening chips.
- All modal sections update the live result count.
- Applied filter chips (add via modal/chips, remove individually or clear all).
- Map price bubbles + hover sync with list + cluster marker + floating card.
- Detail request modal, save-search modal.
- AI prompt → filters on the new-search page.

## Backend TODO

- Persist `FilterState` per saved search (Arayış) with RLS per user.
- Server-side filtering/pagination + real geocoding for the map.
- Real price histogram from market data per region/currency.
- Saved-search match jobs + notification delivery (instant/daily/weekly).
- Replace `parsePromptToFilters` with a real LLM-backed parser via the AI gateway.
- Enforce privacy: exact address/phone/PDF unlock only after approved Detay Talebi.
