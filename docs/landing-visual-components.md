# Landing Visual Components — VAULT

Custom product mockups built from UI components (no random stock images, only
existing local assets + Unsplash portraits). All live under
`src/components/landing/`. Dark luxury / glass / gold styling throughout.

## primitives.tsx (shared)
- `GlassCard` — glass surface (`bg-surface/80 backdrop-blur-xl border-border-strong shadow-elegant`).
- `SectionHeader` — eyebrow + serif title + optional desc.
- `MapPin2` — gold/neutral price pin for map mockups.
- `LockedPortfolioMiniCard` — image + "Detay Talebi Gerekli" badge + locked rows + CTA.
- `MatchScoreMiniCard` — "%92 Uyum" progress + matched/partial criteria.
- `NotificationMiniCard` — bell + "Yeni eşleşme" text.
- `RegionExpertMiniCard` — avatar + "Yalıkavak Bölge Uzmanı".

## hero-mockup.tsx
- `LandingHeroProductMockup` — layered base map-first search card with floating
  LockedPortfolio, MatchScore, RegionExpert, Share Studio mini, Notification cards.
  Floating cards hidden on small screens via `sm/md/lg/xl` prefixes.

## step-showcase.tsx
- `StepProcessShowcase` — interactive 5-step process.
  - Desktop: top progress indicator (clickable, gold glow on active) + left step
    cards + sticky right changing visual.
  - Mobile: vertical accordion; each step reveals its own visual.
  - Step visuals: `ImportVisual`, `PrivacyVisual`, `MapVisual`, `MatchVisual`, `ShareVisual`.

## ai-assistant-preview.tsx
- `AIAssistantPreview` — chat mockup: user message, assistant reply with matching
  portfolio card, region expert card, region insight, action chips, input bar, tools row.
- `LockedPreviewPanel` — "Kontrollü Bilgiler" locked rows (reused in Share Studio section).

## region-watch-preview.tsx
- `RegionWatchPreview` — notification banner + 4 region cards (Yalıkavak, Bebek, Riva,
  Çeşme) with watch toggle and metrics grid.

## professional-profile-preview.tsx
- `ProfessionalProfilePreview` — cover banner + **fully-visible avatar in its own
  z-10 layer** (left-aligned rounded portrait, `object-top`, no cover collision) +
  identity (name/role/company) + Doğrulanmış/Bölge Uzmanı badges + 3-stat grid
  (aktif portföy / takipçi / bölge) + expertise region chips + 2 portfolio rows +
  CTA hierarchy (Portföylerini Gör / Profili Gör / Takip Et).
- Uses generated `@/assets/professional-portrait.jpg` (centered face) to fix the
  previous cropped/hidden-avatar issue.

## closed-listing-showcase.tsx
- `ClosedListingShowcase` — premium "kapalı ilan" / portfolio detail mockup.
  Hero image (`@/assets/listing-hero.jpg`) + Kapalı İlan badge + save/share actions
  + title/location/price/type overlay + 4 key-fact tiles (oda/m²/arsa/tip) + teaser
  description + gallery thumbnails with locked "+12" tile + feature chips + controlled
  visibility block (tam adres/malik/telefon/tapu = talep sonrası) + Detay Talebi CTA.

## share-studio-preview.tsx
- `ShareStudioPreview` — 3-column sharing workstation.
  - Left: WhatsApp rich-link teaser card (thumbnail, title, location/rooms/m², price, url) + message bubble.
  - Center: message composer (with caret) + 4 channel toggles (WhatsApp/Link/PDF/E-mail, active states) + "Paylaşımı Oluştur" CTA.
  - Right: share link card + QR + analytics tiles (görüntülenme/PDF indirme/detay talebi) + controlled-access rules + pending-requests row.

## application-form.tsx
- `ApplicationForm` — waitlist form with local mock submit + success state.

## faq.tsx
- `FaqSection` — shadcn accordion with 8 Q&A.

## Reused assets
- `@/assets/map-dark.jpg`, `propertyImages` (villa1/villa2/...) from `src/lib/mock/data`.
- Unsplash portrait constant for the broker avatar (mock placeholder).

## Notes
- All mockups are presentational only — no real data binding, no navigation side effects.
- Mini cards are composable and can be reused in future dashboard marketing surfaces.
