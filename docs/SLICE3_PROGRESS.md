# Slice 3 — Public teaser + paylaşım (ilerleme)

> Otonom. Kod-only; migration TASLAK (uygulanmadı). typecheck+build+lint yeşil
> (0 hata), statik sızıntı testi geçti. **Runtime "çalışıyor" iddiası YOK** — RPC
> migration uygulanmadan public sayfalar veri döndürmez.

## İŞ 1 — public teaser RPC migration (TASLAK, uygulanmadı)
`supabase/migrations/20260618223704_slice3_public_teaser_rpc.sql`
- `get_public_portfolio(_slug)` — SECURITY DEFINER, **yalnızca status='active'**, jsonb
  **explicit allow-list** (select * YOK): teaser scalar kolonlar + `portfolios.attributes`
  (PUBLIC bag) + **yalnızca public görseller** (visibility='public', path/sort/is_cover) +
  sahip emlakçının **PUBLIC profil** alanları (D8 açık iletişim dahil).
  **Gövde `portfolio_private`/`portfolio_documents`'a HİÇ dokunmaz.**
- `get_public_profile(_username)` — SECURITY DEFINER, **yalnızca status='verified'**,
  public display alanları (id/status/auth YOK).
- `revoke ... from public; grant execute ... to anon, authenticated;` search_path pinli.
- **Neden sızdırmaz:** kolon allow-list + status gate + locked kaynaklara referans yok +
  anon'un base-tablo grant'i yok (yalnızca bu definer fonksiyonlara EXECUTE).

## İŞ 2 — kod
1. **`/p/$slug` anon teaser** (`src/routes/p.$slug.tsx`): `getPublicPortfolio` RPC ile
   kapak + PUBLIC galeri (lightbox), başlık/fiyat/tip/oda/m²/özellik + **public attributes**
   (UI'da ekstra `visibility==='public'` filtresi), yaklaşık konum metni, emlakçı iletişimi
   (Ara + WhatsApp + e-posta). Kilitli hiçbir değer yok. **"Detay Talebi" → /login** (D5/D22).
   Statik brand OG; dinamik başlık client-side. (Dinamik OG için SSR loader sonraki iş.)
2. **WhatsApp paylaşım** (`dashboard.portfolios.$id.share.tsx`): owner Share Studio gerçek
   veriyle — public link (`bolgeninuzmani.com/p/<slug>`, D16 placeholder) + hazır mesaj +
   `wa.me/?text=` + Linki/Mesajı Kopyala + "Public sayfayı aç". Yayında-değil uyarısı.
3. **`/v/$username`** (`src/routes/v.$username.tsx`): `getPublicProfile` RPC ile geri açıldı
   (avatar/ad/ünvan/şirket/konum/bio/uzmanlık/iletişim). **"Profili Önizle"** (Profilim)
   tekrar bağlandı → `/v/$username`.
4. **Statik sızıntı testi** (`scripts/test-public-teaser-leak.ts`, `npm run test:leak`):
   RPC gövdesi + `public-portfolio.ts` shape'leri + `/p/$slug` sayfasında (yorumlar
   strip'lenerek) `portfolio_private/portfolio_documents/exact_address/exact_lat/exact_lng/
   malik_info/private_description/private_notes` **YOK** assert'i → **PASS**.

## TS stub'ları
RPC migration uygulanmadığından `database.types.ts` Functions'a **STUB** eklendi
(`get_public_portfolio`/`get_public_profile` → Returns: Json), "regen sonrası gerçek
tiplerle değişecek" işaretiyle. `public-portfolio.ts` jsonb sonucunu tiplenmiş shape'e
cast eder. Build yeşil.

## Commit'ler
- `feat: slice 3 public teaser + share (RPC draft, anon /p + /v, WhatsApp, leak test)`

## Sınırlara uyum
- DB/storage'a yazma yok, migration uygulanmadı (sadece TASLAK), MCP apply yok.
- DECISIONS_LOCKED'a dokunulmadı.
- M3 (kontrollü erişim/grant/detay-talebi motoru) **başlatılmadı** — "Detay Talebi"
  yalnızca /login'e yönlendiriyor.
- Sızıntı: statik assert geçti; kilitli veri public yola girmiyor.

## Sen dönünce (RETURN_CHECKLIST.md'de sıralı)
RPC migration'ı incele → `supabase db push` → TS regen + stub uyumla → gizli sekmede
`/p/<slug>` test (teaser + iletişim var; exact/malik/private/locked foto/belge YOK;
Detay Talebi→login) → `/v/<username>` test.
