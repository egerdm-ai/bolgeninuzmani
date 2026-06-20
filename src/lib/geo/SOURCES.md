# Türkiye geo veri seti — kaynaklar & lisans

Bu klasördeki `provinces.json` / `districts.json` / `neighborhoods.json` dosyaları,
aşağıdaki **MIT lisanslı** açık veri setlerinden `scripts/build-geo-data.mjs` ile
**tek seferlik** derlenip normalize edilmiştir. Runtime'da bu kaynaklara veya herhangi
bir dış API'ye bağımlılık **yoktur** — yalnızca derlenmiş JSON repoda tutulur ve deploy edilir.

## İl + İlçe (isim + merkez koordinatı)
- **Repo:** `ttezer/turkiye-harita-verisi`
- **Lisans:** MIT (Copyright (c) 2026 turkiye_map contributors)
- **Sürüm:** master @ 2026-06-11
- **Kullanılan:** `dist/json/provinces.json` (81 il, `centroid{lat,lon}`),
  `dist/json/districts.json` (973 ilçe, `parent_id` + `centroid{lat,lon}`)
- **Türev:** `provinces.json` (`{code,name,slug,lat,lng}`), `districts.json`
  (`{province,name,slug,lat,lng}`). Koordinatlar 5 ondalığa yuvarlandı.

## Mahalle adları
- **Repo:** `AlperKocanx/TurkiyeGuncelSehirIlceMahalleBilgileri2022`
- **Lisans:** MIT (Copyright (c) 2022 Alper Kocan)
- **Sürüm:** master @ 2023-12-28
- **Kullanılan:** `AdresListesi.csv` (il/ilçe/mahalle adjacency, `UstID` hiyerarşisi)
- **Türev:** `neighborhoods.json` — `"<ilSlug>|<ilçeSlug>": ["Mahalle", …]`. İlçeye
  ilSlug+ilçeSlug ile join edilir (Türkçe-aware slug). 973 ilçenin 919'unda mahalle
  bulundu (~%94); eşleşmeyen ilçelerde mahalle listesi boştur (kullanıcı atlayabilir).

## Kanonik şekil (runtime)
- `provinces.json` — 81 il, **bundled** (~6 KB)
- `districts.json` — 973 ilçe, **bundled** (~84 KB)
- `neighborhoods.json` — **lazy** (`import()`, ~1.3 MB; yalnız mahalle adımı açılınca yüklenir)

## Güvenlik (D13/D30)
İl/ilçe/mahalle adları + ilçe merkez koordinatı **kamuya açık** (NVI/ARS türevi). Bu
veri yalnızca **yaklaşık pin (D30)** için kullanılır; **exact adres/koordinat (D13)**
ile ilgisi yoktur ve buradan türetilmez/saklanmaz.

## Yeniden üretmek
```
node scripts/build-geo-data.mjs   # /tmp'deki kaynak dosyalardan src/lib/geo/*.json üretir
```
