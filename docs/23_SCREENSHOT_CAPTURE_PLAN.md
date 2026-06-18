# Screenshot Capture Plan

## Mevcut screenshotlar
`/screenshots/current_lovable/` konuşmada paylaşılan güncel Loveable görüntülerini içerir. Contact sheet: `/screenshots/current_screenshot_contact_sheet.jpg`.

## Canlı tüm sayfa screenshot gereksinimi
Bütün route'ların güncel screenshotını almak için bir preview URL veya local dev server gerekir.

## Capture list
- `/`
- `/dashboard`
- `/dashboard/search`
- `/dashboard/regions`
- `/dashboard/regions/yalikavak`
- `/dashboard/professionals`
- `/dashboard/professionals/taylan-hersek`
- `/dashboard/portfolios`
- `/dashboard/portfolios/new`
- `/dashboard/portfolio/demo-villa`
- `/dashboard/share/demo-villa`
- `/dashboard/searches`
- `/dashboard/searches/network-1`
- `/dashboard/my-searches`
- `/dashboard/my-searches/new`
- `/dashboard/my-searches/search-1`
- `/dashboard/matches`
- `/dashboard/detail-requests`
- `/dashboard/assistant`
- `/dashboard/notifications`
- `/dashboard/profile`
- `/dashboard/settings`

## Nasıl kullanılacak
1. Repo local çalıştır: `npm run dev`
2. Playwright kur: `npm i -D playwright`
3. `node scripts/capture_screenshots.mjs http://localhost:5173`
4. Çıktılar `screenshots/generated/` içine kaydedilir.
