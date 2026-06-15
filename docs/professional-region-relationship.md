# Professional ↔ Region Relationship

VAULT connects **Profesyoneller** and **Bölgeler** so users can move between a
professional's expertise and the region pages.

## Data model (mock)
- `Professional.expertiseRegions: string[]` — region names.
- `Professional.expertBadge: string` — headline region badge, e.g. "Bodrum Uzmanı".
- `Professional.regionExpertise: { region, portfolioCount, primaryTypes, x, y }[]`
  — per-region depth used on the profile.
- `Professional.regionListCount: number` — how many curated region lists the
  professional appears in ("{n} bölge listesinde yer alıyor").
- `Region` (in `src/lib/mock/matching.ts`) has `slug`, `name`, `expertIds[]`.

## Linking rules
- `regionSlugForName(name)` (in `matching.ts`) maps a region NAME to a region
  `slug` only when a region page exists (bodrum, yalikavak, turkbuku, bebek,
  riva, cesme, alacati, gocek). Otherwise the chip renders static (e.g. Gümüşlük,
  Şişli, Göktürk have no page yet).
- `RegionLinkChip` uses this to link region chips to `/dashboard/regions/$slug`.
- `getExpertsForRegion(region)` resolves professionals for a region page via
  `expertIds` + name-matched `expertiseRegions`.

## Where the relationship shows up
- **ProfessionalCard / OwnerCard**: region chips link to region pages; region
  expert badge surfaces the headline region; "{n} bölge listesinde" count.
- **Profile detail**: linked region chips in Hakkında; `ExpertiseRegionCard`
  grid with per-region active portfolio + match counts; "Bölge Uzmanlığı"
  sidebar listing top regions with counts; "Bölge Uzmanlarını Gör" quick action.
- **Region pages** already list their experts (`getExpertsForRegion`).

## Backend TODOs
- `region_experts` join table (professional_id, region_slug, portfolio_count).
- Compute `regionListCount` from membership in curated region lists.
- Compute per-region `matchCount` from the matching engine.
- Persist region slugs canonically so name→slug resolution is not heuristic.
