# Professional Profile Tabs

`/dashboard/professionals/$id` is organized as a compact hero + sticky tab bar +
tabbed content with a slim right sidebar.

## Component

`ProfessionalProfileTabs` (`src/components/vault/professional-profile-tabs.tsx`)
renders a sticky (`top-16`), horizontally scrollable, gold-selected tab bar.

```
Portföyleri · Arayışları · Hakkında · Uzmanlık Bölgeleri · Diğer Linkler · Benzer Profesyoneller
```

- Default active tab: **Portföyleri**.
- Tab state lives in `ProfessionalProfile` (`activeTab: ProfileTab`).
- Optional count pills are passed via `counts` (portföy, arayış, bölge, benzer).
- Switching is local (no route change). `focusRegion` / `showPortfolios`
  switch to **Portföyleri** and smooth-scroll to `#profile-content`.

## Hero (compact)

- Cover image (`h-24/28`), portrait overlapping with `z-10`.
- Name + Doğrulanmış Profesyonel + membership badge (Elite/Pro/Private Beta) +
  region expert badge (e.g. "Bodrum Uzmanı").
- Title · Company · Location.
- CTAs: Takip Et / Takip Ediliyor, Profili Paylaş, Portföylerini Gör.
- Stats: Aktif Portföy, Aktif Arayış, Takipçi, Uzmanlık Bölgesi, Eşleşme Sayısı.

## Right sidebar (desktop, stacks on mobile)

- `LockedContactCard` (contact visibility).
- `ProfessionalQuickActions` (Takip Et, Profili Paylaş, Portföylerini Gör,
  Detay Talebi Gönder).
- Bölge Özeti: "{n} bölge listesinde" + top 3 regions (click → filter catalog).
- Mini Analitik: son 30 gün görüntülenme, eşleşme sayısı, aktif portföy.

## Backend TODO

- Persist follow state and follower counts (`follows` table).
- Region list membership + aggregate analytics server-side.
