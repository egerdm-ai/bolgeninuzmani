# KAPSAM HARİTASI — Bölgenin Uzmanı
> Nerede olduğumuz + neyin MVP, neyin sonraki faz olduğu. Lovable ekranları
> (keşfet+harita, detay talepleri, profil) bilgi mimarisi referansı; bazı bölümler
> ileri faz "vizyon" (mock) — onları layout'ta yer tutarız ama gerçek davranış
> kararlarımıza (D13-D42) göre yaparız.

## ✅ FONKSİYONEL OLARAK BİTTİ (canlı, D13-güvenli)
- Auth + profil + rol + doğrulama kapısı
- Portföy CRUD (teaser/locked ayrımı, foto görünürlüğü, belgeler, attribute registry kategori-bazlı)
- Portföy modu (controlled / call_only), ref_no (BU-xxxxx), kilitli şeffaflık (etiket+foto adedi)
- Public teaser /p/$slug + WhatsApp paylaşım + /v/$username profil + agent portfolios
- Keşfet (liste/filtre/arama — HARİTA YOK)
- Kontrollü erişim motoru: Detay Talebi → onay/red (+cevap mesajı) → grant → kilitli açılma
- Performans (görsel optimizasyon), marka temizliği, tasarım yönü seçimi (D35 navy+altın)

## 🎨 SIRADA: TASARIM TURU (fonksiyonel core + UX işleri bitince)
Lovable layout referansı + D35 palet + D42. Sayfa sayfa:
portföy detay → profil → keşfet → dashboard → landing.
4 sayfanın bilgi mimarisi Lovable'dan belli (detay/profil/keşfet ss + spec).

## 🔧 TASARIM ÖNCESİ KALAN UX (küçük, net)
- 3D kategori-bazlı wizard alanları · 3E keşfet kartında emlakçı · 3F foto inline yönetimi
  (DURUM: çalışıyor, Ege test etti — ✅ bitmiş sayılır)

## 🔜 MVP'Yİ TAMAMLAYAN (tasarım sonrası, deploy öncesi)
- Admin doğrulama ekranı (SQL yerine UI)
- Resend e-posta (başvuru + talep bildirimi)
- Dinamik OG (paylaşım önizleme)
- Deploy: Vercel + bolgeninuzmani.com + Supabase Pro

## 🗺️ SONRAKİ FAZ — "VİZYON" ÖZELLİKLERİ (Lovable'da mock görünüyor, GERÇEK DEĞİL)
Her biri AYRI bir özellik turu (araştırma → karar → migration → kod → tasarım):
1. **HARİTA** — Keşfet + portföy detay + profilde. Yaklaşık pin'ler (D30, asla exact).
   MapLibre (D3). Orta-büyük iş. Keşfet'in "liste+harita" görünümü buna bağlı.
2. **ARAYIŞ** (talep ilanı) — emlakçı "şunu arıyorum" kaydı (bölge/tip/bütçe/oda).
   Yeni tablo + RLS + CRUD + liste. Eşleşmenin önkoşulu.
3. **EŞLEŞME** — Arayış ↔ Portföy otomatik eşleştirme + bildirim. Arayış'a bağımlı.
   Eşleştirme mantığı (kurallar/skor) + bildirim sistemi.
4. **AI ASİSTAN** — Anthropic (D2). Portföy açıklama yazımı, arama yardımı, eşleşme özeti.
   En son; diğerleri oturunca.
5. Destekleyenler: Bildirimler (gerçek), Takip Et, Bölgeler dizini, Profil analitiği,
   Piyasa Bağlamı, AI ile Portföy Oluştur.

## SIRA ÖNERİSİ (bağımlılığa göre)
Tasarım turu → MVP tamamlama (admin/email/OG) → DEPLOY (gerçek kullanıcı!) →
sonra vizyon: HARİTA → ARAYIŞ → EŞLEŞME → (Bildirim/Takip) → AI.
Gerekçe: deploy'dan sonra gerçek emlakçı geri bildirimi gelir; vizyon özelliklerini
o geri bildirime göre önceliklendirmek, hepsini önden yapmaktan iyidir.
