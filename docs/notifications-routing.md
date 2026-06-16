# Notifications Routing

Notifications carry a typed `link` object (`NotificationLink` in `src/lib/mock/types.ts`)
consumed by `useNavigate` in the notifications page and the topbar dropdown.

| Notification | Destination |
| --- | --- |
| Arayışınıza yeni portföy eşleşti | `/dashboard/my-searches/$id?tab=matches` |
| Portföyünüz bir ağ arayışıyla eşleşti | `/dashboard/searches/$id` (or `/dashboard/matches?portfolioId=...`) |
| Bölgenizde yeni arayış oluşturuldu | `/dashboard/searches?region=<name>` |
| Takip ettiğiniz bölgede yeni portföy eklendi | `/dashboard/search?region=<name>` |
| Yeni detay talebi | `/dashboard/detail-requests` |

## Implementation
- `NotificationLink` is a discriminated union of `{ to, params?, search? }`.
- Rows are `<button onClick={() => navigate(n.link)}>` (cast to satisfy TanStack typing).
- Search params validated on target routes (`/dashboard/searches`, `/dashboard/search`,
  `/dashboard/matches`, `/dashboard/my-searches/$id`).

## Backend TODO
Generate `notifications` rows from matching/region-watch/request jobs; store the structured
target so the client can build the link.
