# Lovable Cleanup Inventory — Bölgenin Uzmanı (D25)

> Slice 0 / PARÇA A çıktısı. **Sadece envanter — hiçbir şey silinmedi.** Her kalem
> build'i bozma riskine göre sınıflandırıldı. Silme yalnızca insan onayından sonra
> (PARÇA C). Not: `index.html` yok — TanStack Start head'i `src/routes/__root.tsx`
> içinde. README de yok.

## Risk sınıflandırması özeti

| Sınıf     | Anlam                                               | Aksiyon                                                                |
| --------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| 🟢 SAFE   | Build'e dokunmaz (metadata/yorum/metin)             | PARÇA C'de güvenle kaldır                                              |
| 🟡 MEDIUM | Kod import ediliyor ama no-op / kolay değiştirilir  | Kaldır + typecheck/build doğrula                                       |
| 🔴 HIGH   | **Build load-bearing** — kaldırmak build göçü demek | **🔴 = ayrı slice, ertelendi** ("build de-Lovable" slice'ı, ayrı onay) |

---

## 🔴 HIGH — Build'in temeli (Slice 0 kapsamı DIŞI, ayrı slice öner)

### L1 — `@lovable.dev/vite-tanstack-config` (tüm build config'i)

- `package.json:70` → `"@lovable.dev/vite-tanstack-config": "2.4.0"` (devDependency)
- `vite.config.ts:1,7` → `import { defineConfig } from "@lovable.dev/vite-tanstack-config"`
- Bu paket şunları **bundle ediyor** (vite.config.ts:1-5 yorumu): `tanstackStart`,
  `viteReact`, `tailwindcss`, `tsConfigPaths`, `nitro`, `componentTagger` (dev-only
  — D25'teki "lovable-tagger" budur, ayrı paket değil), `VITE_*` env injection, `@`
  path alias, React/TanStack dedupe, error logger plugin'leri, sandbox tespiti.
- **Risk:** 🔴 Kaldırmak = tüm Vite/Nitro/Tailwind/alias kurulumunu elle yeniden
  yazmak. Tek satır değişiklik build'i tamamen kırar.
- **Öneri:** Slice 0'da DOKUNMA. Bunu kendi adımı olan ayrı bir "build de-Lovable"
  slice'ı yap; orada vanilla `@tanstack/react-start` + plugin'leri elle kur,
  her adımda `tsc --noEmit` + `vite build` ile doğrula. Onayını ayrıca isteyeceğim.

### L2 — `bunfig.toml` supply-chain excludes

- `bunfig.toml:6` → `minimumReleaseAgeExcludes = ["@lovable.dev/vite-tanstack-config", "@lovable.dev/mcp-js", "@lovable.dev/vite-plugin-dev-server-bridge", "@lovable.dev/vite-plugin-hmr-gate"]`
- **Risk:** 🔴 L1 ile bağlı. L1 kaldırılmadan bu satır temizlenemez (yoksa paket
  24h guard'a takılabilir). L1 ile aynı slice'ta ele alınmalı.

---

## 🟡 MEDIUM — İçe aktarılan ama no-op / kolay değiştirilebilir kod

### L3 — `src/lib/lovable-error-reporting.ts`

- Dosyanın tamamı Lovable'a özel: `window.__lovableEvents?.captureException` çağırır.
- İmport/kullanım: `src/routes/__root.tsx:13` (import) ve `:48`
  (`reportLovableError(...)` ErrorComponent içinde).
- **Davranış:** `window.__lovableEvents` yalnızca Lovable preview ortamında var;
  prod/local'de `undefined` → fonksiyon zaten **no-op** (guard'lı).
- **Risk:** 🟡 Düşük-orta. Dosyayı silmek için `__root.tsx`'teki import + çağrıyı
  kaldırmak (veya generic bir `console.error`/logger ile değiştirmek) gerekir.
  Sonra typecheck şart. Build'i etkilemez.
- **Öneri:** `lovable-error-reporting.ts` sil; `__root.tsx` ErrorComponent'te
  satır 13 import'unu kaldır, satır 48'i sil (zaten `console.error(error)` satır 45'te var).

> NOT — Bunlar Lovable DEĞİL, KARIŞTIRMA (silme): `src/lib/error-capture.ts` ve
> `src/lib/error-page.ts` generic SSR hata yakalama (server.ts/start.ts kullanıyor),
> Lovable'a özel değil. **Korunacak.**

---

## 🟢 SAFE — Metadata / metin / yorum (build'e dokunmaz)

### L4 — `__root.tsx` head metadata (Lovable izleri)

- `:89` → `{ name: "author", content: "Lovable" }` → kaldır veya "Bölgenin Uzmanı".
- `:94` → `{ name: "twitter:site", content: "@Lovable" }` → kaldır veya doğru handle.
- `:97` `og:image` ve `:98` `twitter:image` → `https://pub-...lovable.app-...png`
  (Lovable preview R2 URL'i; canlıda kırık/yanlış önizleme). → kaldır veya gerçek
  görselle değiştir.
- **Risk:** 🟢 Saf metadata.
- ⚠️ Ayrıca `:87,90,95` başlık **"Emsalsiz"** marka adını içeriyor — bu VAULT
  değil ama yine yanlış marka (bkz. `brand-sweep.md` B-ROOT). Beraber ele alınabilir.

### L5 — `.lovable/` dizini (proje metadata'sı)

- `.lovable/project.json` (template metadata), `.lovable/plan.md` (eski VAULT scaffold planı).
- Hiçbir kod import etmiyor; build kullanmıyor.
- **Risk:** 🟢 Güvenle silinir.

### L6 — Kod yorumları

- `src/components/landing/application-form.tsx:18` → `// TODO[backend]: ... / Lovable Cloud.`
  → yeniden ifade et (Supabase server function).
- **Risk:** 🟢 Yorum.

### L7 — Docs içi referanslar (opsiyonel, düşük öncelik)

Build/koda dokunmaz, sadece doküman metni:

- `SETUP.md:20,29`, `docs/search-filter-model.md:83`,
  `docs/20_BACKEND_INFRASTRUCTURE_PLAN.md:6`, `docs/25_CLAUDE_CODE_SETUP.md:5`,
  `docs/vault-product-audit.md:58,147,242,243,258`,
  `docs/public-application-flow.md:36`, `docs/23_SCREENSHOT_CAPTURE_PLAN.md:4`,
  `docs/09_PAGE_INVENTORY_SCREEN_REPORT.md:4`,
  `docs/24_CURRENT_SCREENSHOT_INVENTORY.md:5-20` (Lovable screenshot yolları),
  `docs/34_LOVABLE_TO_CLAUDE_HANDOFF_CHECKLIST.md` (dosya adı), `docs/prompts/*`.
- `docs/DECISIONS_LOCKED.md:100-107` Lovable'dan **bahsediyor** (D25 kararı) — KORU.
- **Risk:** 🟢 Doküman. Öneri: bu temizliği sona bırak; tarihsel docs'a dokunmak şart değil.

---

## Önerilen uygulama sırası (PARÇA C, onay sonrası)

1. 🟢 L5 `.lovable/` sil · L4 head metadata temizle · L6 yorum · (L7 opsiyonel).
2. 🟡 L3 `lovable-error-reporting.ts` sil + `__root.tsx` import/çağrı kaldır →
   **`tsc --noEmit` + `vite build` doğrula**.
3. 🔴 L1/L2 **YAPMA** — ayrı "build de-Lovable" slice'ına bırak, ayrı onay.

**Sonuç:** Slice 0'da Lovable temizliği yalnızca 🟢 + 🟡 kalemleri kapsar. Build'in
bağlı olduğu 🔴 paket dokunulmadan kalır.
