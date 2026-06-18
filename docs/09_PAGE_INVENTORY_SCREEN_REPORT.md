# Page Inventory & Screen Report

## Screenshot durumu
Mevcut paket `screenshots/current_lovable/` altında konuşmada paylaşılan ekranları ve Loveable preview screenshotlarını içerir. Bütün route'ların canlı screenshot'ını almak için repo veya preview URL gerekir. `scripts/capture_screenshots.mjs` bu iş için hazırlandı.

## Public Landing `/`
### Mevcut durum
Hero, problem, solution, how it works, features, VAULT Asistan, professional network, Share Studio, membership, application, FAQ.
### Eksik/iyileştirme
- Hero map night-mode map gibi daha gerçek olmalı.
- Profesyonel kart component'i sistem düzeyinde düzeltilmeli.
- Kapalı portföy detail showcase section eklenmeli.
- Bölge takibi standalone section çıkarıldı/azaltıldı.

## Dashboard `/dashboard`
### Amaç
Kullanıcının güncel portföy, arayış, match, request, notification durumunu görmesi.
### Ana CTA
Portföy Oluştur, Arayış Oluştur, Portföy Ara, Eşleşmeleri Gör, Detay Talepleri.

## Portföy Ara `/dashboard/search`
### Amaç
Map-first portfolio discovery.
### Özellikler
Airbnb tarzı split layout, güçlü filtre modalı, arayış olarak kaydet, owner card, detail request.
### Kritik
Filter taxonomy ile database alanları birebir bağlı olmalı.

## Portföylerim `/dashboard/portfolios`
Kendi portföylerinin listesi, durumları, analytics, edit/share/matches aksiyonları.

## Portföy Oluştur `/dashboard/portfolios/new`
6 adımlı wizard: temel bilgi, konum/fiyat, kategori detayları, medya/belge, gizlilik, önizleme/veri skoru.

## Portföy Detay `/dashboard/portfolio/[id]`
Kapalı portföy detail: hero/gallery, visible teaser info, locked info panel, market insight, data score, owner card, match panel, detail request.

## Share Studio `/dashboard/share/[portfolioId]`
WhatsApp, link, PDF, e-posta, controlled access, analytics preview.

## Profesyoneller `/dashboard/professionals`
Verified professionals discovery, filters, profile cards. Sistemsel header/card layout fix gerekli.

## Profesyonel Profil `/dashboard/professionals/[id]`
Tabs: Portföyleri, Arayışları, Hakkında, Uzmanlık Bölgeleri, Diğer Linkler, Benzer Profesyoneller. Default Portföyleri list/catalog olmalı.

## Bölgeler `/dashboard/regions`
Region discovery/watch: active portfolios, searches, experts, demand intensity.

## Bölge Detay `/dashboard/regions/[slug]`
Region page: map, portfolios, experts, network searches, market context, activity, watch settings.

## Arayışlar `/dashboard/searches`
Network buyer search discovery: başkalarının arayışları, benim portföylerimle eşleşen talepler.

## Arayışlarım `/dashboard/my-searches`
Benim müşteri arayışlarım: create/edit, notification, matches, history.

## Eşleşmeler `/dashboard/matches`
Central hub: arayışlarıma uyan portföyler, portföylerime uyan arayışlar, network arayışları, bölge uzmanı önerileri.

## Detay Talepleri `/dashboard/detail-requests`
Inbox + right panel. Approve/share/reject/archive/note.

## VAULT Asistan `/dashboard/assistant`
AI workspace: import, search, matching, region expert, PDF/share, valuation.

## Bildirimler `/dashboard/notifications`
In-app notification center: match, region watch, detail request, PDF/share events.
