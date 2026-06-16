# Buyer Search Flows

All mock/local. State lives in `src/lib/my-searches-store.tsx` (`MySearchesProvider`).

## Create my search
`/dashboard/my-searches/new` → fill AI prompt + filters → "Eşleşmeleri Bul ve Kaydet"
→ `create()` adds a local search → navigate to `/dashboard/my-searches/$id`.

## Save a network search into Arayışlarım
Network card / detail "Arayışı Kaydet" → `saveFromNetwork()` clones the network search as a
private copy owned by the current user. Re-saving is de-duplicated (`isNetworkSaved`).

## Save a map search into Arayışlarım
`/dashboard/search` → "Arayışlarım'a Kaydet" → `SaveSearchModal`
("Bu aramayı müşteriniz için Arayışlarım'a kaydedin") → `create()` → navigate to detail.

## Edit a my search
Detail `?mode=edit` → change budget, add/remove must-have features, notification frequency,
status (active/passive) → `update()`.

## Toggle notifications / deactivate
- Card "Bildirimler" modal or detail "Bildirim Sıklığı" → `setNotify()`.
- Card / detail "Pasifleştir" ↔ "Aktifleştir" → `setStatus()`.

## Match my portfolio to a network search
Network card "Portföyümle Eşleştir" → `/dashboard/matches?searchId=...&source=network`
shows a focused panel of the user's matching portfolios.

## Backend TODO
Persist create/update/status/notify; generate matches server-side; emit notifications.
