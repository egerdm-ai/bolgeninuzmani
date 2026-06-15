# VAULT — Bilgi Mimarisi (Information Architecture)

VAULT, profesyonellerin özel portföyler oluşturduğu, alıcı arayışları kaydettiği,
bölgeleri takip ettiği ve eşleşmeler ile detay talepleri aldığı kapalı bir lüks
gayrimenkul ağıdır. Terminoloji sabittir: **Portföy, Arayış, Kaydedilen Arayış,
Bölge, Bölge Uzmanı, Eşleşme, Detay Talebi, VAULT Asistan, Share Studio**.
"İlan" terimi kullanılmaz.

## Üst Düzey Gruplar

```
VAULT
├── Ana Sayfa            (/dashboard)            → genel bakış + hızlı işlemler
├── Keşfet               (grup)                  → keşif alanı
│   ├── Portföyler       (/dashboard/search)     → harita + filtreli arama
│   ├── Bölgeler         (/dashboard/regions)    → bölge kartları
│   ├── Profesyoneller   (/dashboard/professionals)
│   └── Kaydedilenler    (/dashboard/favorites)
├── Portföylerim         (/dashboard/portfolios) → kendi portföy yönetimi
├── Arayışlar            (/dashboard/searches)   → kaydedilen alıcı arayışları
├── Eşleşmeler           (/dashboard/matches)    → merkezi eşleşme merkezi
├── Detay Talepleri      (/dashboard/detail-requests) → inbox + yan panel
├── VAULT Asistan        (/dashboard/assistant)  → AI eşleştirme/değerleme
├── Bildirimler          (/dashboard/notifications)
└── Hesap (alt menü)
    ├── Profilim         (/dashboard/profile)
    └── Ayarlar          (/dashboard/settings)
```

## Sıkıştırma Kararları

- **Keşfet** ebeveyn alanı: Portföy Ara, Bölgeler, Profesyoneller ve Kaydedilenler
  tek başlık altında toplanır; sidebar kalabalıklaşmaz.
- **Eşleşmeler** tek merkezi hub: arayış→portföy, portföy→arayış ve önerilen
  uzmanlar sekmelerle aynı ekranda.
- **Detay Talepleri** inbox benzeri: solda liste, sağda fırsat/yanıt paneli.
- **Share Studio** sidebar'da yer almaz; portföy aksiyonlarından (Paylaş / PDF)
  erişilir: `/dashboard/portfolios/[id]/share`.
- **Profil ve Ayarlar** alt kullanıcı menüsünde (sidebar tabanı + topbar avatar).

## Modül İlişkileri

- Portföy ↔ Eşleşme ↔ Arayış üçlüsü Eşleşmeler hub'ında birleşir.
- Bölge sayfaları portföy, arayış ve bölge uzmanlarını bir araya getirir.
- Bildirimler her modüle derin bağlantı verir (bölge, arayış, talep, portföy).
- VAULT Asistan tüm sonuç tiplerine (portföy/uzman/bölge/arayış/PDF) köprü kurar.
