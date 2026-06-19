# RETURN_CHECKLIST — Ege döndüğünde (SIRALI)

Slice 3 (public teaser + paylaşım) + Slice 5 (Keşfet) + cila turu tamam. Statik
doğrulama yeşil: `test:attrs` 8/8 · `test:leak` 8/8 · tsc · build · eslint (0 hata).

## ✅ Zaten uygulandı (sen yaptın)
- `20260618223704_slice3_public_teaser_rpc.sql` (get_public_portfolio/get_public_profile) — CANLI.
- `20260618225020_slice5_kesfet_indexes.sql` (pg_trgm + filtre index) — CANLI.
- TS types regenerated; bu iki RPC'nin stub'ı gerçek tiplerle uyumlandı.

## ⏳ ŞİMDİ YAPILACAK — yeni migration (cila turu)
1. **Agent portfolios RPC migration'ını incele → uygula**
   - Dosya: `supabase/migrations/20260619075951_slice3_agent_portfolios_rpc.sql`
   - `get_public_agent_portfolios(_username)` — SECURITY DEFINER, anon EXECUTE, explicit
     PUBLIC allow-list (teaser kart + public cover path); verified-agent + active gated;
     portfolio_private/documents/locked foto'ya HİÇ dokunmaz. Onaylarsan: `supabase db push`.
   - ⚠️ Uygulanmadan: `/v/$username` "Bu uzmanın portföyleri" boş kalır + sayfada bir
     `get_public_agent_portfolios` 404 (PGRST202) konsol hatası olur (graceful: catch→[]).
     Uygulayınca düzelir.
2. **TS type regen** → `src/lib/database.types.ts`
   - `generate_typescript_types` (MCP) ya da `supabase gen types`. Regen, `database.types.ts`
     içindeki **STUB** `get_public_agent_portfolios` (Returns: Json, "regen sonrası" işaretli)
     satırını gerçek imzayla değiştirir. `npx prettier --write src` → `npx tsc --noEmit` yeşil.

## ✅ Test (uygulamalardan sonra)
3. **Gizli sekmede `/p/<slug>`** (örn. `/p/bebek-cati-kati`): kapak+galeri, fiyat/tip/oda/m²,
   public attributes, yaklaşık konum, emlakçı iletişimi + "Uzmanın tüm portföyleri →".
   GÖRÜNMEMELİ: tam adres/koordinat, malik, özel not, kilitli foto/belge. Detay Talebi→/login.
   (qa wire-level doğruladı: PASS — sızıntı yok.)
4. **`/v/<username>`** (örn. `/v/egeerdem`): emlakçı kartı + iletişim + **"Bu uzmanın
   portföyleri"** artık dolu (agent-portfolios RPC uygulanınca). 404 kalmamalı.
5. **Keşfet'i ikinci verified hesapla** (`/dashboard/search`): anında filtre (yazınca otomatik),
   sade bar + "Daha fazla", aktif chip'ler, sonuç sayısı. Karta tıkla → teaser detay; kilitli
   paneller "🔒 Detay Talebi gerekli" (DEĞER YOK); "Detay Talebi Gönder" → "yakında" toast.
6. **`d13-rls-test.sql` tekrar** (SQL editor). İdeali: bir portföye kilitli foto+belge ekleyip
   çalıştır → non-owner için yine 0 ("D13 PASS").

## Bu turda BAŞLATILMAYAN (bilerek)
- **M3 kontrollü erişim motoru** (Detay Talebi + grants + has_portfolio_access grant-hook +
  inbox + unlock). "Detay Talebi" şu an yalnızca yakında/login.
- Dinamik OG (SSR loader) — şimdilik statik brand OG.

## qa'nın bulduğu, KAPSAM DIŞI (ayrı iş — bu cila turunda dokunmadım)
- Landing/paylaşılan bileşenlerde marka kayması: `src/routes/index.tsx` + landing bileşenleri
  "İlan" ürün terimi kullanıyor (CLAUDE.md: "İlan" asla ürün terimi değil → "Portföy" olmalı);
  `src/components/vault/` dizini hâlâ duruyor (eski "VAULT" adı) + `vault.estate` linkleri.
  Bunlar test edilen 3 sayfada YOK; ayrı bir marka-temizliği slice'ı olarak ele alınmalı.
