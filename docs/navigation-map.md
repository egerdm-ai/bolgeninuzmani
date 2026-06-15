# VAULT — Navigasyon Haritası (Navigation Map)

Sidebar yapısı ve her giriş noktasının hedefi. Tüm rotalar mock veridir; backend
bağlı değildir.

## Sidebar — Birincil

| Etiket           | Hedef                          | Not |
|------------------|--------------------------------|-----|
| Ana Sayfa        | `/dashboard`                   | exact eşleşme |
| Keşfet           | (açılır grup)                  | alt linkleri barındırır |
| → Portföyler     | `/dashboard/search`            | harita + filtre |
| → Bölgeler       | `/dashboard/regions`           | |
| → Profesyoneller | `/dashboard/professionals`     | |
| → Kaydedilenler  | `/dashboard/favorites`         | |
| Portföylerim     | `/dashboard/portfolios`        | |
| Arayışlar        | `/dashboard/searches`          | |
| Eşleşmeler       | `/dashboard/matches`           | sayaç rozetli |
| Detay Talepleri  | `/dashboard/detail-requests`   | yeni talep sayacı |
| VAULT Asistan    | `/dashboard/assistant`         | altın vurgulu |
| Bildirimler      | `/dashboard/notifications`     | okunmamış sayacı |

Daraltılmış sidebar'da Keşfet alt linkleri ikon olarak doğrudan listelenir.

## Sidebar — Hesap (alt)

| Etiket    | Hedef                  |
|-----------|------------------------|
| Profilim  | `/dashboard/profile`   |
| Ayarlar   | `/dashboard/settings`  |

Ek olarak alt kart profile (`/dashboard/profile`) ve topbar avatar menüsü
(Profilim, Ayarlar, Çıkış) erişim sağlar.

## Topbar

- Arama input (yer tutucu, lokal).
- AI ile Portföy Oluştur → `/dashboard/assistant`.
- Portföy Oluştur → `/dashboard/portfolios/new`.
- Bildirim zili → açılır liste (ilk 5) + "Tüm bildirimleri gör" → `/dashboard/notifications`.
- Avatar menü → Profilim / Ayarlar / Çıkış (`/`).

## Tüm Rotalar (ulaşılabilir)

```
/dashboard
/dashboard/search
/dashboard/regions
/dashboard/regions/$slug
/dashboard/professionals
/dashboard/professionals/$id
/dashboard/portfolios
/dashboard/portfolios/new
/dashboard/portfolios/$id            (portföy detayı, owner görünümü)
/dashboard/portfolios/$id/share      (Share Studio)
/dashboard/searches
/dashboard/searches/new
/dashboard/searches/$id
/dashboard/matches
/dashboard/detail-requests
/dashboard/assistant
/dashboard/notifications
/dashboard/favorites
/dashboard/profile
/dashboard/settings
/p/$slug                             (herkese açık portföy)
/v/$username                         (herkese açık profil)
```

> Not: Mevcut iskelet portföy detay/paylaşım için **çoğul** `portfolios/$id` ve
> `portfolios/$id/share` rotalarını kullanır. Brief'teki tekil `portfolio/[id]` ve
> `share/[portfolioId]` yolları kavramsal eşdeğerdir; iskeleti yeniden kurmamak
> için mevcut çoğul rotalar korunmuştur.
