# PERF_REPORT — teşhis (ölçülmüş, tahmin değil)

> ADIM 1 (yalnızca teşhis). Kod değişmedi. Aşağıdaki rakamlar ölçümdür.
> Düzeltmeler ADIM 2'de, senin onayınla.

## Nasıl ölçüldü
- **Bundle:** `npx vite build` çıktısı (client asset boyutları).
- **Görsel:** `storage.objects.metadata->>'size'` (gerçek yüklenmiş bytes) + daha önce
  bir public kapağa `curl` (HTTP 200, 4.1 MB).
- **DB/sorgu:** veri katmanı (`src/lib/data/*.ts`) statik analizi — sayfa başına kaç
  round-trip, N+1 var mı.
- **dev vs prod:** `vite dev` paketlenmemiş/yavaştır; **gerçek hız `npm run build` + `vite
  preview` ile ölçülmeli.** Kullanıcı dev'de test ediyorsa gördüğü yavaşlığın bir kısmı
  dev-only'dir (HMR, transform). Aşağıdaki ağırlıklar prod'da da geçerli (asset boyutu).

---

## 🔴 BASKIN SORUN — yüklenen görseller dev'de de prod'da da ~4 MB
**Ölçüm (storage):**
| bucket | obje | toplam | ortalama | maks |
|--------|------|--------|----------|------|
| portfolio-images | 11 | **40 MB** | **3.77 MB** | 4.35 MB |
| portfolio-images-locked | 2 | 8 MB | 4.0 MB | 4.05 MB |

`uploadImages` ham `File`'ı **yeniden boyutlandırmadan** yüklüyor (kod teyitli: resize/
thumbnail YOK). Kartlar bu görseli ~300px genişlikte gösteriyor ama tarayıcı **tam 4 MB**'ı
indiriyor. Sayfa başına etki:
- **Keşfet** (12 kart): ~**45 MB** görsel / sayfa.
- **Portföylerim**: her kapak tam çözünürlük.
- **Portföy detay & /p**: galeri **her küçük resmi bile** (96px) tam 4 MB indiriyor.

Tek başına bu, sayfa ağırlığının ~%95'i. `loading=lazy` ekli (görünürdeki ertelenir) ama
indirilen bytes aynı. **En yüksek etki burada.**

---

## Sayfa başına en yavaş 3 (etki/efor sıralı)

### Portföylerim (`/dashboard/portfolios`)
1. **4 MB kapaklar** (kart ~300px). Etki: ÇOK YÜKSEK · Efor: ORTA → upload'ta resize +
   thumbnail; kart thumbnail kullansın.
2. DB: `listMyPortfolios` **tek sorgu** (portfolios + portfolio_images join), cover URL
   client-side `getPublicUrl` (network yok). **N+1 YOK** ✓ — sorun değil.
3. Cross-page cache yok (her ziyaret yeniden çeker). Etki: DÜŞÜK.

### Keşfet (`/dashboard/search`)
1. **12 × 4 MB kapak = ~45 MB/sayfa**. Etki: ÇOK YÜKSEK · Efor: ORTA → thumbnail (aynı fix).
2. DB: `listNetworkPortfolios` **tek sorgu** + `count:exact` (ekstra COUNT). N+1 YOK ✓.
   `count:exact` her sorguda sayım yapar — Etki: DÜŞÜK (veri küçükken önemsiz; çok büyürse
   `count:estimated`).
3. Her debounce'ta `setResult(null)` → tam spinner + yeniden fetch; sonuç cache'lenmez.
   Etki: DÜŞÜK-ORTA (UX titremesi).

### Portföy detay (`/dashboard/portfolios/$id`)
1. **Galeri tüm görselleri tam çözünürlük indiriyor** (kapak + tüm küçük resimler 4 MB).
   Etki: ÇOK YÜKSEK · Efor: ORTA → thumbnail küçük resimlerde, "display" boyut kapakta.
2. **Kilitli görseller için signed URL tek tek** (`imageUrlFor` her locked görselde ayrı
   `createSignedUrl`). k locked görsel = k round-trip. Etki: ORTA · Efor: DÜŞÜK →
   `createSignedUrls` (çoğul, tek istek) ile batch.
3. Round-trip sayısı: `getMyPortfolioFull` = 4 sorgu (portfolios + Promise.all[private,
   images, docs]) + owner-olmayanda +2 (`hasPortfolioAccess`, `myRequestForPortfolio`) + k
   signed-url. Etki: DÜŞÜK-ORTA · Efor: DÜŞÜK → access çiftini zaten Promise.all yap; gerekirse
   tek RPC'ye indir.

### /p/$slug (anon teaser)
1. **Teaser galeri tam çözünürlük** (aynı 4 MB sorunu, müşteriye/mobil veriye gider).
   Etki: ÇOK YÜKSEK · Efor: ORTA → thumbnail.
2. DB: **tek RPC** `get_public_portfolio` (her şey tek jsonb). N+1 YOK ✓.
3. OG etiketi statik (veri client-fetch) — paylaşım önizlemesi zengin değil. Etki: DÜŞÜK
   (perf değil, ayrı iş).

---

## Cross-cutting
- **Sidebar `pendingInboxCount` her navigasyonda** çalışıyor (`[user, pathname]`) → her route
  değişiminde 1 sorgu. Etki: DÜŞÜK · Efor: DÜŞÜK → realtime veya 30sn cache; ya da kabul et.
- **Bundle:** client `index` 336 KB (gzip 107 KB) + bir paylaşılan chunk 277 KB ham. Route
  bazlı code-split zaten var; sıcak sayfalar `recharts`'ı (yalnızca `ui/chart.tsx`)
  import etmiyor. Etki: DÜŞÜK-ORTA (cache'lenir) → sonraki tur; öncelik değil.
- **auth `user`** `useMemo`(session.user) ile stabil → sıcak sayfalarda gereksiz re-fetch
  YOK ✓ (yalnızca token-refresh'te session değişir; düşük).

---

## ADIM 2 önerisi (etki sırası)
1. **Görsel optimizasyonu (TEK BAŞINA EN BÜYÜK KAZANÇ).** Upload'ta client-side resize +
   thumbnail: 
   - Orijinali "display" boyutuna indir (örn. en geniş kenar 1600px, ~200-400 KB) +
     ayrı bir thumbnail (~400px, ~30-60 KB).
   - Kart/liste (Portföylerim, Keşfet, galeri küçük resimleri) **thumbnail**; detay kapağı
     **display**. Beklenen: 4 MB → ~50 KB (kart), Keşfet 45 MB → ~0.6 MB (~%98 ↓).
   - Yalnızca **yeni** upload'ları etkiler; mevcut 11 görsel için ya bir kerelik backfill
     script'i ya da kabul. (Supabase image-transform CDN bir alternatif ama **Pro** add-on;
     free tier'da 400 verir — bu yüzden client-side resize öneriyorum. Thumbnail için
     `portfolio_images`'a `thumb_path` kolonu gerekebilir → **migration TASLAK + sana not**.)
2. **Detay signed-URL batch:** `createSignedUrl` × k → `createSignedUrls` tek istek.
3. (Düşük) Keşfet `count:estimated`, sidebar sayımını cache'le, sonuç cache'i (react-query
   gerekmez; basit in-memory yeterli).

> Migration gerekirse (thumb_path kolonu) yalnızca TASLAK yazılacak, sen uygularsın.
> Hiçbir DECISIONS değişmez, kilitli veri sızmaz (thumbnail'ler de visibility'e tabi:
> locked foto thumb'u da private bucket + signed URL).

---

# ADIM 2 — UYGULANDI (öncesi / sonrası)

**MIGRATION YOK** — `thumb_path` kolonu yerine path konvansiyonu (`<uuid>.webp` +
`<uuid>_thumb.webp`, thumb yolu display'den türetiliyor). DECISIONS'a dokunulmadı.
Kilitli görsel + thumb private bucket'ta, ikisi de signed URL.

### 1. Görsel optimizasyonu (en yüksek etki)
- Upload'ta client-side (canvas/WebP) **iki türev**: display ≤1600px q0.8, thumb ≤400px q0.7.
  Ham ~4 MB **artık saklanmıyor**. Kart/liste/galeri-thumb → thumb; detay kapak/lightbox → display.
- **Bundle etkisi (ölçüldü):** client JS toplam **1208 KB** (öncesi de ~1208 KB),
  `index` chunk **336 KB** — değişmedi; `image-resize.ts` +1.7 KB. **Regresyon yok.**
- **Görsel ağırlığı (projeksiyon — parametrelerden):** kart başına 4 MB → **~30–60 KB thumb**
  (~%98 ↓). **Keşfet 12 kart: ~45 MB → ~0.5–0.7 MB.** Detay küçük resimleri: her biri 4 MB →
  ~50 KB. Kesin rakam **yeni bir görsel yükledikten sonra** ölçülür (Network sekmesi).
- ⚠️ **Mevcut 11 eski görsel 4 MB kalır** (kart onError ile full'e düşer → kırılmaz, sadece
  optimize değil). Bir kerelik dönüştürme için `scripts/backfill-thumbnails.mjs` (sharp, service
  role) — **ben çalıştırmadım, sana bıraktım** (storage yazımı).

### 2. Detay signed-URL batch (ölçüldü, kod)
- Önce: kilitli görsel başına ayrı `createSignedUrl` (k istek). Sonra: **tek `createSignedUrls`**
  (tüm locked display+thumb yolları tek çağrı). Test portföyü: 2 kilitli görsel →
  önce ~2 ayrı istek, şimdi **1** istek (üstelik thumb'ları da imzalıyor).

### 3. Keşfet (ölçüldü, kod)
- `count:exact` → **`count:estimated`** (küçük tabloda exact, ölçekte planner tahmini → ucuz COUNT).
- Her filtrede `setResult(null)` (tam spinner / boş ekran) → **eski sonuç ekranda kalır +
  üstte ince loading bar** (titreme yok).

### Doğrulama
- `tsc` ✅ · `vite build` ✅ · `eslint` 0 hata · `test:leak` 10/10 (kilitli sızıntı yok;
  locked thumb da private bucket + signed URL).
- **dev vs prod:** ağırlık farkı `npm run build` + `vite preview`'da net görülür; `vite dev`'de
  HMR/transform yavaşlığı bunun üstüne biner.

### Commit'ler
- `docs: PERF_REPORT — measured perf diagnosis (ADIM 1)`
- `perf: client-side image resize on upload (WebP display+thumb) + thumb usage + batched signed URLs + Keşfet UX`
