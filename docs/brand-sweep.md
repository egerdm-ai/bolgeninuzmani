# Brand Sweep Inventory — Bölgenin Uzmanı

> Slice 0 / PARÇA A çıktısı. **Sadece envanter — hiçbir metin değiştirilmedi.**
> Kapsam (D26): yalnızca **copy / wordmark / title / OG metni**. REDESIGN YOK,
> layout/stil değişmez. `vault.app` → placeholder **`bolgeninuzmani.com`** (D16).
> `components/vault/` klasör adı KORUNUR (D17) — kapsam dışı.

## Değiştirme kuralları (öneri)

| Geçen ifade                       | Önerilen                | Not                                                                                |
| --------------------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| `VAULT` / `Vault` (wordmark/logo) | **Bölgenin Uzmanı**     | Görünür logo metni                                                                 |
| `VAULT Asistan`                   | **Asistan**             | D15: asistan ismi ertelendi, placeholder "Asistan" (Bölgenin Uzmanı Asistan DEĞİL) |
| `VAULT PRO`                       | **Bölgenin Uzmanı PRO** | Üyelik kartı etiketi — _karar gerekebilir, aşağıda işaretli_                       |
| `VAULT ağı`                       | **Bölgenin Uzmanı ağı** | Copy                                                                               |
| `VAULT Network` (mock company)    | **Bölgenin Uzmanı**     | Seed/mock veri                                                                     |
| `— VAULT` (title/OG suffix)       | **— Bölgenin Uzmanı**   |                                                                                    |
| `vault.app`                       | **bolgeninuzmani.com**  | D16 placeholder                                                                    |

---

## A. Kullanıcıya görünür — WORDMARK / LOGO (mutlaka değişir)

| Dosya:satır                                         | Mevcut                       | → Öneri         |
| --------------------------------------------------- | ---------------------------- | --------------- |
| `src/components/layout/sidebar.tsx:87`              | `Vault` (logo)               | Bölgenin Uzmanı |
| `src/routes/p.$slug.tsx:41`                         | `Vault` (public header logo) | Bölgenin Uzmanı |
| `src/routes/v.$username.tsx:40`                     | `Vault` (public header logo) | Bölgenin Uzmanı |
| `src/routes/dashboard.portfolios.$id.share.tsx:187` | `Vault` (share kartı logo)   | Bölgenin Uzmanı |

## B. Kullanıcıya görünür — TITLE / OG META

| Dosya:satır                     | Mevcut                                  | → Öneri                     |
| ------------------------------- | --------------------------------------- | --------------------------- |
| `src/routes/p.$slug.tsx:15`     | `… — VAULT` (title)                     | … — Bölgenin Uzmanı         |
| `src/routes/p.$slug.tsx:17`     | `VAULT Portföy` (og:title fallback)     | Bölgenin Uzmanı Portföy     |
| `src/routes/v.$username.tsx:15` | `… — VAULT` (title)                     | … — Bölgenin Uzmanı         |
| `src/routes/v.$username.tsx:17` | `VAULT Profesyonel` (og:title fallback) | Bölgenin Uzmanı Profesyonel |

> ⚠️ **B-ROOT (kapsam dışı ama ilgili):** `src/routes/__root.tsx:87,90,95` site
> başlığı **"Emsalsiz — Özel Lüks Gayrimenkul Ağı"**. Bu "VAULT" değil ama eski
> marka. Brand kararına göre "Bölgenin Uzmanı" olmalı. Senin onayını istiyorum —
> VAULT sweep'ine dahil edeyim mi, yoksa ayrı mı bırakayım? (Lovable temizliği
> L4 ile de örtüşüyor.)

## C. Kullanıcıya görünür — COPY (metin)

| Dosya:satır                                          | Mevcut (özet)                          | → Öneri                                  |
| ---------------------------------------------------- | -------------------------------------- | ---------------------------------------- |
| `src/components/layout/sidebar.tsx:49`               | nav "VAULT Asistan"                    | Asistan                                  |
| `src/components/layout/sidebar.tsx:152`              | "VAULT PRO" kartı                      | Bölgenin Uzmanı PRO ⚠️                   |
| `src/components/landing/ai-assistant-preview.tsx:47` | "VAULT Asistan"                        | Asistan                                  |
| `src/routes/dashboard.index.tsx:81,147`              | "VAULT Asistan"                        | Asistan                                  |
| `src/routes/dashboard.assistant.tsx:99`              | "VAULT Asistan" (h1)                   | Asistan                                  |
| `src/routes/dashboard.my-searches.new.tsx:152`       | "VAULT uygun portföyleri… eşleştirsin" | Bölgenin Uzmanı …                        |
| `src/routes/dashboard.my-searches.new.tsx:346`       | "VAULT Asistan Özeti"                  | Asistan Özeti                            |
| `src/routes/dashboard.searches.$id.tsx:113,359`      | "VAULT Asistan Önerisi/…"              | Asistan …                                |
| `src/routes/dashboard.searches.index.tsx:117`        | "VAULT ağı içindeki…"                  | Bölgenin Uzmanı ağı …                    |
| `src/routes/dashboard.professionals.index.tsx:88`    | "VAULT ağı içindeki…"                  | Bölgenin Uzmanı ağı …                    |
| `src/routes/dashboard.profile.tsx:80`                | "… VAULT tarafından doğrulandı."       | … Bölgenin Uzmanı tarafından doğrulandı. |
| `src/routes/dashboard.search.tsx:236`                | "VAULT Asistan'a Sor"                  | Asistan'a Sor                            |

## D. Kullanıcıya görünür — SHARE URL / WhatsApp copy (D16)

| Dosya:satır                                              | Mevcut                                    | → Öneri                                |
| -------------------------------------------------------- | ----------------------------------------- | -------------------------------------- |
| `src/routes/dashboard.portfolios.$id.share.tsx:54`       | `https://vault.app/p/${slug}`             | `https://bolgeninuzmani.com/p/${slug}` |
| `src/routes/dashboard.portfolios.$id.share.tsx:55`       | WhatsApp mesajı "🏛️ VAULT — Özel Portföy" | "🏛️ Bölgenin Uzmanı — Özel Portföy"    |
| `src/routes/dashboard.portfolios.$id.share.tsx:227`      | "vault.app" rozet metni                   | bolgeninuzmani.com                     |
| `src/components/landing/share-studio-preview.tsx:79,136` | "vault.app/p/yalikavak-villa"             | bolgeninuzmani.com/p/…                 |
| `src/components/landing/step-showcase.tsx:200,216`       | "… vault.app/p/yalikavak-villa"           | … bolgeninuzmani.com/p/…               |

## E. Mock / seed veri

| Dosya:satır               | Mevcut                         | → Öneri                    |
| ------------------------- | ------------------------------ | -------------------------- |
| `src/lib/mock/data.ts:85` | `companyName: "VAULT Network"` | "Bölgenin Uzmanı"          |
| `src/lib/mock/data.ts:95` | bio: "… VAULT ağında …"        | … Bölgenin Uzmanı ağında … |

## F. Kod yorumları (kozmetik, opsiyonel — build'e dokunmaz)

| Dosya:satır                          | Mevcut                                    |
| ------------------------------------ | ----------------------------------------- |
| `src/lib/taxonomy.ts:2`              | `// VAULT Property Taxonomy …`            |
| `src/styles.css:8,46,73`             | `/* VAULT … */` tasarım sistemi yorumları |
| `src/routes/dashboard.index.tsx:142` | `{/* VAULT Asistan CTA */}`               |

> NOT (KORU, değiştirme): `CLAUDE.md:16`, `SETUP.md:82`, `docs/*` içindeki "VAULT"
> kelimesi marka kararını/geçişini AÇIKLIYOR (retire talimatı). Bunlar kapsam dışı.

---

## Karar gereken noktalar (uygulamadan önce onayını istiyorum)

1. **B-ROOT / "Emsalsiz" başlığı** — VAULT sweep'ine dahil edeyim mi? (`__root.tsx` title/OG)
2. **"VAULT PRO"** → "Bölgenin Uzmanı PRO" mu, sadece "PRO" mu, yoksa şimdilik dokunma mı?
3. **"VAULT Asistan" → "Asistan"** kararı (D15) doğru mu? (Bölgenin Uzmanı Asistan değil.)
4. **Kod yorumları (F)** dahil edilsin mi, yoksa sadece kullanıcıya görünür metin mi?

## Doğrulama (PARÇA B sonrası)

- `grep -rin "vault" src` → yalnızca `components/vault/` yolları + F'deki onaylı
  yorumlar kalmalı.
- `tsc --noEmit` + `vite build` yeşil.
- UI görünümü değişmedi (sadece metin) — gerekirse screenshot D24'e göre sweep SONRASI.
