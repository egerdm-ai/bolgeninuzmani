# ADRES / KONUM SİSTEMİ — Araştırma + Öneri
> Sorun: adres elle yazılıyor (serbest metin) → harita pin'i tutarsız, bölge
> sayımı bölünüyor ("Bodrum'da 1 var ama girince çıkmıyor"), arama/eşleşme
> tutarsız. Kök neden: standartlaşmamış konum. Çözüm: Sahibinden gibi SEÇMELİ
> il → ilçe → mahalle + her seçime bağlı koordinat (yaklaşık pin için).

## VERİ DURUMU (araştırma)
- Türkiye il/ilçe/mahalle için OLGUN açık veri setleri var (NVI/Adres Kayıt Sistemi
  kaynaklı, GitHub'da JSON/CSV/SQL). Örn:
  - ferhat-mousavi/turkiye-il-ilce-mahalle-koy (JSON, il>ilçe>mahalle hiyerarşi)
  - mhmmdglc/turkey-city-data (PostgreSQL, city/district/neighbourhood + postakod, 2024)
  - caglarsarikaya/turkey-geolocations (il+ilçe KOORDİNAT + plaka)
- KOORDİNAT ayrımı (kritik):
  - İL + İLÇE merkez koordinatı → KOLAY, her sette var, güvenilir.
  - MAHALLE noktası → daha zor/tutarsız (bazı sette var, bazısı ücretli/polygon).
- Bizim D30 (yaklaşık konum, ~mahalle/ilçe merkezi) ile ÖRTÜŞÜYOR: mahalle-tam-nokta
  istemiyoruz zaten. İlçe merkezi (+ varsa mahalle merkezi) yaklaşık pin için yeterli.

## ÖNERİ (MVP için sade + doğru)
**Seçmeli il → ilçe → mahalle (serbest metin YOK).**
1. **Statik veri seti repoda:** Türkiye il/ilçe/mahalle JSON'u (NVI kaynaklı) +
   il/ilçe merkez koordinatları. (Mahalle koordinatı varsa kullan, yoksa ilçe
   merkezine düş — yaklaşık zaten.) Tek seferlik repoya gömülü dosya; runtime'da
   dış API'ye bağımlı OLMA (gizlilik + hız + offline güvenlik).
2. **Wizard'da cascading select:** İl seç → ilçeler dolar → ilçe seç → mahalleler
   dolar. Hepsi aranabilir dropdown (combobox). Serbest yazı yok → tutarlı veri.
3. **Koordinat otomatik:** seçilen mahalle/ilçe merkezinden approx_lat/lng TÜRET
   (D30 jitter mevcut mantıkla). Emlakçı haritada görmez/elle koymaz (gizlilik).
   exact_lat/lng (tam bina) AYRI, kilitli kalır (D13) — bu işten etkilenmez.
4. **portfolios.city/district/neighborhood:** artık STANDART değerler (seçimden).
   → get_region_summary tutarlı gruplar, harita pin'i tutarlı düşer, arama eşleşir.

## NE DEĞİŞİR (etki)
- ✅ Harita: her portföyün approx pin'i tutarlı (ilçe/mahalle merkezinden).
- ✅ Bölgeler: district standart → sayım+filtre eşleşir (Bodrum bug'ı çözülür).
- ✅ Arama/eşleşme: bölge eşleşmesi metin değil ID/standart-ad → güvenilir.
- ⚠️ Mevcut elle yazılmış test portföyleri: standart değerlere map'lenmeli ya da
   yeniden girilmeli (az veri, test — Ege'ye sorulacak).

## VERİ MODELİ KARARI (sorulacak)
- (a) Sadece standart AD sakla (city/district/neighborhood text ama SEÇİMDEN gelen
  kanonik ad) — basit, mevcut şemaya uyar, migration az.
- (b) İl/ilçe/mahalle ID'leri (FK benzeri) sakla — daha sağlam ama daha çok değişiklik.
- ÖNERİ: (a) MVP için yeterli — kanonik ad + koordinat. ID'ye sonra geçilebilir.

## GÜVENLİK (D13/D30)
- Standart konum sadece İL/İLÇE/MAHALLE — bunlar ZATEN public/teaser (D8/D20).
- exact adres + tam koordinat AYRI, kilitli (D13) — bu iş onlara DOKUNMAZ.
- approx pin mahalle/ilçe merkezinden → tam bina ifşası YOK (D30 korunur).
- Statik veri repoda → runtime dış API yok → veri sızıntı yüzeyi eklenmez.

## KAPSAM (bu iş büyük mü?)
Orta. Parçalar: (1) veri seti repoya + yükleyici, (2) cascading combobox bileşeni,
(3) wizard'a bağla + koordinat türetme, (4) get_region_summary/harita standart ada
göre, (5) mevcut veri migrasyonu/yeniden-giriş. Migration GEREKEBİLİR (approx
türetme server-side ise) → taslak + review.
