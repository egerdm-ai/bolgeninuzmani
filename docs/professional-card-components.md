# Professional Card Components

Reusable components for rendering professionals consistently across VAULT.
All are presentation-only and read mock data.

| Component | File | Used in |
|-----------|------|---------|
| `ProfessionalCard` | `src/components/vault/professional-card.tsx` | Professionals discovery grid. `compact` delegates to `ProfessionalMiniCard`. |
| `ProfessionalMiniCard` | `src/components/vault/professional-mini-card.tsx` | Similar professionals, assistant/matches/concierge inline lists. Accepts `Professional` or `Broker`. |
| `ProfessionalProfile` (hero + body) | `src/components/vault/professional-profile.tsx` | Profile detail page. Hero, stats, about, expertise, showcase, activity, similar. |
| `ExpertiseRegionCard` | `src/components/vault/expertise-region-card.tsx` | Profile expertise grid. Shows active portfolio count, match count, primary types, mini map, CTA. |
| `RegionExpertBadge` | `src/components/vault/badges.tsx` | Region expert headline badge ("X Uzmanı"). |
| `RegionLinkChip` | `src/components/vault/region-link-chip.tsx` | Region chip; links to `/dashboard/regions/$slug` when the region exists. |
| `FollowButton` | `src/components/vault/follow-button.tsx` | Takip Et / Takip Ediliyor toggle (toast + live count). |
| `ShareProfileButton` / `ProfileShareButton` | `src/components/vault/share-profile-button.tsx` | Profili Paylaş; copies `/v/{username}`. |
| `LockedContactCard` | `src/components/vault/locked-contact-card.tsx` | Locked phone/email/address panel. |
| `OwnerCard` | `src/components/vault/owner-card.tsx` | Portfolio detail owner panel (photo, verified, expert badge, region chips, follow). |
| `BrokerAvatar` | `src/components/vault/broker-avatar.tsx` | Portrait; falls back to initials if no `avatarUrl`. |

## Mock professional data (`src/lib/mock/data.ts`)
Each `Professional` now includes: portrait `avatarUrl` (Unsplash), `coverImage`,
`membershipBadge` (Elite/Pro/Private Beta), `expertBadge` ("X Uzmanı"),
`expertiseRegions`, `expertiseTypes`, `activePortfolios`, `followerCount`,
`views30d`, `regionListCount`, `matchCount`, `regionExpertise[]`, `activity[]`, `bio`.

Six seeded professionals: Taylan Hersek, Selin Aras, Murat Demir, Deniz Kaya,
Bora Aydın, Ege Erdem.

## Design language
Dark/charcoal glassy cards, gold accents, subtle gold border + shadow on hover,
gold outline/muted-gold for the "following" state, dense but elegant grids,
real portrait + luxury cover photos. No bright colors except status indicators.

## Backend TODOs
- Replace Unsplash placeholders with uploaded portrait/cover media in storage.
- Derive `activePortfolios`, `followerCount`, `regionListCount`, `matchCount`
  from real aggregates instead of static mock values.
