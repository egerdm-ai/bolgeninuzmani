# VAULT Property Taxonomy

Single source of truth: `src/lib/taxonomy.ts`. This taxonomy is shared by
**Portföy Ara** (`/dashboard/search`), the **Yeni Portföy** wizard
(`/dashboard/portfolios/new`), **Yeni Arayış** (`/dashboard/searches/new`) and
AI matching. Mock-only — no backend yet.

> Terminology: **Portföy**, **Arayış**, **Kaydedilen Arayış**, **Detay Talebi**,
> **Bölge Uzmanı**. The term "İlan" is never used.

## Categories & Subcategories

| Category (`CategoryKey`) | Label | Subcategories | Detail groups |
| --- | --- | --- | --- |
| `konut` | Konut | Villa, Daire, Müstakil Ev, Rezidans, Yalı, Yazlık, Köşk | residential, luxury |
| `arsa` | Arsa | İmarlı Arsa, Tarla, Bağ/Bahçe, Konut İmarlı, Ticari İmarlı, Turizm İmarlı | land |
| `ticari` | Ticari | Ofis, Dükkan, Mağaza, Plaza Katı, Depo, İş Yeri | commercial |
| `turizm` | Turizm | Otel, Butik Otel, Tatil Köyü, Apart Otel, Pansiyon | tourism, luxury |
| `endustriyel` | Endüstriyel | Fabrika, Depo, Üretim Tesisi, Sanayi Arsası | industrial |

## Transaction Types

`satilik` (Satılık), `kiralik` (Kiralık), `devren` (Devren), `gunluk` (Günlük Kiralık).

## Currencies

`TRY`, `USD`, `EUR`.

## Common fields (all categories)

city, district (ilçe/bölge), neighborhood, transaction type, category,
subcategory, price min/max, currency, gross m², net m², land m², room count,
bathroom count, parking capacity, date added.

## Dynamic detail fields

Each field has a `key`, `label`, `type` (`text` | `number` | `select` |
`boolean` | `multiselect`), optional `unit`, and `important` flag (counts
toward the data-completeness score).

### Konut Detayları (`residential`)
buildingAge*, floor, totalFloors, heating*, kitchenType, balcony, elevator,
parkingType, furnished, usageStatus, inSite, creditEligible, deedStatus*.

### Arsa Detayları (`land`)
zoningStatus*, landM2*, m2Price, adaNo, parselNo, kaks*, taks, gabari,
roadFrontage, hasRoad, electricity, water, sewerage, singleDeed,
suitableConstruction, suitableRevenueShare.

### Ticari Detaylar (`commercial`)
commercialType*, indoorM2*, outdoorM2, ceilingHeight, frontageWidth,
entranceCount, loadingArea, storage, generator, fireSystem, licenseStatus*,
tenantStatus, transferFee, monthlyRent.

### Otel / Turizm Detayları (`tourism`)
roomCount*, starRating, bedCapacity*, restaurant, spaWellness, pool, beach,
tourismLicense*, occupancy, season.

### Endüstriyel Detaylar (`industrial`)
indoorM2*, openAreaM2, ceilingHeight, crane, powerCapacity*, generator,
loadingDocks, industrialZoning*.

> `*` = `important` field, included in the required set of the completeness score.

### Luxury Özellikler (`luxury`, multiselect)
Deniz Manzarası, Boğaz Manzarası, Havuz, Kapalı Havuz, Özel Bahçe, Teras,
Akıllı Ev, Özel İskele, Denize Sıfır, 7/24 Güvenlik, Jeneratör, Personel Odası,
Misafir Evi, Şarap Mahzeni, Sinema Odası, SPA/Hamam, Helikopter Pisti.

## Data completeness scoring

`computeCompleteness(values, category)` returns:

- `score` (0–100), `level` (`low` < 55 ≤ `medium` < 80 ≤ `high`)
- `requiredDone / requiredTotal` — core required fields + category important fields
- `optionalDone / optionalTotal` — remaining category fields
- `missingImportant` — labels of unfilled required fields

Weighting: required 75%, optional 25%.

## Mock AI prompt parsing

`parsePromptToFilters(prompt)` performs naive Turkish keyword matching for
region, type, budget (`100M`, `50 milyon`), rooms (`5+1`) and luxury features,
returning a `FilterState` plus a human-readable summary. Used by the
"AI ile Filtrelere Çevir" button on the Arayış form.

---

## Update — Airbnb-style filter modal additions

New centralized definitions added to `src/lib/taxonomy.ts` for the
`/dashboard/search` filter modal (see `docs/search-filter-ux.md`):

- `recommendedFilters` — "Önerilenler" cards (Deniz Manzaralı, Havuzlu, PDF
  Hazır, Bölge Uzmanından, Arayışlarımla Eşleşen, Yeni Eklenen, Detay Talebi
  Açık, Otoparklı). Each has a lucide `icon` name resolved in the UI.
- `modalCategories` — Portföy Tipi segmented options (Tümü, Konut, Villa/Yalı,
  Arsa, Ticari, Otel/Turizm, Endüstriyel, Özel Varlık) mapped to `CategoryKey`.
- `modalTransactionTypes` — İşlem Tipi (Satılık, Kiralık, Sezonluk, Devren
  Satılık, Devren Kiralık).
- `livingSpaceCounters` — plus/minus counters (Oda, Salon, Yatak odası, Banyo,
  WC, Otopark kapasitesi).
- `areaRangeFields` — Brüt/Net/Arsa/Kapalı/Açık m² minimum inputs.
- `konutDetailFields` — Konut/Villa detayları (bina yaşı, kat, ısıtma, eşyalı,
  site içinde, balkon, teras, bahçe, asansör, güvenlik, akıllı ev, jeneratör).
- `luxuryFeatures` — extended with Orman Manzarası, Sonsuzluk Havuzu, Spa,
  Sauna, Hamam, Helipad, etc.
- `landFields` — extended with Villa/Turizm/Ticari İmarlı, Denize Yakın.
- `commercialFields` — extended with Ciro Bilgisi, Tır Girişi, OSB İçinde.
- `privacyAccessFields` — Detay Talebi Gerekli, PDF Kilitli, Tam Adres Gizli,
  Telefon Gizli, Onaylı Erişimim Olanlar, Daha Önce Talep Ettiklerim.
- `professionalFields` — doğrulanmış, bölge uzmanı, takip edilen, yüksek aktiflik,
  yüksek yanıt oranı.
- `matchSearchFields` — Eşleşme & Arayış toggles (arayışlarımla eşleşen, yeni
  eşleşme, kaydedilen aramalarıma uygun, AI önerili, veri skoru yüksek).
- `priceHistogram` / `priceBounds` — mock price distribution + per-currency
  bounds for the range slider.
- `searchQuickChips` — horizontal quick chip row (modal vs toggle kinds).
