# Landing Page v2 — VAULT

Full rebuild of the public landing page (`/` → `src/routes/index.tsx`). Dashboard
untouched. Mock data only, no backend.

## Positioning

VAULT is a **private luxury real estate network** for verified professionals.
Not a marketplace. Helps brokers create closed portfolios, discover them on a map,
save buyer searches (Arayışlarım), get AI matches, request access to locked details,
follow regions, and share professional PDF/WhatsApp presentations via Share Studio.

5-second message for a visitor:
1. For verified luxury real estate professionals.
2. Solves WhatsApp group chaos + uncontrolled sharing.
3. Private, map-first, AI-assisted, request-access based.
4. Finds the right portfolio, buyer search and region expert.
5. Invite / private beta based.

## Section order

1. **Navbar** — logo, center nav (Nasıl Çalışır, Özellikler, VAULT Asistan, Üyelik, SSS),
   right (Giriş Yap → /dashboard, Üyelik Başvurusu Yap → scrolls to `#basvuru`).
2. **Hero** — value copy + trust row + `LandingHeroProductMockup`.
3. **Problem** — 6 dark warning-accent cards.
4. **Çözüm (Solution)** — 3 columns (Portföy / Arayış / Bölge Uzmanı) + center
   "AI Eşleşme Motoru" connector.
5. **Nasıl Çalışır** — `StepProcessShowcase` (interactive 5 steps) + "VAULT Akışını Gör".
6. **Özellikler** — 9 value-driven feature cards each with a mini status preview.
7. **VAULT Asistan** — `AIAssistantPreview` chat mockup + tools list.
8. **Bölge Takibi** — `RegionWatchPreview` (region cards, watch toggle, metrics).
9. **Profesyonel Ağ** — `ProfessionalProfilePreview` + capability chips.
10. **Share Studio** — `ShareStudioPreview` + `LockedPreviewPanel` + "Share Studio'yu Gör".
11. **Üyelik** — 3 tiers (Private Beta open, Pro/Elite "Yakında"). No payment flow.
12. **Başvuru** (`#basvuru`) — `ApplicationForm` (local mock submit).
13. **SSS** — `FaqSection` accordion (8 Q&A).
14. **Footer** — logo, product links, legal placeholders, apply CTA.
15. **MobileStickyCta** — fixed bottom "Üyelik Başvurusu Yap" on `<lg`.

## Design language

Dark luxury preserved: black/charcoal background, gold accents (`--gold`),
glassy cards (`bg-surface/80 backdrop-blur-xl border-border-strong shadow-elegant`),
serif display (`font-display` = Cormorant Garamond), Manrope body.
No Airbnb/Endeksa colors. Endeksa screenshots were UX reference only for the
"step-by-step process with changing visual mockup" pattern.

## Terminology enforced

- "Portföy" (not "İlan"), "Arayış", "Arayışlarım", "Bölge Uzmanı", "Eşleşme",
  "Detay Talebi", "VAULT Asistan", "Share Studio".
- "AI Concierge" → "VAULT Asistan" everywhere.
- Avoid "marketplace" as primary positioning → "private real estate network".

## Mobile

- Hero stacks; floating mockup cards hidden below `sm/md/lg/xl`.
- Step process becomes a vertical accordion (`StepProcessShowcase`).
- Feature cards 1-column, application form stacks.
- Sticky bottom CTA (`MobileStickyCta`); root has `pb-20 lg:pb-0`.

## Mock-only / backend TODOs

See `docs/public-application-flow.md` and the Final Report for the full list.
