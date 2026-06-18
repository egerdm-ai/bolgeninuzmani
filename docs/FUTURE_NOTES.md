# Bölgenin Uzmanı — Ertelenen Notlar & İleriki TODO'lar

Havada kalan "sonra yaparız / X'te unutma" notlarının tek listesi. İlerledikçe
güncellenir. Karar niteliği kazananlar DECISIONS_LOCKED.md'ye taşınır.

## M2 / Slice 2 (Portföy) için
- **portfolio_private split (D13):** kilitli alanlar `portfolios`'ta kolon değil,
  ayrı 1:1 tablo, kendi RLS'i (owner VEYA aktif grant).
- **Public teaser view/RPC:** anon taban tablolara dokunmaz. Anon'un `profiles`
  SELECT hakkı yok → `/p/$slug` teaser'ı emlakçının public profil alanlarını
  (ad, iletişim — D8) bir security-definer view/RPC ile gösterecek.
- **Eksik edit route (D19):** `/dashboard/portfolios/$id/edit` + "Düzenle" bağla.

## Slice 4 (kontrollü erişim) için
- **notifications tablosu:** talep geldi / onaylandı bildirimleri — erişim döngüsü
  bunsuz çalışmaz.
- **access_events (audit log):** kim talep etti/onayladı/gördü — güven özelliği,
  eklemesi ucuz.
- **Taylan'a ürün sorusu:** manuel onay güven mi yaratıyor, friction mı? Slice 4
  UI'ının ağırlığını belirler.

## Güvenlik / cila
- **membership_tier'ı kilitle:** kullanıcı kendine "Elite" rozeti veremesin
  (sadece görünüm, düşük öncelik).
- **generate_username:** nadir eşzamanlı çakışma signup'ı 500'leyebilir; gerekirse
  retry ekle.
- **Username transliterasyonu:** Türkçe karakter şu an atılıyor (çağrı→ar);
  istenirse eklenir.

## Altyapı / ops
- 🔴 **@lovable.dev/vite-tanstack-config sökümü** — ayrı "build de-Lovable" slice'ı
  (tam vite.config göçü). Acele yok, slice'lar arası.
- **Supabase Pro'ya yükselt** gerçek kullanıcı/demo öncesi (7-gün duraklamayı
  kaldırır, backup ekler). Dev free kalır.
- **Resend:** applications için admin e-posta bildirimi (D28) — Slice 1 sonu / P1.
- **Jira bağla** (Atlassian MCP) build başında; proje key'i lazım.

## Marka / ürün
- **Domain al:** bolgeninuzmani.com (D16); o zamana kadar placeholder.
- **Gerçek logo + mobil monogram ("BU"):** uzun wordmark mobilde tek satıra
  sığmıyor; monogram çözer.
- **Sosyal önizleme görseli:** brand sweep'te og:image/twitter:image kaldırıldı;
  markalı bir tane yapılacak.
- **QA screenshot baseline (D24):** wordmark doğrulandı; tam route baseline beklemede.
- **Harita:** önce liste+filtre shiple, haritayı P1'e al (mimari review önerisi) —
  emlakçıların gerçekte nasıl gezdiğine göre teyit et.

## Admin
- **Admin doğrulama ekranı** (pending→verified) — şimdilik Supabase dashboard;
  ekran sonra yapılır.
