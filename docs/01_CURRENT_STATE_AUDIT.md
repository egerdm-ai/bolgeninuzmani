# Current State Audit — Loveable → Claude Geçişi

## Şu an var
- Dark luxury VAULT UI scaffold.
- Dashboard AppShell + kompakt sidebar.
- Keşfet grubu: Portföyler, Bölgeler, Profesyoneller, Kaydedilenler.
- Portföylerim, Arayışlar, Arayışlarım, Eşleşmeler, Detay Talepleri, Bildirimler, VAULT Asistan gibi ana route'lar mock olarak tasarlandı.
- Landing page v2 ürün odaklı yeniden kuruldu: hero, problem, nasıl çalışır, özellikler, VAULT Asistan, profesyonel ağ, Share Studio, üyelik, başvuru, SSS.
- Profesyoneller sayfası ve profil detayları gelişti; portrait, cover, uzmanlık bölgeleri, portföy kataloğu, arayışlar tab'ı gibi yapılar var.
- Search deneyimi Airbnb benzeri split layout + filtre modalı yönüne taşındı.
- Mock data ve local state ile takip, favori, bölge watch, bildirim okundu, request status gibi etkileşimler çalışıyor.

## Şu an yok / mock-only
- Supabase backend bağlantısı yok.
- Auth, profile persistence, RLS yok.
- Gerçek portfolio CRUD, media upload, document storage yok.
- Gerçek matching engine yok.
- Gerçek AI import/search/PDF generation yok.
- Gerçek notification delivery yok.
- Gerçek PDF export ve signed URL yok.
- Jira/Claude/codebase audit henüz yapılmadı.

## Riskler
- UI çok genişledi; route/component inventory kontrol edilmezse dead button ve duplicate component oluşabilir.
- Data model yanlış kurulursa arama ve eşleşme motoru ileride yamalı olur.
- RLS ve access model baştan iyi kurulmazsa gizli bilgi kontrolü riskli olur.
- Loveable-generated code component olarak dağınık olabilir; Claude ilk işi audit/refactor olmalı.
