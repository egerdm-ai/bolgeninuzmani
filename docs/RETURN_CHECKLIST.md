# DÖNÜŞ CHECKLIST — Ege için (otonom tur sonrası)

Bu turda **kod** tarafı tamamlandı; **migration'lar TASLAK** (push edilmedi). Aşağıyı sırayla yap.

## 0. Genel durum
- A1–A6 (portföy detay, keşfet, detay talepleri, landing, profil, dashboard) **gerçek veride**, yeşil.
- B7 (Arayış) + B11 (follows/saved/notifications) **taslak migration** hazır — UYGULANMADI.
- B8 (eşleşme), B9 (bölgeler), B10 (harita) = spec (aşağıda) — push gerektirenler için önce şema.
- `test:leak` 15/15, `test:attrs` 14/14, typecheck+build+lint yeşil.

## 1. Migration'ları İNCELE → PUSH (sırayla)
Henüz uygulanmamış taslaklar (dosya adında `_DRAFT` olanlar dahil):
1. `supabase/migrations/20260619140000_b7_searches_DRAFT.sql` — Arayış tablosu.
2. `supabase/migrations/20260619141000_b11_follows_saved_notifications_DRAFT.sql` — follows/saved/notifications.
   - (Daha önceki m4b/m4c taslakları da bekliyorsa onları da gözden geçir.)

Her biri için kontrol: RLS enable+force ✓ · anon grant YOK ✓ · owner-scoped policy ✓ · D13 locked alan yok ✓.
Onaylarsan: `supabase db push`. (İstersen `_DRAFT` ekini kaldır.)

## 2. TS tiplerini yenile
```
supabase gen types typescript --project-id zymppviwvvnhaquioxsv > src/lib/database.types.ts
```
Yeni tablolar/enumlar (`searches`, `search_status`, `search_urgency`, `follows`, `saved_portfolios`, `notifications`) tipe gelir.

## 3. Veri katmanı + sayfa bağlama (push+regen SONRASI — kanıtlanmış kalıp)
Kalıp: `lib/data/<x>.ts` (CRUD) → adapter (gerçek→Lovable bileşeni şekli) → Lovable bileşenine bağla → vizyon alanı uydurma → `test:leak`e ekle.

- **B7 Arayış:** `src/lib/data/searches.ts` (listMySearches/listNetworkSearches/create/update/close). `featureFlags.arayis=true` yap. Lovable sayfaları: `dashboard.my-searches.*` + `dashboard.searches.*` + `buyer-search-card`/`save-search-modal` bileşenleri → gerçek veriye. (Şu an mock + flag kapalı.)
- **B11:** `lib/data/{follows,saved,notifications}.ts`. `follow-store`/`saved-store`/`notification-store` (şu an localStorage/mock) → gerçek tablolar. Topbar bildirim dropdown + `dashboard.notifications` + `dashboard.favorites` bağla. Bildirim YAZIMI için trigger/definer RPC ekle (talep onayı→bildirim vb.).

## 4. Kalan B — şema önce yaz, sonra bağla
### B8 — Eşleşme (Arayış ↔ Portföy)
- searches push'undan SONRA. Tasarım: definer RPC `match_search(search_id) → portfolios[]` (verified-only). Kesişim: `transaction_type` + `category` + bütçe aralığı (`price between budget_min/max`) + bölge (city/district) + oda. **YALNIZCA teaser alanlar** (asla locked) döner — get_public_agent_portfolios allow-list'ini örnek al.
- Lovable: `matches`, `match-explanation-card`, `portfolio-match-panel` bileşenleri bağla. Leak'e ekle.

### B9 — Bölgeler
- Yeni tablo gerekmez. Definer RPC `get_region_summary() → {district, active_count}[]` (verified-only), `portfolios where status='active'` üzerinden `count group by district`. Locked alan yok.
- Lovable: `region-card` + `dashboard.regions.*` bağla.

### B10 — Harita (migration gerekmez)
- MapLibre (D3). `approx_lat`/`approx_lng` (D30) zaten teaser RPC'de + portfolios'ta. **exact_lat/lng ASLA** haritaya verilmez (leak testine harita yüzeyini ekle).
- `maplibre-gl` dep ekle; `map-canvas-mock`'u gerçek MapLibre ile değiştir; Keşfet + portföy detay "Konum" + bölge sayfasına yaklaşık pin. Tek pin = approx; köy/mahalle merkezi.

## 5. Test (her adımda)
```
npx tsc --noEmit && npx vite build && npx eslint .
npx tsx scripts/test-public-teaser-leak.ts      # her yeni veri yüzeyini EKLE
npx tsx scripts/test-portfolio-attributes.ts
```
Yeni public/teaser/eşleşme yüzeyi eklediğinde `scripts/test-public-teaser-leak.ts`'e dosyayı ekle (D13).

## 6. En kötü ihtimal / geri dönüş
Tüm A çalışması bağımsız commit'lerde; istemediğin bir B taslağını push etme — sadece o dosyayı sil/ertele. Hiçbir migration uygulanmadığı için kod, mevcut şema ile çalışmaya devam eder.
