# ALAN HARİTASI — Standart Portföy Öznitelikleri (Sahibinden/Emlakjet tarzı)
> D40 için taslak. Kategoriye göre standart alanlar + public/locked ayrımı (D33).
> Ege onaylayınca attribute registry'ye (src/lib/portfolio-attributes.ts) işlenecek.
> Kural (D33): bir alan mülkü/maliki TEK BAŞINA teşhis ediyorsa LOCKED; tanıtıcı/
> niteleyici ise PUBLIC. Çoğu öznitelik public (teaser işe yarasın); sadece
> kimlik-ifşa edenler locked.

## ORTAK (tüm kategoriler) — zaten şemada var
- Başlık, açıklama (public) / özel açıklama (locked)
- Fiyat, para birimi, işlem tipi (satılık/kiralık), kategori
- İl / ilçe / mahalle (public) · TAM ADRES (locked) · yaklaşık pin (public) / tam koordinat (locked)
- Emlakçı iletişimi (public, D8) · MALİK bilgisi (locked) · TAPU/belgeler (locked)
- Portföy no (public, D39) · ilan tarihi

---

## 1) KONUT (daire, villa, müstakil, residence, yazlık…)
**PUBLIC (teaser):**
- Oda sayısı (1+1, 2+1, 3+1, 7+2…)
- Brüt m² / Net m²
- Bulunduğu kat · Bina kat sayısı
- Bina yaşı
- Isıtma (doğalgaz/kombi, merkezi, klima, soba, yerden, yok…)
- Banyo sayısı
- Balkon (var/yok) · Asansör · Otopark (açık/kapalı/yok)
- Eşyalı (evet/hayır)
- Kullanım durumu (boş, kiracılı, mülk sahibi)
- Site içerisinde (evet/hayır) · Aidat (₺)
- Cephe (kuzey/güney/doğu/batı)
- Yapı tipi (betonarme, çelik, ahşap…)
- Tapu durumu (kat mülkiyetli, kat irtifaklı, hisseli…)
- Krediye uygun (evet/hayır)
- Takas (evet/hayır)
- Genel özellikler (çoklu seçim): havuz, deniz manzarası, doğa manzarası, güvenlik,
  jeneratör, ankastre, ebeveyn banyosu, giyinme odası, şömine, teras, bahçe…
**LOCKED (teşhis edici):**
- Bina/site adı · Daire/kapı no · Blok

## 2) İŞYERI (dükkan, ofis, mağaza, depo, plaza kat…)
**PUBLIC:**
- İşyeri tipi (dükkan/ofis/mağaza/depo/atölye/plaza…)
- m² (brüt/net) · Kat · Bina kat sayısı
- Bina yaşı · Isıtma · Cephe
- Tuvalet sayısı · Mutfak (var/yok)
- Otopark · Asansör
- Kullanım durumu (boş/kiracılı) · Aidat
- Tapu durumu · Krediye uygun · Takas
- Depozito (kiralıksa)
- İçinde bulunduğu bina tipi (AVM, plaza, han, müstakil…)
- Genel özellikler: vitrinli, köşe başı, cadde üzeri, asma kat, güvenlik, kamera…
**LOCKED:**
- Bina/plaza adı · Kapı/dükkan no

## 3) ARSA (konut imarlı, ticari imarlı, tarla, bağ-bahçe…)
**PUBLIC:**
- Arsa tipi (konut imarlı / ticari imarlı / sanayi / tarla / bağ-bahçe / zeytinlik…)
- m² (toplam alan)
- İmar durumu (konut, ticari, sanayi, tarım, plansız…)
- Ada / parsel **NO** — DİKKAT: bu teşhis edici → LOCKED (aşağıda)
- Kaks (emsal) · Gabari · Taks
- Tapu durumu (müstakil tapulu / hisseli / tahsis…)
- Kat karşılığı (evet/hayır) · Krediye uygun · Takas
- Yola cephe (m) · Altyapı (elektrik/su/yol var mı)
- Manzara, konum nitelikleri
**LOCKED (teşhis edici — arsada ada/parsel mülkü birebir bulur):**
- **Ada no · Parsel no** (bunlar tapu sorgusuyla maliki direkt verir → LOCKED)
- Tam konum/pafta

## 4) TİCARİ (otel, fabrika, çiftlik, komple bina, turistik tesis…)
**PUBLIC:**
- Ticari tip (otel/apart/fabrika/depo/çiftlik/komple bina/benzin ist./AVM…)
- m² (kapalı/açık/arsa) · Kat sayısı · Bina yaşı
- Oda/ünite sayısı (otel vb.) · Kapasite
- İmar/ruhsat durumu (işletme ruhsatı var/yok)
- Isıtma · Otopark · Tapu durumu
- Devren (evet/hayır) · Krediye uygun · Takas
- Mevcut işletme durumu (faal/boş/kiracılı)
- Genel özellikler: cephe, asansör, güvenlik, jeneratör…
**LOCKED:**
- Tesis/bina adı · Ada/parsel no · Tam konum

---

## NOTLAR
- "Krediye uygun / Takas / Tapu durumu" tüm kategorilerde PUBLIC — alıcı için kritik,
  mülkü ifşa etmez.
- Ada/parsel KONUT'ta yok ama ARSA/TİCARİ'de var ve LOCKED (tapu sorgusu = malik).
- Genel özellikler her kategoride "çoklu seçim chip" olarak (features[] + attributes).
- Registry her alanı {key,label,type,options,visibility,category[]} olarak tanımlar;
  wizard kategoriye göre ilgili alanları gösterir.
- Bu liste MVP için yeterli; sonradan registry'den alan eklemek migration gerektirmez (D33).
