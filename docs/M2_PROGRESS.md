# M2 — Portföy CRUD: kod aşaması ilerleme raporu

> Otonom çalışma (ADIM A→E). Tüm adımlar tamamlandı; her commit'te typecheck+build
> yeşil, lint 0 hata. DB/storage'a **yazma yapılmadı** (sadece read-only doğrulama).
> Migration uygulama YOK. Tarih: 2026-06-18.

## Özet durum
| Kontrol | Sonuç |
|---------|-------|
| typecheck (`tsc --noEmit`) | ✅ 0 hata (her adımda) |
| build (`vite build`) | ✅ geçti (her adımda) |
| lint (`eslint .`) | ✅ 0 hata · 22 uyarı (hepsi `react-refresh/only-export-components`; kod hatası değil) |
| Yeni route'lar SSR smoke | ✅ /dashboard/portfolios, /new, /$id, /$id/edit → 200, SSR çökmesi yok |

## Adım adım

### ADIM A — Veri katmanı — commit `6b0b53d`
- `src/lib/data/portfolios.ts`: `listMyPortfolios`, `getMyPortfolioFull`, `createPortfolio`,
  `updatePortfolio`, `setPortfolioStatus`, `deletePortfolio`, `uploadImages`, `portfolioImageUrl`.
- `database.types.ts` M2 şemasından yeniden üretildi (bu commit'e dahil).
- **D13:** teaser/liste yalnızca `portfolios`'u seçer; `portfolio_private`/`portfolio_documents`
  YALNIZCA `getMyPortfolioFull` (owner-full) içinde okunur.

### ADIM B — Create wizard — commit `2d4099b`
- `dashboard.portfolios.new`: şema-hizalı form → `createPortfolio`.
- Gerçek dosya input'u/önizleme → `portfolio-images` bucket'a yükleme kodu.
- Owner-only **"Kilitli Bilgiler"** bölümü (D20) → `portfolio_private` (exact adres/lat/lng,
  malik_info jsonb, private açıklama/notlar). approx pin trigger'la otomatik üretilir.
- "Taslak Kaydet" (draft) / "Yayınla" (active) → yeni portföy detayına yönlenir.
- `src/lib/portfolio-labels.ts` (kategori/işlem/durum etiketleri + fiyat formatı).

### ADIM C — Portföylerim — commit `6119af7`
- `dashboard.portfolios.index`: gerçek `listMyPortfolios`, **loading/empty/error** state'leri,
  durum sekmeleri, kapak görselli kartlar, detay + edit linkleri.

### ADIM D — Portföy detay (owner-full) — commit `6119af7`
- `dashboard.portfolios.$id`: `getMyPortfolioFull` — teaser + **Kilitli Bilgiler paneli**
  (exact adres/koordinat, malik, özel notlar) + yaklaşık pin gösterimi + belgeler.
- "Düzenle" (→ edit) ve "Share Studio" (mevcut mock route) aksiyonları.

### ADIM E — Edit route (D19) — commit `6119af7`
- `dashboard.portfolios.$id/edit`: paylaşılan formu önceden doldurur → `updatePortfolio`
  + yeni görsel ekleme + durum (draft/active/passive/sold) kontrolü.
- Daha önce **ölü olan "Düzenle" butonu** artık bağlı (R1.1 kapandı).
- Tekrarı önlemek için `src/components/portfolio/portfolio-form-fields.tsx` (new+edit ortak).

## Doğrulama kanıtı

### 1) D13 sızıntı koruması (statik + yapısal)
- `grep` denetimi: `portfolio_private`/`portfolio_documents` referansları yalnızca
  `getMyPortfolioFull` (owner-full okuma) + create/update yazma yollarında. Teaser/liste
  (`listMyPortfolios`) sadece `portfolios` (teaser-only tablo) seçer.
- Yapısal garanti: kilitli alanlar ayrı tablolarda (D13); teaser satırına SELECT alan biri
  bile kilitli kolonları göremez (ayrı tablo + ayrı RLS).
- ⚠️ **Çalışma-zamanı uçtan uca testi sende:** ikinci bir verified emlakçı hesabıyla başka
  birinin teaser'ını çekip JSON'da exact koordinat OLMADIĞINI doğrulamak senin oturumunu
  (ve 2. hesabı) gerektiriyor. RLS bunu zaten engelliyor (portfolio_private SELECT owner-only);
  kod yolu da locked tabloya teaser'da dokunmuyor.

### 2) approx pin (D30) — read-only SQL ile doğrulandı (yazma yok)
1000 farklı seed ile `derive_approx(40.98765, 29.12345, <uuid>)`:
- jitter **±0.0025° içinde simetrik** (lat ∈ [−0.00249, +0.00250], lng ∈ [−0.00249, +0.00248]).
- 627 farklı approx_lat değeri → seed'e göre değişiyor (sabit değil).
- exact'ten max sapma ~**538 m** (2-ondalık yuvarlama + jitter birlikte; saf jitter ~±280 m).
- **`approx_never_equals_exact = true`** — approx ASLA exact'e eşit değil.
> Not: kullanılan tek MCP çağrısı **read-only SELECT** idi (derive_approx fonksiyonunu test
> için); hiçbir veri/şema yazılmadı, migration uygulanmadı.

## Mimari kararlar / sapmalar (durmadan, not düşülerek)
1. **Create wizard yeniden yazıldı (taxonomy → şema-hizalı).** Mock taxonomy kategorileri
   (`...endustriyel`) DB enum'uyla (`isletme/ozel_varlik`) birebir uyuşmuyordu **ve** taxonomy'nin
   zengin per-kategori dinamik alanlarının şemada kolonu yok. DB enum'unu değiştirmek migration
   (yasak). Bu yüzden form, DB enum'una ve sabit kolonlara hizalandı.
   - **Sonuç/eksik:** taxonomy'nin zengin per-kategori öznitelikleri (örn. cephe, ısıtma tipi…)
     **kalıcılaştırılmıyor.** İleride istenirse `portfolios`'a `attributes jsonb` kolonu (yeni
     migration) eklenip wizard'a bağlanabilir. **Karar senin.**
2. **Görsel düzenleme (edit):** mevcut görseller salt-okunur gösteriliyor; **yeni görsel ekleme**
   destekleniyor. Görsel **silme/sıralama/kapak değiştirme** M2'de yok (sonraki iyileştirme).
3. **`PortfolioDetailView` / `PortfolioListRow` (mock-tipli) kullanılmadı** — gerçek-veri görünümleri
   inline kuruldu. O mock bileşenler repoda duruyor (başka mock yüzeyler için); M3/Slice 3'te
   public teaser yapılırken yeniden değerlendirilebilir.
4. **`/dashboard/portfolios/$id/share` (Share Studio)** hâlâ mock (Slice 3). Detaydaki buton
   oraya gidiyor; içerik gerçek değil.
5. **Belgeler (portfolio_documents):** detayda kind listesi gösteriliyor; **yükleme + signed URL**
   indirme UI'ı M2'de eklenmedi (storage migration uygulandı; UI sonraki adım). Not düşüldü.

## Sen dönünce test edilecekler (tarayıcı — verified hesabınla)
1. **Yeni portföy oluştur** (Kilitli Bilgiler'e exact lat/lng gir + görsel ekle) → Yayınla.
2. **Detay**: Kilitli panelde exact adres/koordinat görünmeli; "yaklaşık pin" exact'ten farklı olmalı.
3. **Portföylerim**: kart listesi + durum sekmeleri + kapak görseli.
4. **Düzenle**: alanlar dolu gelmeli; değiştir + durum değiştir → Kaydet → kalıcı.
5. **Görsel yükleme** gerçekten `portfolio-images` bucket'a gidiyor mu (storage migration uygulandı).
6. (Opsiyonel, D13 canlı) ikinci verified hesapla başka birinin teaser'ında exact koordinat YOK.

## Açık sorular
- Zengin taxonomy öznitelikleri kalıcılaştırılsın mı? (`attributes jsonb` + yeni migration) — **karar gerek.**
- Görsel silme/sıralama + belge yükleme/indirme UI'ı M2'ye mi eklensin, sonraki dilime mi?
- Share Studio (Slice 3) ve public `/p/$slug` teaser (security-definer view, D13) sıradaki iş.

## Commit'ler
```
6119af7 feat: M2 portfolio list + owner detail + edit (ADIM C-E)
2d4099b feat: M2 create portfolio wizard wired to Supabase (ADIM B)
6b0b53d feat: M2 data layer — portfolio CRUD + types (ADIM A)
3f07a76 docs: M2 schema decisions (D29-D32)        # senin
2d... (storage) 20260618193206_m2b_storage_buckets.sql  # ADIM B commit'inde
```
