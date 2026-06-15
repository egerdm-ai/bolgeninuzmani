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
