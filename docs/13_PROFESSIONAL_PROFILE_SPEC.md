# Professional Profile Spec

## Amaç
Profesyonel profil sayfası LinkedIn profil + WhatsApp katalog + luxury broker showroom gibi çalışmalı.

## Hero
- Cover image
- Tam görünür portrait avatar
- İsim, title, company, location
- Verified/membership/region expert badges
- Stats: Aktif Portföy, Aktif Arayış, Takipçi, Uzmanlık Bölgesi, Eşleşme Sayısı
- CTAs: Takip Et, Profili Paylaş, Portföylerini Gör

## Tablar
Default tab: **Portföyleri**
- Portföyleri
- Arayışları
- Hakkında
- Uzmanlık Bölgeleri
- Diğer Linkler
- Benzer Profesyoneller

## Portföyleri tab
WhatsApp katalog gibi list view default:
- Thumbnail
- Title, region, price
- Stats: room, m², land, bath, parking
- Feature chips
- Locked info badge
- Actions: Portföyü Gör, Detay Talep Et, Kaydet, Paylaş
- Filters: region/type/features/search/sort/list-grid.

## Arayışları tab
Aktif buyer search listesi:
- Search title
- Customer note label
- Region, budget, type, must-have features
- Match count, urgency, notification status
- Actions: Arayışı Gör, Portföyümle Eşleştir, Benzer Portföy Ara

## Hakkında tab
- Bio
- Phone/email/WhatsApp/ofis locked by default
- Social links: Instagram, LinkedIn, website, WhatsApp catalog, digital card

## Uzmanlık Bölgeleri tab
Region cards:
- Active portfolio count
- Active search count
- Match count
- Primary types
- CTA: Bu Bölgedeki Portföyleri Gör, Bölgeyi Gör

## System-level card fix
Professional identity layout must be reusable and stable. Avatar/name/cover must never overlap. Create/refine shared components: ProfessionalIdentityHeader, ProfessionalCard, ProfessionalProfileHero.
