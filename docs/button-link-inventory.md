# VAULT — Buton & Link Envanteri (Button / Link Inventory)

Her ekrandaki aksiyonların hedefi veya lokal etkileşimi. Tüm yazma işlemleri mock'tur.

## /dashboard (Ana Sayfa)
- Portföy Oluştur → `/dashboard/portfolios/new`
- AI ile Portföy Oluştur (AIButton) → `/dashboard/assistant`
- Hızlı işlemler: Portföy Oluştur, Yeni Arayış (`/dashboard/searches/new`),
  Portföy Ara (`/dashboard/search`), VAULT Asistan (`/dashboard/assistant`)
- Son Portföyler → kart `/p/$slug`, "Tümünü Gör" → `/dashboard/portfolios`
- Gelen Detay Talepleri "Tümü" → `/dashboard/detail-requests`
- Asistan kartı → `/dashboard/assistant`

## /dashboard/search (Keşfet → Portföyler)
- Filtrele butonu → filtre modalı (lokal)
- VAULT Asistan'a Sor → `/dashboard/assistant`
- Arayış Olarak Kaydet → kaydet modalı (lokal); zaten kayıtlıysa toast
- Quick chip'ler → filtre aç/kapat (lokal) veya modal
- Portföy kartı → `/p/$slug`; Detay Talep Et → modal; Kaydet → lokal; Paylaş → link kopyala
- Aktif filtre chip kaldır / Tümünü temizle → lokal

## /dashboard/portfolios (Portföylerim)
- Portföy Oluştur → `/dashboard/portfolios/new`; AIButton → `/dashboard/assistant`
- Durum sekmeleri → lokal filtre; Sırala → görüntülenmeye göre sıralama (lokal)
- Satır: Görüntüle → `/dashboard/portfolios/$id`, Paylaş → `/dashboard/portfolios/$id/share`
- Satır menüsü: Düzenle (toast), Share Studio → share rotası, Pasifleştir (toast), Sil (toast)

## /dashboard/portfolios/$id (Portföy Detayı)
- Kaydet → lokal; Paylaş → `/dashboard/portfolios/$id/share` (public modda link kopyala)
- Detay Talep Et / PDF CTA → detay talebi modalı
- Eşleşme paneli, sahibi kartı, benzer portföyler → ilgili rotalar

## /dashboard/portfolios/$id/share (Share Studio)
- Kanal seçimi (WhatsApp/Link/PDF/E-posta) → lokal
- Kopyala butonları → panoya kopyala + toast
- WhatsApp'ta Aç → `wa.me` yeni sekme + toast
- PDF Önizle / İndir, E-posta taslağı → toast (demo)

## /dashboard/searches (Arayışlar)
- Yeni Arayış Oluştur → `/dashboard/searches/new`
- Durum filtreleri → lokal
- Kart başlık/Eşleşmeleri Gör → `/dashboard/searches/$id`
- Düzenle / Pasifleştir → toast (lokal)

## /dashboard/searches/new
- AI ile Filtrelere Çevir → mock NLP filtre doldurma
- Eşleşmeleri Bul ve Kaydet → lokal kayıt + `/dashboard/searches/$id`
- Bildirim sıklığı → seçilebilir (lokal)

## /dashboard/searches/$id
- Düzenle → toast; Kaydedilen Arayış → toast
- Eşleşen portföy kartı → MatchExplanationCard (Detay Talebi modal, Profili Gör, Kaydet)
- Bölge uzmanı kartı → `/dashboard/professionals/$id`

## /dashboard/matches (Eşleşmeler)
- Sekmeler: Arayışlarımla Eşleşenler / Portföylerimle Eşleşen Arayışlar / Önerilen Uzmanlar
- Portföy → `/dashboard/portfolios/$id`; Arayış → `/dashboard/searches/$id`
- Uzman → `/dashboard/professionals/$id`; Detay Talebi Gönder → modal

## /dashboard/detail-requests (Detay Talepleri)
- Sekme filtreleri → lokal; talep kartı → sağ fırsat paneli (lokal seçim)
- Yanıtla / Reddet / Bilgi Paylaş → lokal durum güncelleme + toast
- Pipeline ve geçmiş → görsel durum

## /dashboard/regions (Bölgeler)
- Bölge kartı → `/dashboard/regions/$slug`; Takip et → lokal watch

## /dashboard/regions/$slug
- Bölgeyi Takip Et → lokal watch; bildirim sıklığı → lokal
- Portföy kartı → `/p/$slug`; uzman kartı → profil; arayış kartı → arayış detayı

## /dashboard/professionals (+ /$id)
- Kart → `/dashboard/professionals/$id`; Takip → lokal; Portföylerini Gör → profil vitrin (#portfoy-vitrini)
- Profil: Takip, Profili Paylaş (kopya), bölge filtre (lokal), portföy kartı → `/p/$slug`

## /dashboard/assistant (VAULT Asistan)
- Hızlı işlemler + örnek komutlar → mock sohbet/sonuç
- Sonuç: portföy/uzman kartları, Arayış Olarak Kaydet (toast)

## /dashboard/notifications
- Satır → `n.link` (ilgili derin bağlantı) + okundu işaretle
- Tümünü okundu işaretle → lokal

## Düzeltilen ölü butonlar
- portfolio-list-row menü öğeleri (Düzenle/Share Studio/Pasifleştir/Sil)
- portfolios.index "Filtrele" → çalışan "Sırala"
- portfolio-detail-view "Paylaş" → Share Studio / link kopyala
- Share Studio "WhatsApp'ta Aç"
- AIButton varsayılan hedefi (`/dashboard/assistant`)
