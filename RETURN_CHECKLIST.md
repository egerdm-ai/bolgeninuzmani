# RETURN_CHECKLIST — Ege döndüğünde (SIRALI)

İki aşama otonom tamamlandı: **Slice 3 (public teaser + paylaşım)** ve **Slice 5
(Keşfet liste/filtre/arama, harita yok)**. Hepsi kod + TASLAK migration; hiçbir şey
DB/storage'a uygulanmadı. typecheck/build/lint yeşil, statik sızıntı testi 6/6.

Aşağıdaki adımları **sırayla** yap:

1. **Slice 3 RPC migration'ını incele** → uygula
   - Dosya: `supabase/migrations/20260618223704_slice3_public_teaser_rpc.sql`
   - `get_public_portfolio` / `get_public_profile` (SECURITY DEFINER, anon EXECUTE,
     explicit PUBLIC allow-list). Onaylarsan: `supabase db push`.

2. **TS type regen + stub'ları gerçek tiplerle uyumla**
   - `supabase gen types ...` (ya da MCP `generate_typescript_types`) → `src/lib/database.types.ts`.
   - Regen, `database.types.ts` içindeki **STUB** `get_public_portfolio`/`get_public_profile`
     (Returns: Json, "regen sonrası" işaretli) satırlarını gerçek imzalarla değiştirir.
   - `npx prettier --write src` (regen no-semi yazıyor) → `npx tsc --noEmit` yeşil olmalı.

3. **(Opsiyonel) Keşfet index migration** → uygula
   - Dosya: `supabase/migrations/20260618225020_slice5_kesfet_indexes.sql` (yalnızca perf,
     pg_trgm + b-tree). İstersen `supabase db push`. Şema şekli değişmez → regen gerekmez.

4. **Gizli sekmede `/p/<slug>` test** (anon müşteri yolu)
   - Aktif bir portföyün slug'ı ile `bolgeninuzmani.com/p/<slug>` (veya localhost) aç.
   - GÖRÜNMELİ: kapak + public galeri (lightbox), başlık/fiyat/tip/oda/m²/özellik/public
     attributes, yaklaşık konum metni, emlakçı iletişimi (Ara + WhatsApp).
   - GÖRÜNMEMELİ: tam adres, tam koordinat, malik bilgisi, özel açıklama/notlar, kilitli
     foto, belge. "Detay Talebi" → /login'e gitmeli.
   - `/v/<username>` (verified emlakçı) açılmalı; iletişim görünür.

5. **Keşfet'i ikinci verified hesapla test et** (`/dashboard/search`)
   - İkinci hesabın **diğer** aktif portföyü teaser kartlarında görünür; filtre/arama/sayfa
     çalışır. Bir karta tıkla → teaser detay: kilitli paneller **"🔒 Detay Talebi gerekli"**
     placeholder (DEĞER YOK); "Detay Talebi Gönder" → "yakında" toast'u (M3 henüz yok).

6. **`d13-rls-test.sql` tekrar çalıştır**
   - `scripts/d13-rls-test.sql` (SQL editor). İdeali: önce bir portföye **kilitli foto +
     belge** ekle, sonra çalıştır → non-owner için yine 0 dönmeli ("D13 PASS").

---
## Statik doğrulama (şimdiden yeşil)
- `npm run test:attrs` (8/8) · `npm run test:leak` (6/6) · `npx tsc --noEmit` · `npx vite build` · `npx eslint .` (0 hata).

## Bu turda BAŞLATILMAYAN (bilerek)
- **M3 kontrollü erişim motoru** (Detay Talebi + access grants + has_portfolio_access
  grant-hook + request inbox + unlock). Şu an "Detay Talebi" yalnızca yakında/login.
- Dinamik OG (SSR loader ile `/p/$slug` paylaşım önizlemesi) — şimdilik statik brand OG.
