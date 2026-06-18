# Matching Engine, Region Watch & Notifications

## Match types
1. My Search → Portfolio
2. Portfolio → Network Search
3. Search → Region Expert
4. Portfolio → Region Expert
5. Region Watch → New Portfolio/Search/Expert Activity

## Match score V1
- Bölge uyumu: 25
- Portföy tipi: 20
- Fiyat uyumu: 20
- Oda/m² uyumu: 15
- Özellikler: 15
- Güncellik/veri kalitesi: 5

## Match explanation
Her match bir explanation üretir:
- Matched criteria
- Missing criteria
- Why relevant
- Suggested next action

## Event-driven jobs
### New portfolio published
- Active my_searches taranır.
- Network searches taranır.
- Region watches taranır.
- Match results ve notifications oluşturulur.

### New my_search created
- Existing portfolios taranır.
- Region experts önerilir.
- Initial match results oluşturulur.

### Portfolio updated
- Price/features/location değişirse impacted matches re-compute.

## Notifications
- In-app MVP.
- P1: email/WhatsApp/push.
- Frequency: instant/daily/weekly/off.
