# Arayışlar vs Arayışlarım

Two distinct product areas split from the original single "Arayışlar" concept.

## Arayışlar — Network discovery (`/dashboard/searches`)
- Buyer searches created by **other** professionals across the VAULT network.
- Lives under **Keşfet** (discovery) in the sidebar.
- Goal: find demand that the current user's own portfolios can satisfy.
- Data source: `networkSearches` in `src/lib/mock/matching.ts` (owners are other professionals).
- Card: `NetworkSearchCard` — shows creator, verified badge, region, type, budget,
  must-haves, urgency, network match count, and a "Portföylerinizden N tanesi eşleşebilir" badge.
- Detail: `/dashboard/searches/$id` — summary, created-by professional, the user's matching
  portfolios ("Neden Uyumlu?"), suggested action, and CTAs (Portföy Öner, Profesyoneli Gör,
  Arayışı Kaydet, Benzer Portföy Ara).

## Arayışlarım — Personal workspace (`/dashboard/my-searches`)
- The current user's **own** saved searches, created for their customers.
- Lives under the **main workspace** in the sidebar.
- Goal: track customer demand and get notified when new portfolios match.
- Data source: `mySearches` (alias of `buyerSearches`) seeded into the `MySearchesProvider`
  store (`src/lib/my-searches-store.tsx`).
- Card: `BuyerSearchCard` — CRM-style: status badge, customer note, region chips, budget,
  notification frequency, new/total match counts, last match time; CTAs Eşleşmeleri Gör,
  Düzenle, Bildirimler, Pasifleştir.
- Create: `/dashboard/my-searches/new`. Detail/edit: `/dashboard/my-searches/$id` (+`?mode=edit`).

## Terminology
Arayışlar (network), Arayışlarım (own), Portföy, Eşleşme, Bölge Uzmanı, Detay Talebi, VAULT Asistan.
"İlan" is never used.

## Backend TODO
- `buyer_searches` table with `owner_id`, `visibility`.
- Network list = rows where `owner_id != auth.uid()` and `visibility = 'network'`.
- My list = rows where `owner_id = auth.uid()`.
- "Save network search" persists a referenced copy owned by the current user.
