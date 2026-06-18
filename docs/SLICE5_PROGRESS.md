# Slice 5 — Keşfet (liste/filtre/arama, HARİTA YOK) — ilerleme

> Otonom. Kod-only; yalnızca opsiyonel index migration TASLAK (uygulanmadı).
> typecheck+build+lint yeşil (0 hata), statik sızıntı testi 6/6 geçti.
> **Runtime "çalışıyor" iddiası YOK.**

## Ne yapıldı
1. **`/dashboard/search` = Keşfet** (`dashboard.search.tsx` baştan yazıldı): ağdaki
   doğrulanmış emlakçıların **diğer AKTİF** portföylerini **teaser** olarak listeler.
   - Veri: `listNetworkPortfolios(viewerId, filters, page)` — mevcut
     `portfolios_select_network` RLS (verified + active) + ek `owner_id != viewer`.
   - Server-side **filtre + pagination** (`.range`, `count: exact`), empty/loading/error.
2. **Filtreler:** kategori, işlem tipi, il/ilçe/mahalle (ilike), fiyat min/maks, oda +
   **metin arama** (başlık/şehir/ilçe/mahalle `or(ilike)`, PostgREST grammar için q
   sanitize). "Filtrele" / "Filtreleri temizle". Sayfalı (12/sayfa, Önceki/Sonraki).
3. **Owner-OLMAYAN teaser detay:** Keşfet kartı → mevcut `/dashboard/portfolios/$id`.
   `getMyPortfolioFull` owner-olmayan için RLS gereği **private=null, locked foto/belge
   boş** döndürür (zaten D13 canlı testiyle kanıtlı: non-owner `portfolio_private`=0).
   Detay sayfası artık **isOwner-aware**:
   - Kilitli panel (owner değilse): **değer YOK** → "🔒 Detay Talebi gerekli" + **"Detay
     Talebi Gönder"** butonu → `toast: "Kontrollü erişim yakında"` (M3 **kurulmadı**;
     ölü-buton değil, net "yakında" durumu).
   - Belgeler (owner değilse): "🔒 Erişim onayı ile görünür".
   - Breadcrumb owner-olmayanda "Keşfet".
4. **Statik sızıntı testi** (`npm run test:leak` genişletildi): `listNetworkPortfolios`
   gövdesi + `dashboard.search.tsx` locked-token içermez → **PASS**. (Owner-olmayan
   detayın güvenliği RLS + `isOwner` guard'ı; kilitli değerler yalnızca `isOwner`
   bloğunda render edilir, non-owner'da private=null.)

## Index migration (TASLAK, uygulanmadı)
`supabase/migrations/20260618225020_slice5_kesfet_indexes.sql` — yalnızca performans:
transaction_type/category/price b-tree, (created_at desc) where active partial, pg_trgm
GIN (title/city/district/neighborhood) ilike araması için. RLS/teaser etkisi yok, opsiyonel.

## Sınırlara uyum
- DB/storage'a yazma yok; migration uygulanmadı (sadece TASLAK); MCP apply yok.
- DECISIONS_LOCKED'a dokunulmadı.
- **M3 motoru KURULMADI** — Detay Talebi yalnızca "yakında" toast'u.
- Kilitli veri owner-olmayan teaser yola sızmıyor (RLS + statik assert).

## Sen dönünce
RETURN_CHECKLIST.md'ye bak. Keşfet'i **ikinci verified hesapla** test et: diğerinin aktif
portföyü teaser olarak görünür; kilitli paneller placeholder; Detay Talebi "yakında".
(Opsiyonel) index migration'ı `db push` ile uygula.
