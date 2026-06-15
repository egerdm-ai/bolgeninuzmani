# Professionals — Profile & Discovery UX

Scope: `/dashboard/professionals` (discovery) and `/dashboard/professionals/$id`
(profile detail). Mock data only — no backend.

## Terminology
- **Profesyonel** — a verified luxury real-estate professional.
- **Portföy** — a private listing (never "İlan").
- **Bölge Uzmanı** — region expert badge, e.g. "Bodrum Uzmanı".
- **Uzmanlık Bölgeleri** — expertise regions.
- **Takip Et / Takip Ediliyor** — follow / following.
- **Portföylerini Gör** — jump to the professional's portfolio showcase.

## Discovery page (`/dashboard/professionals`)
- Title **Profesyoneller** + subtitle describing the verified network.
- Compact stats row: 48 Profesyonel · 126 Aktif Portföy · 18 Bölge Uzmanı · 312 Yeni Eşleşme (mock).
- Search input: "İsim, bölge, şirket veya uzmanlık ara...".
- Filter chips (multi-select, `Tümü` resets): Takip Ettiklerim, Bölge Uzmanları,
  Elite, Bodrum, İstanbul, Çeşme, Ticari, Villa, Arsa.
- Responsive grid of `ProfessionalCard` (1 / 2 / 3 columns).

### ProfessionalCard structure
Cover image + dark gradient → membership badge (top-right) → overlapping portrait
→ name + verified → title → company (gold) → location → region expert badge →
expertise region chips (linked) → property type chips → stats (Aktif Portföy,
Takipçi) → "{n} bölge listesinde yer alıyor" → 3 portfolio thumbnails →
CTAs (Takip Et / Profili Gör / Portföylerini Gör).

## Profile detail (`/dashboard/professionals/$id`)
- **Hero** (balanced, ~h-32/h-40 cover): portrait, name, Doğrulanmış Profesyonel,
  membership badge, region expert badge, title · company, location, and CTAs
  (Takip Et, Profili Paylaş, Portföylerini Gör).
- **Stats**: Aktif Portföy · Takipçi · Uzmanlık Bölgesi · Son 30 Gün Görüntülenme
  · Eşleşme Sayısı.
- **Left/main**: Hakkında (bio + highlight box + linked region chips), Uzmanlık
  Bölgeleri (`ExpertiseRegionCard` grid + mock `ExpertiseMap`), Portföy Vitrini
  (search + filters + portfolio cards), Son Aktiviteler.
- **Right sidebar**: `LockedContactCard`, Bölge Uzmanlığı ("{n} bölge listesinde"
  + top regions with counts), Hızlı İşlemler (Portföylerini Gör, Bölge
  Uzmanlarını Gör, Detay Talebi Gönder, Profili Paylaş).
- **Benzer Profesyoneller**: 3 `ProfessionalMiniCard`s.

## Local interactions
- Follow/unfollow (toast + live follower count) via `FollowButton` + `useFollow`.
- Profili Paylaş copies `/v/{username}` via `ShareProfileButton`.
- Region cards / Bölge Uzmanlığı rows filter the portfolio showcase (smooth scroll).
- Portföylerini Gör scrolls to `#portfoy-vitrini`.
- Portfolio cards link to `/dashboard/portfolios/$id`.
- Region chips link to `/dashboard/regions/$slug` when a region page exists.
- Similar professional cards link to their profile.

## Mock-only / backend TODOs
See `professional-region-relationship.md` and `professional-card-components.md`.
