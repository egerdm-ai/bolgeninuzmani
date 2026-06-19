# Slice 3 + 5 — cila turu (ilerleme)

> Otonom. Kod-only; yalnızca 1 yeni anon RPC migration TASLAK (uygulanmadı).
> Her adımda typecheck+build+lint + `test:leak` yeşil. DB/storage yazma yok,
> DECISIONS'a dokunulmadı, kilitli veri sızmıyor (statik assert 8/8 + qa wire-level).

## 1. Keşfet filtre UX (`dashboard.search.tsx`) — `598efea`
- **Anında filtre:** metin/fiyat debounce (300/400ms), select'ler hemen uygulanır.
  "Filtrele" butonu kaldırıldı; her değişiklikte sayfa 0'a döner.
- **Sadeleştirme:** tek temiz bar (arama + kategori + işlem + "Daha fazla"); oda + fiyat
  aralığı katlanır ikincil satırda → kalabalık değil.
- **Aktif filtre chip'leri** (tek tıkla kaldırılır) + canlı **sonuç sayısı** ("N portföy").
- **Seçenekler DB enum'larından** (`Constants.public.Enums`) — yanlış/eksik seçenek yok;
  oda select + mantıklı fiyat girişleri; il/ilçe/mahalle tek arama kutusunda (or-ilike).
- Not: auth-gated olduğu için qa screenshot'ı oturum gerektiriyor (qa /login'e redirect'i
  doğruladı). Kod + leak assert ile doğrulandı.

## 2. Public profil zenginleştirme — `<commit>`
- **Yeni anon RPC (TASLAK, uygulanmadı):**
  `supabase/migrations/20260619075951_slice3_agent_portfolios_rpc.sql`
  `get_public_agent_portfolios(_username)` — SECURITY DEFINER, explicit PUBLIC allow-list
  (teaser kart + public cover path), verified-agent + active gated, anon EXECUTE.
  **Gövde portfolio_private/portfolio_documents/locked foto'ya HİÇ dokunmaz.**
  "Neden sızdırmaz": allow-list + status gate + locked kaynak referansı yok + anon'un
  base-tablo grant'i yok.
- **Veri:** `PublicAgentPortfolioCard` tipi + `getPublicAgentPortfolios(username)`;
  RPC `database.types.ts`'te STUB (Returns: Json, "regen sonrası" işaretli).
- **`/v/$username`:** "Bu uzmanın portföyleri" teaser grid'i (→ `/p/$slug`). Empty state.
- **`/p/$slug` emlakçı kartı:** "Uzmanın tüm portföyleri →" linki → `/v/$username`.

## 3. /v/$username düzeni — `<commit>`
- Yeniden düzen (redesign değil, mevcut dark-luxury): emlakçı kartı (avatar/ünvan/şirket/
  konum/bio/uzmanlık chip'leri) + sağ **İletişim** rayı (WhatsApp/telefon/e-posta, hepsi
  boşsa net mesaj) + **portföy listesi**. qa: render PASS; test profilinde bio/konum/uzmanlık
  null olduğu için sayfa şimdilik seyrek görünüyor — dolu profil + RPC uygulanınca dolar.

## Statik sızıntı testi (`npm run test:leak`) — 8/8
get_public_portfolio body · public-portfolio.ts · p.$slug.tsx · get_public_profile body ·
listNetworkPortfolios body · dashboard.search.tsx · **get_public_agent_portfolios body** ·
**v.$username.tsx** → hiçbirinde locked token yok.

## qa bulguları (read-only)
- `/p/bebek-cati-kati` **leak check PASS** — RPC payload'ı tel üstünden denetlendi: exact
  adres/koordinat, malik, tapu/belge, private yok; yalnızca teaser + approx pin + emlakçı
  açık iletişimi.
- `/v/egeerdem` yeni düzen render oluyor; agent-portfolios RPC uygulanmadığı için liste boş
  + 1 adet 404 (PGRST202) konsol hatası (graceful catch→[]) — RPC uygulanınca giderilir.
- `/dashboard/search` → `/login` redirect (auth-gated; oturumsuz screenshot yok).
- KAPSAM DIŞI (qa flagledi, dokunmadım): landing/`src/components/vault/`'da "İlan"/"VAULT"
  marka kayması → ayrı marka-temizliği işi (RETURN_CHECKLIST'te not düşüldü).

## Sınırlara uyum
DB/storage'a yazma yok; yeni RPC yalnızca TASLAK (db push/MCP apply yok); DECISIONS'a
dokunulmadı; M3 başlatılmadı; kilitli veri anon/teaser/owner-olmayan yola sızmıyor.
RETURN_CHECKLIST yeni migration apply + regen ile güncellendi.
