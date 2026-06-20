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
| B8 | Eşleşme | ✅ uçtan uca bağlı | `20260620120000_b8_match_search` (UYGULANDI) | RPC push edildi + tipler regen. `lib/data/matches.ts` gerçek `supabase.rpc('match_search')` (teaser+score+agent). `components/search/match-results.tsx` → arayış detayında "Eşleşen Portföyler" (auto, teaser-card + uyum skoru). `dashboard.matches` gerçek özet. `featureFlags.matches=true` + sidebar "Eşleşmeler". Leak'e eklendi (teaser-only). |
| B9 | Bölgeler | 🟡 migration TASLAK + iskele | `20260620170000_b9_region_summary_DRAFT.sql` | `get_region_summary()` definer RPC (city/district + active_count; verified-only; bölge adı+sayı, D13 alanı yok). `lib/data/regions.ts` iskeleti (stub, cast yok). `featureFlags.regions` KAPALI — sayfa bağlama push+regen sonrası. Leak'e eklendi. |
| B10 | Harita | ✅ uçtan uca (migration yok) | — | `maplibre-gl` + `portfolio-map.tsx` (SSR-güvenli, **yalnız approx_lat/lng**). Keşfet liste+harita (lg), portföy detay "Yaklaşık Konum" gerçek pin (/p + in-app). `featureFlags.harita=true`. Leak: exact koordinat haritaya sızmıyor (eklendi). |
| B11 | Bildirim/Takip/Kaydet | ✅ uçtan uca (writer TASLAK) | tablolar UYGULANDI; `20260620150000_b11_notify_writer_DRAFT.sql` (TASLAK) | Tablolar canlı + tipler regen. `lib/data/{follows,saved,notifications}` + `use-saved-portfolios`/`use-notifications` hook'ları. **Takip Et** (profil, kendinde gizli), **Kaydet** (teaser-card bookmark + Keşfet + Favoriler), **Bildirim okuma** (topbar dropdown + sayfa + sidebar rozeti) gerçek. `featureFlags.follow=true`. **notify-writer** (detail_requests trigger → bildirim) TASLAK — push edilince bildirimler gerçekten düşer. Leak'e eklendi. |

### Taslak migration'lar (UYGULANMADI)
- `20260619140000_b7_searches_DRAFT.sql`
- `20260619141000_b11_follows_saved_notifications_DRAFT.sql`
(M4 öncesi taslaklar — m3/m4/m4b/m4c — ayrıca Ege'nin push sırasında.)

## HARİÇ
- AI / Asistan (VAULT Asistan, AI ile Portföy) — feature-flag arkasında stub, dokunulmadı.

## Test durumu
- `test:leak`: profil yüzeyi dahil 15/15 ✅ (her yeni veri yüzeyi eklendikçe güncellenir).
- `test:attrs`: 14/14 ✅.
