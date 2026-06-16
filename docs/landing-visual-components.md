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
- `ProfessionalProfilePreview` — cover + portrait + Bodrum Uzmanı badge + tabs +
  portfolio catalog list + expertise regions + locked contact + follow button.

## share-studio-preview.tsx
- `ShareStudioPreview` — WhatsApp preview, teaser PDF cover, public link, QR placeholder,
  locked-info warning, share analytics mini stats.

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
