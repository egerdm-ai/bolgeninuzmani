# Professional Searches Section

The **Arayışları** tab lists the buyer searches ("Arayışlar") a professional is
currently tracking.

## Components & data

- `ProfessionalSearchCard` (`src/components/vault/professional-search-card.tsx`).
- Mock source: `getBuyerSearchesByProfessional(professional)` in
  `src/lib/mock/matching.ts` — matches buyer searches by region overlap with
  the professional's expertise regions (falls back to the first two).

## Card anatomy

- Customer note label (`clientLabel`, e.g. "A. Yılmaz (VIP)" / "Özel müşteri için").
- Search title.
- Urgency badge (Yüksek / Orta / Düşük Aciliyet).
- Meta: Bölge, Bütçe ("{max}'ye kadar"), Tip.
- Must-have feature chips.
- Match count, notification status, created/updated time.
- If `hasMatchingPortfolio` (mock: status === "matched"): gold banner
  "Bu arayış portföylerinizden biriyle eşleşebilir."

## Actions

- Arayışı Gör → `/dashboard/searches/$id`.
- Portföyümle Eşleştir → `/dashboard/matches`.
- Benzer Portföy Ara → `/dashboard/search`.

## Backend TODO

- Persist buyer searches with owner = professional and RLS.
- Real matching engine for match counts + "eşleşebilir" detection.
- Notification frequency wiring (instant/daily/weekly/off).
