# OTONOM YAPIM — İLERLEME

> Otonom tur (Ege yokken). Her satır: durum + commit + bağlanan veri + migration taslağı + REVIEW notu.
> Kural: db push YOK · DECISIONS sabit · D13 kutsal · anon yalnızca definer RPC+allow-list.

## A — MEVCUT TABLOLARLA BAĞLANANLAR (migration YOK)

| # | Sayfa | Durum | Commit | Bağlanan veri |
|---|-------|-------|--------|----------------|
| A1 | Portföy detay `/dashboard/portfolios/$id` + `/p/$slug` | ✅ (önceki tur) | KATMAN 3 | `getMyPortfolioFull` + `get_public_portfolio` + `has_portfolio_access`; D13 split, call_only, kilitli şeffaflık, ref_no, response_message. Not: Lovable `portfolio-detail-view` yerine D13-güvenli `detail-parts` kullanıldı (bilinçli — leak yüzeyi kapalı). |
| A2 | Keşfet `/dashboard/search` | ✅ (önceki tur) | KATMAN 5 | `listNetworkPortfolios` + filtre + mini emlakçı; ortak `teaser-card`. |
| A3 | Detay Talepleri `/dashboard/detail-requests` | ✅ gerçek + KPI | (bu tur) | `listInbox`/`listMyRequests`/`approve`/`reject` + response_message. |
| A4 | Landing başvuru formu | ✅ (slice 1) | D28 | `submitApplication` → `applications` anon insert. |
| A5 | Profil `/v` + in-app | ✅ (pilot) | profile pilot | reconnected `ProfessionalProfileView` + adapter. |
| A6 | Dashboard ana sayfa `/dashboard/` | ✅ (bu tur) | (bu tur) | gerçek özet: kendi portföy sayısı/aktif, bekleyen gelen talep, gönderdiğim talep, son portföyler, son gelen talepler. |

## B — YENİ TABLO/MIGRATION GEREKENLER (kod + TASLAK, PUSH YOK)

> ⚠️ Push edilemediği için (tip regen yok), B'de teslim edilen değer = **incelenip push
> edilecek taslak migration'lar**. Veri katmanı + sayfa bağlama push+regen SONRASI adım
> (bkz. RETURN_CHECKLIST.md). Kanıtlanmış kalıp: tablo+RLS taslağı → push → regen →
> data layer → adapter → Lovable bileşenine bağla → leak'e ekle.

| # | Özellik | Durum | Migration taslağı | Not |
|---|---------|-------|-------------------|-----|
| B7 | Arayış (searches) | ✅ uçtan uca bağlı | `20260619140000_b7_searches` (UYGULANDI) | Migration push edildi + tipler regen. `lib/data/searches.ts` (CRUD + ağ listesi+owner mini) + `components/search/{search-card,search-form}` (vizyonsuz: B8 eşleşme sayacı / B11 bildirim YOK) + my-searches.{index,new,$id} + searches.{index,$id} gerçek veride; `featureFlags.arayis=true`. Leak'e eklendi (20/20). |
| B8 | Eşleşme | 🟡 migration TASLAK + iskele | `20260620120000_b8_match_search_DRAFT.sql` | `match_search(_search_id)` definer RPC (teaser-only allow-list + agent mini + score; verified+own/active; own portföyler hariç). `lib/data/matches.ts` iskeleti (stub, cast yok). `featureFlags.matches` KAPALI — bağlama push+regen sonrası. Leak'e eklendi. |
| B9 | Bölgeler | 📝 spec (RETURN) | — | portfolios'tan türetme (yeni tablo gerekmez): definer RPC `get_region_summary()` (verified-only, district+count). Tasarım RETURN'de. |
| B10 | Harita | 📝 spec (RETURN) | migration GEREKMEZ | MapLibre (D3) + approx_lat/lng (D30, zaten var); exact ASLA. Frontend bileşen işi; tasarım RETURN'de. |
| B11 | Bildirim/Takip/Kaydet | 🟡 migration TASLAK | `20260619141000_b11_follows_saved_notifications_DRAFT.sql` | 3 owner-scoped tablo; notifications client-insert YOK (server-yazımlı). Sayfa bağlama = push sonrası. |

### Taslak migration'lar (UYGULANMADI)
- `20260619140000_b7_searches_DRAFT.sql`
- `20260619141000_b11_follows_saved_notifications_DRAFT.sql`
(M4 öncesi taslaklar — m3/m4/m4b/m4c — ayrıca Ege'nin push sırasında.)

## HARİÇ
- AI / Asistan (VAULT Asistan, AI ile Portföy) — feature-flag arkasında stub, dokunulmadı.

## Test durumu
- `test:leak`: profil yüzeyi dahil 15/15 ✅ (her yeni veri yüzeyi eklendikçe güncellenir).
- `test:attrs`: 14/14 ✅.
