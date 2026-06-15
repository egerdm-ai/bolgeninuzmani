# Professional Portfolio Catalog

The **Portföyleri** tab is a WhatsApp-catalog style browser.

## Components

- `ProfessionalPortfolioCatalog` (`src/components/vault/professional-portfolio-catalog.tsx`)
  — controls + filtering + list/grid rendering.
- `ProfessionalPortfolioListItem` (`src/components/vault/professional-portfolio-list-item.tsx`)
  — the dense default list row.

## Controls (all local / mock)

- **Search**: "Bu profesyonelin portföylerinde ara..." → filters title / region.
- **Quick chips**: Tümü, Villa, Yalı, Arsa, Ticari, Bodrum, Yalıkavak, Bebek,
  Deniz Manzaralı, Havuzlu.
  - Type/feature chips are AND-combined (internal state).
  - Region chips (Bodrum/Yalıkavak/Bebek) drive the shared `regionFilter`
    (lifted to `ProfessionalProfile`) so region cards and chips stay in sync.
  - "Tümü" clears search + chips + region.
- **View toggle**: Liste (default) / Grid.
- **Sort**: En Yeni (default), Fiyat, En Çok Talep Alan, En Yüksek Eşleşme.

## List item anatomy

- Left thumbnail (locked location badge overlay when not exact-visible).
- Title, region, type badge, price.
- Key stats: oda, m² brüt, m² arsa, banyo, otopark.
- Feature chips: Deniz Manzarası, Havuzlu, Müstakil, PDF Hazır (derived).
- Actions: Portföyü Gör → `/dashboard/portfolios/$id`; Detay Talep Et → modal;
  Kaydet → local saved store; Paylaş → `/dashboard/portfolios/$id/share`.

Grid view reuses `PortfolioCard`.

## Region cross-link

`ExpertiseRegionCard` "Bu Bölgedeki Portföyleri Gör" calls `focusRegion`,
which sets `regionFilter` and switches to the Portföyleri tab. "Bölgeyi Gör"
navigates to `/dashboard/regions/$slug` when the region page exists.

## Backend TODO

- Server-side portfolio query by professional + filters + sort + pagination.
- Real "talep" / "eşleşme" counts for sort accuracy.
- Saved state persistence per user.
