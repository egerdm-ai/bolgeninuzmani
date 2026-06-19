# DÜZELTME LİSTESİ — Chrome QA raporu + Ege bulguları (öncelik sırası)

## 🔴 P0 — KIRIK / BOZUK LAYOUT (önce bunlar)
1. **PROFİL SAYFASI LAYOUT BOZUK** (Ege'nin en büyük bulgusu + rapor #2,#5,#8) — /v/$username:
   - Banner boş-state çirkin/bozuk: foto yokken düz boş kutu; avatar adın arkasında kalıyor,
     hiyerarşi dağılmış. Banner'a gradient/desen boş-state + "kapak ekle" hissi (kendi profilinde).
   - Avatar placeholder İKİ MODDA da görünmez (light: beyaz/beyaz, dark: navy/navy).
     → avatar bg tema-uyumlu token (light gri, dark açık-navy) + ring-2 ring-background (banner üstünde ayrışsın).
   - Ad + rozet + ünvan banner ile çakışıyor → düzgün overlap/offset, ad bannerın ALTINDA net dursun.
   - İletişim kartı sağda boşlukta sallanıyor → grid hizası düzelt (stat/sekme ile hizalı).
   - GENEL: Lovable profil (Image 3) yapısına yaklaştır — banner+avatar overlap temiz, stat satırı,
     sekmeler, sağ iletişim kartı düzgün kolon. "Çok kötü ve bug'lı" hissi gitsin.

## 🔴 P1 — LIGHT MOD GÖRÜNÜRLÜK (token eksik)
2. **Form input kenarlıkları görünmez** (light) — portföy oluştur/düzenle (rapor #3):
   border-input token light'ta çok açık → daha koyu değer (görünür kenarlık).
3. **Foto drop-zone kenarlığı görünmez** (light) (rapor #6): dashed border görünür token'a.
4. **Radio (Kapalı Portföy) konturu görünmez** (light) (rapor #7): seçilmemiş radio çemberi görünür olsun.
5. **Dashboard hero banner light'ta yıkanıyor** (rapor #4): koyu-için-tasarlanmış görsel light'ta
   kayboluyor → overlay/brightness token'a bağla (light'ta da premium dursun).

## 🟡 P2 — KONTRAST / CİLA
6. Placeholder metin kontrastı düşük (dark, form) (rapor #10).
7. /p header tema-toggle ikonu light'ta soluk/sabit renk (rapor sayfa2).
8. Konum "Harita yakında" kutusu light'ta sayfayla kaynaşıyor → border/shadow (rapor #1 light).
9. Kart hover state'i light'ta zayıf (keşfet/özellikler) → shadow-md→lg hover.

## ✅ DOĞRULANAN — düzeltme GEREKMEZ
- Kilitli veri sızıntısı: /p public TEMİZ (rapor: EN YÜKSEK öncelik, GEÇTİ).
- Sağ emlakçı kartı: VAR ve çalışıyor (Image 2 /p'de "Portföyü Paylaşan" kartı net).
  Chrome giriş yapamadığı için göremedi — yanlış alarm. Dokunma.
- Keşfet sayfası: en sağlam sayfa, token geçişi temiz.

## NOT (içerik, kod değil)
- Banner/avatar boş çünkü Taylan profilinde foto yok — ama tasarım boş-state'i yönetmeli (P0-1'de).
- Harita gerçek değil (vizyon/sonraki faz) — placeholder kalsın, sadece light görünürlüğü (P2-8).
