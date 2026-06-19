# PROFİL SAYFASI — LOVABLE'A BİREBİR YENİDEN KUR
> Mevcut profil layout'u BOZUK (banner boş kutu, avatar kesik/ayrı, ad rozetle
> çakışıyor, iletişim kartı boşlukta). Kozmetik düzeltme YETMEDİ — YAPISAL kur.
> Referans görsel: docs/refs/lovable-profil.png (Ege'nin verdiği Lovable profil ss'i).
> O görsele BİREBİR benzet (palet bizim navy+altın; içerik gerçek veri).

## LOVABLE YAPISI (referans görselden — birebir uygula)
1. **BANNER (üstte, geniş, DOLU):**
   - Tam genişlik, ~220-260px yüksek, KÖŞELERİ yuvarlak.
   - Foto VARSA o foto. Foto YOKSA: zengin varsayılan — navy→altın sinematik
     gradient + hafif desen/doku (düz boş kutu ASLA). Manzara hissi.
   - Banner içinde sağ üstte aksiyon butonları (kendi profilinde: "Kapak Ekle"/
     "Profili Paylaş"; başkasınınkinde: "Profili Paylaş").
2. **AVATAR (banner'a TAŞAN):**
   - Büyük yuvarlak (~120-140px), banner'ın ALT-SOL kenarına oturup banner'a
     TAŞAR (negatif margin / overlap). ring-4 ring-[bu-bg] ile ayrışır.
   - Foto yoksa baş harf, OKUNUR kontrast (koyu zemin+altın harf ya da tersi).
3. **KİMLİK BLOĞU (avatarın sağında/altında, banner'ın ALTINDA):**
   - Playfair büyük ad + "Doğrulanmış" rozeti YANINDA (çakışmadan, hizalı).
   - Altında ünvan · şirket · konum (ikincil renk).
   - Altında uzmanlık/tier rozet chip'leri.
4. **STAT KARTLARI (kimlik bloğunun altında, yatay sıra):**
   - Aktif Portföy / Uzmanlık Bölgesi (+ veri varsa takipçi vb; YOKSA ekleme).
   - Her biri ikon + LABEL (küçük, büyük harf) + büyük sayı. Eşit genişlik grid.
5. **ANA İÇERİK (2 kolon):**
   - SOL (geniş): sekmeler (Portföyleri / Hakkında) + altında portföy kart grid'i
     (mevcut teaser-card; 2-3 kolon).
   - SAĞ (dar, ~320px): "İletişim Bilgileri" kartı (telefon/e-posta/WhatsApp/ofis).
     Veri yoksa "paylaşılmamış" ama kart yine düzgün dursun, boşlukta SALLANMASIN
     (sol içerikle ÜSTTEN hizalı başlasın).

## KRİTİK DÜZELTMELER (şu anki bug'lar)
- Banner artık DÜZ BOŞ KUTU OLMAYACAK — dolu görsel/zengin gradient.
- Avatar banner'a TAŞACAK (şu an altında ayrı/kesik duruyor) — overlap şart.
- Ad + rozet ÇAKIŞMAYACAK — yan yana hizalı, banner'ın altında.
- Sağ iletişim kartı sol içerikle HİZALI başlayacak (şu an boşlukta yüzüyor).
- Hem /v/$username (public) hem in-app profil aynı yapı. dark+light ikisi de.

## PALET (D35)
Navy zemin + altın aksan. Banner gradient navy→altın. Avatar ring bu-bg.
Playfair başlık, Inter gövde. Mevcut token'ları kullan (yeni sabit renk YOK).
