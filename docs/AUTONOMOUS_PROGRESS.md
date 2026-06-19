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
| # | Özellik | Durum | Migration taslağı | Not |
|---|---------|-------|-------------------|-----|
| B7 | Arayış (searches) | ⏳ | — | üye-only tablo + RLS |
| B8 | Eşleşme | ⏳ | — | teaser-only eşleştirme |
| B9 | Bölgeler | ⏳ | — | portfolios'tan türetme |
| B10 | Harita | ⏳ | — | approx pin (D30), exact ASLA |
| B11 | Bildirim/Takip/Kaydet | ⏳ | — | yeni tablolar |

## HARİÇ
- AI / Asistan (VAULT Asistan, AI ile Portföy) — feature-flag arkasında stub, dokunulmadı.

## Test durumu
- `test:leak`: profil yüzeyi dahil 15/15 ✅ (her yeni veri yüzeyi eklendikçe güncellenir).
- `test:attrs`: 14/14 ✅.
