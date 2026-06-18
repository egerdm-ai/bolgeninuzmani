# VAULT Master Canvas

## Tek cümlelik ürün tanımı
VAULT, doğrulanmış emlak profesyonellerinin kapalı luxury portföyleri kontrollü şekilde paylaştığı, harita üzerinden keşfettiği, müşteri arayışlarıyla AI destekli eşleştirdiği ve PDF/WhatsApp/link ile profesyonel sunuma dönüştürdüğü private real estate network'tür.

## Ana value proposition
- WhatsApp gruplarındaki dağınık kapalı portföy akışını düzenli, aranabilir ve kontrollü bir network'e taşır.
- Portföy, arayış ve bölge uzmanı üçgenini eşleştirir.
- Gizli bilgileri request-access modeliyle korur.
- Emlakçının elindeki portföyü profesyonel vitrine, PDF'e ve paylaşılabilir linke dönüştürür.
- Yeni portföy/arayış/bölge aktivitelerinde bildirim ve eşleşme üretir.

## Ürünün 5 motoru
1. **Portföy Motoru** — oluşturma, yönetim, gizlilik, medya, belge, yayınlama.
2. **Arayış Motoru** — müşteriler için kaydedilen arayışlar, notification, edit, eşleşme.
3. **Network Arayışları** — diğer profesyonellerin alıcı taleplerini keşfetme.
4. **Eşleşme Motoru** — portföy ↔ arayış ↔ bölge uzmanı match score + açıklama.
5. **Share/PDF Motoru** — WhatsApp mesajı, link, teaser PDF, full PDF, analytics.

## Ana route grupları
- Public: Landing, public portfolio `/p/[slug]`, public professional `/v/[username]`, application.
- Dashboard: Ana sayfa, Keşfet, Portföylerim, Arayışlarım, Eşleşmeler, Detay Talepleri, VAULT Asistan, Bildirimler.
- Keşfet altı: Portföyler, Bölgeler, Profesyoneller, Arayışlar, Kaydedilenler.

## En önemli kararlar
- Ana kelime: **Portföy**. “İlan” UI içinde mümkün olduğunca kullanılmayacak; landing’de “kapalı ilan” kavramı açıklayıcı olarak geçebilir.
- AI ana adı: **VAULT Asistan**. “AI Concierge” terk edildi.
- Arayış ayrımı:
  - **Arayışlar** = network/discovery, başkalarının talepleri.
  - **Arayışlarım** = kullanıcının kendi müşterileri için kaydettiği arayışlar.
- Search primary: **Map-first** ama Airbnb tarzı split/list + harita + filtre modalı.
- MVP’de Trust Score ve References yok. Bölge Uzmanı badge'i var.
- Messaging full chat MVP dışı; Detay Talebi/approval inbox MVP içinde.

## Dosya rehberi
- Product/strategy: `docs/01_*` to `docs/08_*`
- UI/flows: `docs/09_*` to `docs/18_*`
- Tech/data/AI: `docs/19_*` to `docs/27_*`
- Claude/Jira: `docs/28_*` to `docs/35_*`, `jira/`, `prompts/`, `agents/`, `skills/`
