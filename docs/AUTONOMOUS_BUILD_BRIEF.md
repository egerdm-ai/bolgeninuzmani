# OTONOM YAPIM BRIEF'İ — Lovable'ın tam hali + backend bağlama (AI hariç)
> Ege uzun süre yok. Claude SONUNA KADAR otonom gider, soru SORMAZ, durmadan
> ilerler. Hedef: Lovable'daki TÜM sayfalar (AI/asistan HARİÇ) gerçek tasarımıyla
> + gerçek backend'e bağlı. Migration gereken yerlerde kod yazılır ama TASLAK
> kalır (Ege dö-nünce push eder). En kötü ihtimalde bu commit'e dönülür.

## ⛔ MUTLAK SINIRLAR (asla ihlal etme)
1. **`supabase db push` / MCP apply YOK.** Migration'ları yaz, dosyaya koy, ama
   ASLA uygulama. Ege dö-nünce kendisi push eder.
2. **DECISIONS_LOCKED.md'yi DEĞİŞTİRME.** Yeni karar gerekiyorsa FUTURE_NOTES'a yaz.
3. **D13 KUTSAL:** kilitli/hassas veri (exact_address, exact_lat/lng, malik_info,
   private_*, documents, arsa ada/parsel) ASLA teaser/public/anon/grant'siz yola
   sızmaz. Yeni tablolarda da locked veri AYRI tabloda + kendi RLS'i.
4. **Anon/public veri YALNIZCA security-definer RPC + açık allow-list ile.** Base
   tabloya anon RLS YOK. Yeni public yüzey gerekiyorsa RPC yaz (taslak).
5. Her yeni migration için: RLS enabled + forced, search_path pinli, idempotent,
   yazma yalnızca RPC ile (gerekiyorsa), allow-list açık. Dosyaya "REVIEW GEREKLİ"
   başlığı + ne yaptığının net açıklaması + güvenlik gerekçesi yaz.

## ✅ ÇALIŞMA DİSİPLİNİ
- Her sayfa/özellik AYRI commit. typecheck+build+lint yeşil tutulur.
- Her turda `npm run test:leak` + `test:attrs` çalıştır; KIRMIZIYSA DUR, düzelt,
  devam etme. Yeni veri yüzeyini leak testine EKLE.
- Lovable bileşenlerini SIFIRDAN YAZMA — `src/components/vault/*` + `landing/*`
  zaten duruyor, onları KULLAN. Profil pilotundaki kalıbı izle: bileşen + adapter
  (gerçek veri → bileşenin beklediği şekil) + vizyon alanlarını uydurma (boş bırak).
- Mock veriyi gerçek `lib/data` ile değiştir; "nereye istek/nereden çekme"yi bağla.
- İlerlemeyi `docs/AUTONOMOUS_PROGRESS.md`'ye yaz (her sayfa: durum, commit, ne
  bağlandı, hangi migration taslağı, REVIEW notu).

## 📋 YAPILACAKLAR (öncelik sırası — sonuna kadar git)

### A. MEVCUT TABLOLARLA HEMEN BAĞLANABİLENLER (migration YOK, en güvenli — önce bunlar)
1. **Portföy detay** (`portfolio-detail-view` + galeri/owner/locked-panel/key-facts)
   → orijinal Lovable bileşenine geri bağla, gerçek veri (get_public_portfolio +
   has_portfolio_access), D13 split. Profil pilotu kalıbı. call_only + kilitli
   şeffaflık + ref_no + response_message KORUNSUN.
2. **Keşfet/arama** (`search-result-card` + airbnb-style search UI) → gerçek
   listNetworkPortfolios + filtreler + mini emlakçı. Harita için (madde B-harita)
   yer bırak ama veri yokken sadece liste.
3. **Detay Talepleri** (Lovable rich inbox: KPI + liste + sağ detay + timeline) →
   gerçek detail_requests verisi (gelen/gönderdiğim, approve/reject + response_message).
   Vizyon KPI (ort. yanıt vb.) gerçek hesaplanabiliyorsa hesapla, yoksa gizle.
4. **Landing** → Lovable v2 landing + Üyelik Başvurusu formu gerçek applications insert.
5. **Profil** → zaten pilotta yapıldı; tutarlı kalsın.
6. **Dashboard ana sayfa** → gerçek özet (kendi portföy sayısı, bekleyen talep vb.).

### B. YENİ TABLO/MIGRATION GEREKENLER (kod + TASLAK migration, PUSH YOK)
7. **ARAYIŞ (talep ilanı)** — emlakçı "şunu arıyorum" (bölge/tip/bütçe/oda).
   - Yeni tablo `searches` + RLS (sahibi yaz/sil; ağ üyesi okur — public DEĞİL,
     üye-only). Gerekiyorsa public-güvenli alan ayrımı.
   - CRUD data layer + Lovable arayış sayfaları (my-searches, arayış kartları) bağla.
   - Migration TASLAK + REVIEW notu.
8. **EŞLEŞME** — Arayış ↔ Portföy eşleştirme.
   - Eşleştirme mantığı (bölge+tip+bütçe+oda kesişimi). Tablo mu view mu / RPC mi —
     en temiz olanı seç, gerekçesini yaz. Locked veri eşleşmede sızmaz (sadece teaser
     alanlarla eşleştir).
   - Lovable eşleşme sayfaları (matches) bağla. Migration TASLAK.
9. **BÖLGELER** — bölge dizini (Lovable region-card + bölge sayfaları).
   - Bölge bazında portföy sayımı — mevcut portfolios'tan türetilebilir mi (view/RPC)
     yoksa yeni tablo mu? En hafif yolu seç. Migration gerekiyorsa TASLAK.
10. **HARİTA** — Keşfet + portföy detay + bölgede. MapLibre (D3). YALNIZCA yaklaşık
    pin (approx_lat/lng — D30); exact ASLA. Migration genelde gerekmez (approx zaten
    var). Harita bileşenini bağla, exact sızıntısı testi.
11. **Destekleyenler** (Lovable'da mock olanlar): Bildirimler, Takip Et, Kaydet/
    Favoriler. Bunlar yeni tablo ister (notifications/follows/saved). Her biri kod +
    TASLAK migration + REVIEW notu. Gerçek davranış bağla.

### ⛔ HARİÇ: AI / Asistan
"VAULT Asistan" / "AI ile Portföy Oluştur" YAPMA. Lovable'da mock; öyle kalsın ya da
"yakında" stub. Ege sonra ayrı ele alacak.

## 🔚 BİTİRİNCE
- `docs/AUTONOMOUS_PROGRESS.md`: her sayfa durum + commit + bağlanan veri + migration
  taslakları listesi (hangi dosya, ne yapıyor, neden REVIEW gerekli).
- `docs/RETURN_CHECKLIST.md`: Ege dö-nünce sırayla ne yapacak — hangi migration'ları
  hangi sırayla inceleyip push edecek, type regen, test komutları.
- Tüm migration taslakları `supabase/migrations/`'da ama UYGULANMAMIŞ.
- Son test:leak + test:attrs sonuçları yeşil + her yeni veri yüzeyi leak'e dahil.
