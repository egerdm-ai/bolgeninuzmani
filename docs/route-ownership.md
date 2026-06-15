# VAULT — Rota Sahipliği (Route Ownership)

Her rota; dosyası, amacı, sahip olduğu veri/etkileşim ve durumu (mock/backend).

| Rota | Dosya | Amaç | Durum |
|------|-------|------|-------|
| `/dashboard` | `dashboard.index.tsx` | Genel bakış, KPI, hızlı işlemler | mock |
| `/dashboard/search` | `dashboard.search.tsx` | Harita + filtreli portföy keşfi | mock |
| `/dashboard/regions` | `dashboard.regions.index.tsx` | Bölge kartları | mock |
| `/dashboard/regions/$slug` | `dashboard.regions.$slug.tsx` | Bölge detayı + watch | mock |
| `/dashboard/professionals` | `dashboard.professionals.index.tsx` | Profesyonel dizini + filtre | mock |
| `/dashboard/professionals/$id` | `dashboard.professionals.$id.tsx` | Profil + portföy vitrini | mock |
| `/dashboard/portfolios` | `dashboard.portfolios.index.tsx` | Portföy yönetim listesi | mock |
| `/dashboard/portfolios/new` | `dashboard.portfolios.new.tsx` | 6 adımlı oluşturma sihirbazı | mock |
| `/dashboard/portfolios/$id` | `dashboard.portfolios.$id.index.tsx` | Portföy detayı (owner) | mock |
| `/dashboard/portfolios/$id/share` | `dashboard.portfolios.$id.share.tsx` | Share Studio | mock |
| `/dashboard/searches` | `dashboard.searches.index.tsx` | Kaydedilen arayışlar | mock |
| `/dashboard/searches/new` | `dashboard.searches.new.tsx` | Yeni arayış + AI filtre | mock |
| `/dashboard/searches/$id` | `dashboard.searches.$id.tsx` | Arayış detayı + eşleşmeler | mock |
| `/dashboard/matches` | `dashboard.matches.tsx` | Merkezi eşleşme hub'ı | mock |
| `/dashboard/detail-requests` | `dashboard.detail-requests.tsx` | Talep inbox + yan panel | mock |
| `/dashboard/assistant` | `dashboard.assistant.tsx` | VAULT Asistan (AI) | mock |
| `/dashboard/notifications` | `dashboard.notifications.tsx` | Bildirim listesi | mock |
| `/dashboard/favorites` | `dashboard.favorites.tsx` | Kaydedilen portföyler | mock |
| `/dashboard/profile` | `dashboard.profile.tsx` | Kendi profili | mock |
| `/dashboard/settings` | `dashboard.settings.tsx` | Ayarlar (sekmeli) | mock |
| `/p/$slug` | `p.$slug.tsx` | Herkese açık portföy görünümü | mock |
| `/v/$username` | `v.$username.tsx` | Herkese açık profil | mock |

## Lokal Durum Sahipleri (Context store)
- `saved-store.tsx` — kaydedilen portföyler
- `follow-store.tsx` — takip edilen profesyoneller
- `region-watch-store.tsx` — bölge takibi + bildirim sıklığı
- `notification-store.tsx` — bildirimler + okundu durumu
- `detail-request-store.tsx` — global detay talebi modalı

## Eski / Çakışan rotalar
- `dashboard.concierge.tsx`, `dashboard.ai-import.tsx` — eski asistan akışları;
  ana akış `dashboard.assistant.tsx` üzerinden ilerler. Sidebar'da yer almazlar.

## Backend TODO (rota bazında)
- Arama/filtre: `FilterState` kalıcılığı + sunucu tarafı eşleştirme skoru.
- Arayışlar: kaydedilen arayışların kalıcılığı (RLS) + arka plan eşleştirme job'ı.
- Eşleşmeler: portföy↔arayış skorlama servisi.
- Detay Talepleri: gerçek durum makinesi + bildirim tetikleyicileri.
- Share Studio: gerçek PDF üretimi ve paylaşım takibi (analytics).
- Bölge/bildirim: bölge watch ve bildirim teslimat servisi.
