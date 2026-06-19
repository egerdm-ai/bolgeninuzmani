# M3 — Kontrollü erişim motoru (ilerleme)

> Otonom. Migration **sen uyguladın** (detail_requests + portfolio_access_grants +
> grant-aware has_portfolio_access + 3 RPC canlı). Bu turda yalnızca kod + read-only
> doğrulama. Yazma SADECE RPC'lerle; client `detail_requests`/`grants`'a doğrudan
> yazmıyor. typecheck+build+lint yeşil, `test:leak` 10/10.

## Uçtan uca akış
1. **Keşfet** → bir başkasının aktif portföyü → teaser detay (`/dashboard/portfolios/$id`).
2. Grant'siz görüntüleyen (verified, owner değil): kilitli panel/foto/belge **kapalı** →
   "🔒 Detay Talebi Gönder".
3. **Talep** (ADIM B): `requestDetail(portfolioId, message?)` (RPC). Buton durumları:
   yok→Gönder · pending→"Talebin beklemede" · rejected→"Tekrar gönder".
4. **Gelen kutusu** (ADIM C, sahibi): `/dashboard/detail-requests` → Gelen Kutusu sekmesi
   (`listInbox`) pending'ler üstte; **Onayla**(`approveRequest`)/**Reddet**(`rejectRequest`).
   Sidebar'da pending sayısı rozeti (`pendingInboxCount`). Ayrıca "Gönderdiğim Talepler"
   sekmesi (`listMyRequests`).
5. **Açılma** (ADIM D): onay → grant satırı → `has_portfolio_access` true → grantli
   kullanıcının detay sayfasında kilitli panel + kilitli fotolar (signed URL) + belgeler
   (signed URL indirme) **gerçek değerleriyle** görünür. Red → grant yok → kapalı kalır.

## Adımlar & commit'ler
| Adım | İş | commit |
|------|----|--------|
| A | Veri katmanı `src/lib/data/access.ts` + regen types | `194bfe2` |
| B+C+D | Talep butonu + gelen kutusu + unlock görünürlüğü + nav rozeti | `aac3eda` |
| E | Leak test genişletme + grant test script + bu doküman | bu commit |

## Güvenlik — kanıt
- **Yazma yalnızca RPC:** `access.ts` writes = `requestDetail`/`approveRequest`/`rejectRequest`
  (RPC çağrısı). `detail_requests`/`grants` FORCE RLS + write policy yok → client doğrudan
  yazamaz.
- **Statik sızıntı (`npm run test:leak`, 10/10):** public RPC gövdeleri + public-portfolio.ts +
  `/p` + Keşfet + `/v` + **M3 veri katmanı (access.ts)** + **gelen kutusu sayfası** — hiçbirinde
  locked token (exact_*/malik_info/private_*/portfolio_private/documents) yok.
  > Not: portföy **detay** sayfası bilerek kapsam dışı — kilitli değerleri `isOwner ||
  > hasPortfolioAccess` + RLS koşuluyla render eder; güvenliği aşağıdaki probe + grant
  > script'iyle kanıtlanır.
- **Canlı read-only RLS probe** (grant'siz):
  | | has_portfolio_access | portfolio_private satır |
  |---|---|---|
  | Owner A | **true** | **1** |
  | Non-owner B (grant yok) | **false** | **0** |
  → grant'siz kullanıcı kilitli veriyi göremiyor; hook owner'ı görüyor.
- **Grant testi (rollback'lı, kalıcı değil):** `scripts/m3-grant-test.sql` — bir transaction
  içinde grant ekler, `has_portfolio_access` false→true döndüğünü + grantli kullanıcının
  `portfolio_private`'ı SELECT edebildiğini kanıtlar, sonra **ROLLBACK** (hiçbir şey kalmaz).
  SQL editor'de çalıştır → "M3 PASS".

## SENİN yapacağın iki-hesap uçtan uca tarayıcı testi
Ön koşul: iki **verified** hesap — A (portföy sahibi) ve B (başka emlakçı). A'nın en az bir
**aktif** portföyü olsun, içinde kilitli alan/foto/belge bulunsun.

1. **B ile** giriş → **Keşfet** → A'nın portföyüne tıkla. Kilitli panel kapalı, "Detay Talebi
   Gönder" görünür. Tıkla → (ops.) mesaj yaz → Gönder. Buton "Talebin beklemede"ye döner.
   - Aynı anda kilitli panel/foto/belge **görünmemeli** (değer yok).
2. **A ile** giriş → sidebar "Detay Talepleri"nde **1** rozet → aç → Gelen Kutusu'nda B'nin
   talebi (adı/şirketi + portföy + mesaj). **Onayla**.
3. **B ile** (tekrar) → A'nın portföyü detay → artık **kilitli panel açık** (tam adres, malik,
   özel notlar), **kilitli fotolar** görünür, **belgeler** indirilebilir. "Gönderdiğim Talepler"de
   durum "Onaylandı".
4. **Red senaryosu:** başka bir portföy için B talep eder, A **Reddet** der → B'de kilitli alanlar
   **kapalı** kalır, durum "Reddedildi", istenirse "Tekrar gönder".
5. (İsteğe bağlı) `scripts/d13-rls-test.sql` + `scripts/m3-grant-test.sql`'i SQL editor'de çalıştır
   → "D13 PASS" / "M3 PASS".

## Sınırlara uyum
Migration apply YOK (zaten uygulandı), DECISIONS'a dokunulmadı, DB'ye yazmadım (yalnızca
read-only probe), kilitli veri grant'siz/teaser/anon yola sızmıyor (statik + canlı kanıt),
mevcut dark-luxury stil korundu (redesign yok). Bildirimler hâlâ mock (M5).
