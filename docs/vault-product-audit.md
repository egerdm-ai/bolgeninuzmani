# VAULT — Ürün & Sistem Denetimi (Product Audit / Knowledge Base)

> Analist bakışıyla tüm sistemin durumu: ne var, ne yok, ne nereye gidiyor.
> Bu doküman bir "knowledge base" olarak tutulur ve her büyük değişiklikte güncellenir.
> Durum: **UI-first MVP iskeleti, tamamen mock veri, backend yok.**

İçindekiler:
1. Yönetici Özeti (ne var / ne yok)
2. Sistem Mimarisi & Altyapı
3. Sayfa Envanteri & Akışlar (her sayfa ne yapıyor)
4. Veri Modeli / Database Yapısı
5. AI Katmanı (mevcut durum + örtüşme problemi)
6. Parçalı Yapı (component mimarisi)
7. Design System & Mobil Design
8. Landing Page Analizi (problem / nasıl çalışır / özellikler / görseller)
9. İsimlendirme & Terminoloji
10. Değer / Fayda Analizi (user · product · value)
11. Boşluklar, Riskler & Öncelikli Yol Haritası
12. Backend TODO (modül bazında)

---

## 1. Yönetici Özeti

**VAULT nedir:** Davetli ve doğrulanmış emlak profesyonelleri için kapalı (private) lüks
gayrimenkul ağı. Profesyoneller gizli **portföyler** oluşturur, alıcı **arayışları** girer,
**bölgeleri** takip eder, **eşleşmeler** ve **detay talepleri** alır. "İlan" terimi yok —
her şey kapalı ağ ve kontrollü erişim üzerine kurulu.

### Şu an NE VAR
- 22 rotalık tam UI iskeleti (dashboard + public profil/portföy + landing).
- Tutarlı dark-luxury design system (oklch tokenları, gold accent, serif+sans tipografi).
- Zengin mock veri katmanı (profesyoneller, portföyler, arayışlar, bölgeler, talepler, bildirimler).
- 5 lokal state store (saved, follow, region-watch, notification, detail-request).
- Mock AI akışları: VAULT Asistan, Concierge, AI Import.
- Profesyonel profili, portföy kataloğu, detay talepleri inbox'u son dönemde elden geçirildi.

### Şu an NE YOK
- **Backend yok** — auth, database, RLS, gerçek eşleştirme, PDF üretimi, bildirim teslimatı hiçbiri bağlı değil.
- **Gerçek görsel üretimi yok** — landing/hero/concierge için üretilmiş özel görsel yok; Unsplash + 7 statik asset kullanılıyor.
- **Onboarding / üyelik başvuru akışı yok** — "Üyelik Başvurusu Yap" butonu doğrudan dashboard'a atıyor.
- **Boş durum (empty state) ve hata durumları zayıf** — çoğu sayfa dolu mock veriye bağımlı.
- **AI akışları üçe bölünmüş ve örtüşüyor** (Asistan vs Concierge vs AI Import) — bkz. Bölüm 5.
- **Mobil deneyim kısmen eksik** — shell mobil destekliyor ama bazı çift-panel sayfalar (search, detail-requests, matches) mobilde optimize değil.

---

## 2. Sistem Mimarisi & Altyapı

| Katman | Teknoloji / Durum |
|--------|-------------------|
| Framework | TanStack Start v1 (React 19, SSR, dosya-bazlı routing) |
| Build | Vite 7 |
| Styling | Tailwind v4 (`src/styles.css`, `@theme inline`, oklch tokenlar) |
| UI primitifleri | shadcn/ui (`src/components/ui/*`) |
| State | React Context store'ları (`src/lib/*-store.tsx`) — kalıcılık yok, sayfa yenilenince sıfırlanır |
| Veri | Statik mock (`src/lib/mock/*`) |
| Backend | **Yok.** Lovable Cloud etkin değil. |

**Önemli mimari notlar:**
- Routing dot-separated (`dashboard.search.tsx` → `/dashboard/search`). `dashboard.tsx` layout route AppShell'i sarar.
- State store'lar React Context; refresh sonrası kaybolur → kalıcılık için Cloud şart.
- `currentUser.id = "b_001"` profesyonellerin ilkiyle eşleştirilmiş, böylece "Portföylerim" çözülüyor (kırılgan bağ).

---

## 3. Sayfa Envanteri & Akışlar

### Public (giriş öncesi)
| Rota | Durum | Not |
|------|-------|-----|
| `/` Landing | Dolu ama güncellenmeli | Hero, Problem, Nasıl Çalışır, Özellikler, Concierge, Üyelik, CTA. Görsel ve metinler elden geçmeli (Bölüm 8). |
| `/p/$slug` Public portföy | İskelet (54 satır) | Kilitli teaser + Detay Talebi CTA. Zayıf, geliştirilmeli. |
| `/v/$username` Public profil | İskelet (53 satır) | Paylaşılabilir profil. Zayıf. |

### Dashboard — Çekirdek akışlar
| Rota | Olgunluk | Rol |
|------|----------|-----|
| `/dashboard` Ana Sayfa | Orta (182) | KPI + hızlı işlemler + son aktivite. Komuta merkezi. |
| `/dashboard/search` Portföyler | Yüksek (345) | Harita + filtre keşfi. Çift panel — mobil zayıf. |
| `/dashboard/regions` + `$slug` | Orta | Bölge kartları + bölge detayı/watch. |
| `/dashboard/professionals` + `$id` | Yüksek | Profesyonel dizini + zengin profil (yeni elden geçti). |
| `/dashboard/portfolios` | Orta (106) | Kendi portföy yönetim listesi. |
| `/dashboard/portfolios/new` | Yüksek (463) | 6 adımlı oluşturma sihirbazı. En büyük dosya. |
| `/dashboard/portfolios/$id` + `/share` | Orta | Portföy detayı + Share Studio (WhatsApp/Link/PDF). |
| `/dashboard/searches` + `new` + `$id` | Yüksek | Arayış yönetimi + AI destekli yeni arayış. |
| `/dashboard/matches` | Orta (194) | Merkezi eşleşme hub'ı. |
| `/dashboard/detail-requests` | Yüksek (388) | Talep inbox + yan panel (yeni elden geçti). |
| `/dashboard/assistant` | Orta (257) | Ana AI yüzeyi. |
| `/dashboard/notifications` | Orta | Bildirim listesi. |
| `/dashboard/favorites` | Düşük (67) | Kaydedilenler grid. |
| `/dashboard/profile` + `/settings` | Düşük | Kendi profil/ayar. Temel form. |

### Eski / sidebar'da olmayan
- `dashboard.concierge.tsx` ve `dashboard.ai-import.tsx` — eski AI akışları. Hâlâ kodda, navigasyonda yok. **Karar verilmeli: birleştir veya sil** (bkz. Bölüm 5).

### Ana kullanıcı yolculukları (mevcut)
```
1. KEŞİF:   Landing → Portföy Ara (harita) → Portföy teaser → Detay Talebi
2. SATICI:  Ana Sayfa → Portföy Oluştur (6 adım / AI Import) → Yayınla → Share Studio
3. EŞLEŞME: Arayış Oluştur → Eşleşmeler hub → Portföy → Detay Talebi
4. AĞ:      Profesyoneller → Profil → Takip / İletişim
5. TALEP:   Detay Talepleri inbox → Yanıtla / Bilgi Paylaş / Reddet
```

---

## 4. Veri Modeli / Database Yapısı (mock)

Kaynak: `src/lib/mock/types.ts`. Şu ana varlıklar mevcut:

| Varlık | Açıklama | Backend tablo karşılığı |
|--------|----------|--------------------------|
| `User` / `Broker` / `Professional` | Kullanıcı & profil (Professional, Broker'ı genişletir) | `profiles` (+ aggregates) |
| `Portfolio` (+ `PortfolioDocument`) | Gizli portföy + kilitli belgeler | `portfolios`, `portfolio_documents`, `portfolio_images` |
| `DetailRequest` | Detay erişim talebi + durum makinesi | `detail_requests` |
| `BuyerSearch` | Alıcı arayışı (profesyonelin girdiği) | `buyer_searches` |
| `MatchResult` | Portföy↔arayış skoru + açıklama | hesaplanan / `matches` |
| `Region` (+ `RegionExpertise`) | Bölge + uzmanlık | `regions`, `region_expertise` |
| `AppNotification` / `RegionWatch` | Bildirim + bölge takip | `notifications`, `region_watches` |
| `SavedSearch` / `Activity` | Kaydedilen arama + aktivite | `saved_*`, `activity_log` |

**Veri modeli gözlemleri:**
- Model olgun ve domain'i iyi yansıtıyor; enum'lar (`PortfolioStatus`, `Purpose`, `Visibility`, `LocationMode`) net.
- **İlişkiler gömülü** (örn. `Portfolio.owner` tam `Broker` objesi, `DetailRequest.portfolio` tam `Portfolio`) — backend'e geçişte foreign-key + join'e dönmeli.
- **Eksik kavramlar:** mesajlaşma/thread, üyelik başvuru/onay kaydı, portföy-arayış eşleşme tablosu (kalıcı), erişim izni (granted access) kaydı, audit log, profil görüntülenme analitiği.
- **Roller:** RLS için ayrı `user_roles` tablosu gerekecek (profilde tutulmamalı).

---

## 5. AI Katmanı — Mevcut Durum ve Problem

Şu an **üç ayrı AI yüzeyi** var ve işlevleri örtüşüyor:

| Yüzey | Rota | Ne yapıyor | Sorun |
|-------|------|-----------|-------|
| VAULT Asistan | `/dashboard/assistant` | Eşleştirme, uzman bulma, değerleme, PDF | Ana yüzey; sidebar'da. |
| Concierge | `/dashboard/concierge` | Doğal dil ile portföy + uzman bulma | Asistan ile büyük örtüşme. Navigasyonda yok. |
| AI Import | `/dashboard/ai-import` | WhatsApp/PDF/foto → portföy taslağı | Farklı iş (veri çıkarımı) — değerli ama yetim. |

**Hepsi mock** — gerçek LLM çağrısı yok, cevaplar sabit (canned). 

**Öneri (karar gerekiyor):**
- **Tek "VAULT Asistan"** çatısı altında birleştir: sohbet + eşleştirme + değerleme + içe aktarma birer "skill/araç" olsun.
- AI Import'u Asistan içinde "Portföy İçe Aktar" aracı veya Portföy Oluştur sihirbazının ilk adımı yap.
- Concierge'i Asistan'a katıp rotayı emekliye ayır.
- Gerçek AI: Lovable AI Gateway (Gemini) ile streaming sohbet + yapılandırılmış çıktı (arayış kriterleri, taslak alanları).

---

## 6. Parçalı Yapı (Component Mimarisi)

- `src/components/layout/` — AppShell, Sidebar, Topbar, PageHeader (sağlam çekirdek).
- `src/components/vault/` — ~50 domain bileşeni (kartlar, rozetler, harita mock, AI button, profil bölümleri).
- `src/components/ui/` — shadcn primitifleri (tam set).

**Gözlemler:**
- Bileşen ayrıştırması iyi; ama bazı yakın işlevliler birikti (ör. `professional-card`, `professional-mini-card`, `region-expert-card`, `region-card`, `region-expertise` çeşitlemeleri). Periyodik konsolidasyon gerek.
- `cards.tsx` (SurfaceCard) ve `badges.tsx` paylaşılan temel — iyi.
- `professional-quick-actions.tsx` ve `professional-links-section.tsx` son revizyonda kullanımdan kalkmış olabilir — ölü kod taraması yapılmalı.

---

## 7. Design System & Mobil Design

### Design system (güçlü)
- **Renk:** dark-only, near-black zemin + katmanlı charcoal surface'lar + gold accent. Tümü oklch, semantik tokenlar (`--gold`, `--surface`, `--border-strong`, `--gradient-gold`, `--shadow-elegant/gold`).
- **Tipografi:** display = Cormorant Garamond (serif, logo/başlık), body = Manrope (sans).
- **Tutarlılık:** bileşenler tokenları kullanıyor; sabit renk class'ı az.

### Mobil design (eksik)
- `AppShell` mobilde Sheet ile sidebar açıyor — temel düzeyde çalışıyor (`use-mobile`, breakpoint 768).
- **Sorunlu sayfalar:** çift panel düzenler — `/dashboard/search` (harita+liste), `/dashboard/detail-requests` (liste+detay, kısmen düzeltildi), `/dashboard/matches`, profesyonel profili. Mobilde dikey stack + otomatik scroll/odak iyileştirmesi gerekiyor.
- **Öneri:** mobil için "liste → detay" tam ekran geçişi (geri butonlu), alt sticky aksiyon barı, harita için tam ekran modal.

---

## 8. Landing Page Analizi

Mevcut yapı (`/`): Navbar → Hero → Problem → Nasıl Çalışır → Özellikler → Concierge → Üyelik → Final CTA → Footer. İskelet iyi ama **içerik ve görseller güncellenmeli.**

### Sorunlar
1. **Görsel eksikliği:** Hero mockup statik `map-dark.jpg` + Unsplash. Marka hissi veren, üretilmiş özel görseller yok.
2. **"Problem" bölümü** soyut — somut acı noktalarına (ilanların herkese açık olması, müşteri mahremiyeti, yanlış alıcı trafiği, WhatsApp kaosu) bağlanmalı.
3. **"Nasıl Çalışır"** adımları net değil — 3-4 net adım + görselle anlatılmalı.
4. **"Özellikler"** jenerik — her özelliği somut faydaya çevir (harita keşfi, kilitli detay, AI eşleştirme, Share Studio, doğrulanmış ağ).
5. **Concierge bölümü** için ürün-içi gerçekçi AI sohbet görseli üretilmeli.
6. **CTA tutarsızlığı:** "Üyelik Başvurusu Yap" → doğrudan dashboard. Gerçek başvuru/waitlist akışı yok.

### Üretilecek görseller (öncelik sırası)
- Hero: dark-luxury harita + kilitli portföy kartları kompozisyonu (marka).
- "Nasıl Çalışır" her adım için ikon/illüstrasyon.
- Concierge: AI sohbet + sonuç kartları mockup'ı.
- Özellik kartları için küçük görsel/ikon seti.
- Sosyal kanıt / üyelik rozeti görseli.

---

## 9. İsimlendirme & Terminoloji

Sabit sözlük (korunmalı): **Portföy, Arayış, Kaydedilen Arayış, Bölge, Bölge Uzmanı, Eşleşme,
Detay Talebi, VAULT Asistan, Share Studio.** "İlan" yasak.

### Yeniden düşünülecekler
| Mevcut | Sorun | Öneri |
|--------|-------|-------|
| "Detay Talepleri" | Pasif/teknik | "Talepler" veya "Erişim Talepleri" / "Fırsatlar" |
| "Portföy Ara" vs "Portföyler" vs "Portföylerim" | "Portföy" hem keşif hem sahiplik için | Keşif = "Keşfet/Portföyler", sahiplik = "Portföylerim" net ayrılsın |
| "VAULT Asistan" vs "Concierge" | İki isim, tek iş | Tek isim: "VAULT Asistan" (Concierge'i emekli et) |
| "Arayış" | İç-jargon, ama tutarlı | Korunabilir; tooltip ile "müşteri talebi" açıklaması |
| Üyelik tier: standard/pro/elite + badge "Private Beta" | Tier ve badge karışık | Tier ve görünür rozet ayrımı netleştirilmeli |

---

## 10. Değer / Fayda Analizi

### Kullanıcı tarafı (profesyonel)
- **Acı:** Açık ilan platformlarında müşteri mahremiyeti yok, yanlış alıcı trafiği, WhatsApp/PDF kaosu, portföy hazırlamak zaman alıyor.
- **VAULT değeri:** kapalı paylaşım + kontrollü erişim + AI ile hızlı portföy + doğru eşleşme.

### Product tarafı
- **Çekirdek döngü:** Portföy oluştur → keşfedilir → detay talebi gelir → erişim ver → eşleşme/satış. Bu döngü güçlendirilmeli (bildirim + AI tetikleyici).
- **Network etkisi:** ne kadar çok doğrulanmış profesyonel + arayış, o kadar değerli eşleşme.

### Değer/fayda tarafı
- Asıl değer **mahremiyet + güven + isabetli eşleşme**. Her ekran bu üçlüyü pekiştirmeli (kilit göstergeleri, doğrulama rozetleri, eşleşme açıklamaları zaten var — landing'e taşınmalı).

---

## 11. Boşluklar, Riskler & Öncelikli Yol Haritası

### Kritik boşluklar
1. Backend yok → hiçbir veri kalıcı değil, gerçek eşleştirme/PDF/bildirim yok.
2. Üyelik başvuru/onay akışı yok (kapalı ağ vaadini karşılamıyor).
3. AI yüzeyleri parçalı ve sahte.
4. Mobil çift-panel sayfalar optimize değil.
5. Landing görselleri ve mesajları zayıf.

### Önerilen yol haritası (faz)
- **Faz 0 — Ürün netliği (şimdi):** isimlendirme kararı, AI birleştirme kararı, landing yeniden yazım + görsel üretimi, bu knowledge base.
- **Faz 1 — UI cilası:** mobil çift-panel düzeltmeleri, empty/loading/error durumları, public portföy/profil sayfalarını güçlendir.
- **Faz 2 — Backend (Lovable Cloud):** auth + roller, çekirdek tablolar + RLS + GRANT, kalıcı store'lar.
- **Faz 3 — Gerçek AI (Lovable AI Gateway):** streaming asistan + yapılandırılmış çıktı + içe aktarma.
- **Faz 4 — Çekirdek döngü otomasyonu:** eşleştirme job'ı, bildirim teslimatı, PDF üretimi, paylaşım analitiği.

---

## 12. Backend TODO (modül bazında)

- **Auth & Üyelik:** Supabase auth, `user_roles` tablosu (RLS güvenliği), üyelik başvuru + onay akışı.
- **Profiller:** `profiles` + follower/portfolio aggregate'leri, profil görüntülenme analitiği.
- **Portföyler:** `portfolios` + `portfolio_documents` + `portfolio_images`, görsel storage, kilit/erişim mantığı RLS ile.
- **Arayışlar:** `buyer_searches` kalıcılığı + arka plan eşleştirme job'ı.
- **Eşleşmeler:** portföy↔arayış skorlama servisi + kalıcı `matches`.
- **Detay Talepleri:** gerçek durum makinesi + erişim izni (granted access) kaydı + bildirim tetikleyicileri.
- **Share Studio:** gerçek PDF üretimi + paylaşım takibi (analytics).
- **Bölge/Bildirim:** `region_watches` + bildirim teslimat servisi (instant/daily/weekly).
- **AI:** Lovable AI Gateway entegrasyonu (sohbet streaming + structured output), içe aktarma çıkarımı.
- **Follow / Saved:** `follows`, `saved_portfolios`, `saved_searches` tabloları (şu an lokal store).
