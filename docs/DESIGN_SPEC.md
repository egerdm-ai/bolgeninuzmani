TAM TASARIM SPEC

**Bölgenin Uzmanı · Yön 3: Navy + Altın · Dark/Light Toggle**

---

## BÖLÜM 1 — TASARIM TOKEN SİSTEMİ

### 1.1 CSS Değişkenleri (globals.css)

```css
/* ============================================================
   BÖLGENIN UZMANI — Semantik Token Sistemi
   Dark mod varsayılan, .light class ile override
   ============================================================ */

:root {
  /* ── ZEMIN ─────────────────────────────────────── */
  --bu-bg:          #0F1523;   /* sayfa zemini */
  --bu-bg-subtle:   #0B1020;   /* sidebar, modal overlay altı */
  --bu-card:        #162035;   /* kart, panel */
  --bu-card-raised: #1C2840;   /* hover kart, elevated */
  --bu-overlay:     rgba(15,21,35,0.85); /* lightbox, modal backdrop */

  /* ── SINIR ─────────────────────────────────────── */
  --bu-border:      #243150;
  --bu-border-subtle: #1C2840;
  --bu-border-gold: #C9A84C40; /* altın kenarlık, %25 opasite */

  /* ── METİN ──────────────────────────────────────── */
  --bu-text:        #EEF2FF;   /* birincil metin */
  --bu-text-2:      #8899BB;   /* ikincil / placeholder */
  --bu-text-3:      #566480;   /* disabled / çok soluk */
  --bu-text-inv:    #0F1523;   /* açık bg üstünde koyu metin */

  /* ── MARKA RENK ─────────────────────────────────── */
  --bu-gold:        #C9A84C;   /* altın vurgu */
  --bu-gold-dim:    #A8862E;   /* hover-state altın */
  --bu-gold-muted:  #C9A84C20; /* chip/badge bg */
  --bu-gold-border: #C9A84C50; /* chip/badge border */

  /* ── AKSİYON ─────────────────────────────────────── */
  --bu-action:      #3B82F6;   /* primary CTA buton */
  --bu-action-hover:#2563EB;
  --bu-action-muted:#3B82F615; /* subtle action bg */

  /* ── DURUM RENKLERİ ─────────────────────────────── */
  --bu-ok:          #10B981;   /* onaylı / aktif */
  --bu-ok-muted:    #10B98120;
  --bu-danger:      #EF4444;   /* reddedildi / hata */
  --bu-danger-muted:#EF444420;
  --bu-warning:     #F59E0B;   /* beklemede / taslak */
  --bu-warning-muted:#F59E0B20;

  /* ── LOCK/KİLİT PANEL ───────────────────────────── */
  --bu-lock-bg:     #0B1020;   /* kilitli bölüm koyu panel */
  --bu-lock-border: #243150;
  --bu-lock-glow:   #3B82F625; /* mavi parıltı */

  /* ── TİPOGRAFİ ──────────────────────────────────── */
  --font-display:   'Playfair Display', Georgia, serif;
  --font-body:      'Inter', system-ui, sans-serif;

  /* ── TİP ÖLÇEĞI ─────────────────────────────────── */
  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-md:   1.125rem;  /* 18px */
  --text-lg:   1.25rem;   /* 20px */
  --text-xl:   1.5rem;    /* 24px */
  --text-2xl:  1.875rem;  /* 30px */
  --text-3xl:  2.25rem;   /* 36px */
  --text-4xl:  3rem;      /* 48px — büyük başlık */
  --text-price:3.5rem;    /* 56px — fiyat özel */

  /* ── BOŞLUK SKALASI ──────────────────────────────── */
  --space-1:   0.25rem;   /* 4px */
  --space-2:   0.5rem;    /* 8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */

  /* ── RADIUS ──────────────────────────────────────── */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-2xl: 20px;
  --radius-full:9999px;

  /* ── GÖLGE ───────────────────────────────────────── */
  --shadow-card:    0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2);
  --shadow-raised:  0 4px 20px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);
  --shadow-gold:    0 0 20px rgba(201,168,76,0.15);
  --shadow-action:  0 4px 14px rgba(59,130,246,0.3);
  --shadow-lock:    0 0 40px rgba(59,130,246,0.08) inset;

  /* ── GALERI ──────────────────────────────────────── */
  --gallery-hero-h:  520px;  /* hero foto yükseklik */
  --gallery-thumb-h: 80px;   /* thumbnail yükseklik */

  /* ── SIDEBAR ─────────────────────────────────────── */
  --sidebar-w:    240px;
  --sidebar-w-collapsed: 64px;

  /* ── GEÇİŞ ───────────────────────────────────────── */
  --transition-base: 200ms ease-out;
  --transition-slow: 350ms ease-out;
}

/* ============================================================
   LIGHT MOD OVERRIDES
   <html class="light"> veya data-theme="light" ile aktif
   ============================================================ */
.light {
  --bu-bg:          #F4F6FB;
  --bu-bg-subtle:   #EAEFF8;
  --bu-card:        #FFFFFF;
  --bu-card-raised: #F0F4FA;
  --bu-overlay:     rgba(15,21,35,0.7);

  --bu-border:      #DCE3F0;
  --bu-border-subtle: #EBF0F8;
  --bu-border-gold: #A8862E40;

  --bu-text:        #0F1523;
  --bu-text-2:      #5B6B8C;
  --bu-text-3:      #9DAAC0;
  --bu-text-inv:    #EEF2FF;

  --bu-gold:        #A8862E;
  --bu-gold-dim:    #876C22;
  --bu-gold-muted:  #A8862E15;
  --bu-gold-border: #A8862E40;

  --bu-action:      #2563EB;
  --bu-action-hover:#1D4ED8;
  --bu-action-muted:#2563EB12;

  --bu-ok:          #0E9F6E;
  --bu-ok-muted:    #0E9F6E18;
  --bu-danger:      #DC2626;
  --bu-danger-muted:#DC262618;
  --bu-warning:     #D97706;
  --bu-warning-muted:#D9770618;

  --bu-lock-bg:     #0F1523;   /* ← light modda da koyu kalır (dramatik kontrast) */
  --bu-lock-border: #243150;
  --bu-lock-glow:   #3B82F620;

  --shadow-card:    0 1px 3px rgba(15,21,35,0.08), 0 4px 12px rgba(15,21,35,0.06);
  --shadow-raised:  0 4px 20px rgba(15,21,35,0.12), 0 1px 3px rgba(15,21,35,0.08);
  --shadow-gold:    0 0 20px rgba(168,134,46,0.12);
  --shadow-action:  0 4px 14px rgba(37,99,235,0.25);
  --shadow-lock:    0 0 40px rgba(59,130,246,0.06) inset;
}
```

### 1.2 Tailwind Config (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // 'dark' class html'de
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bu: {
          bg:          'var(--bu-bg)',
          'bg-subtle': 'var(--bu-bg-subtle)',
          card:        'var(--bu-card)',
          'card-raised':'var(--bu-card-raised)',
          border:      'var(--bu-border)',
          'border-subtle':'var(--bu-border-subtle)',
          'border-gold': 'var(--bu-border-gold)',
          text:        'var(--bu-text)',
          'text-2':    'var(--bu-text-2)',
          'text-3':    'var(--bu-text-3)',
          'text-inv':  'var(--bu-text-inv)',
          gold:        'var(--bu-gold)',
          'gold-dim':  'var(--bu-gold-dim)',
          'gold-muted':'var(--bu-gold-muted)',
          'gold-border':'var(--bu-gold-border)',
          action:      'var(--bu-action)',
          'action-hover':'var(--bu-action-hover)',
          'action-muted':'var(--bu-action-muted)',
          ok:          'var(--bu-ok)',
          'ok-muted':  'var(--bu-ok-muted)',
          danger:      'var(--bu-danger)',
          'danger-muted':'var(--bu-danger-muted)',
          warning:     'var(--bu-warning)',
          'warning-muted':'var(--bu-warning-muted)',
          'lock-bg':   'var(--bu-lock-bg)',
          'lock-border':'var(--bu-lock-border)',
          overlay:     'var(--bu-overlay)',
        },
      },
      fontFamily: {
        display: 'var(--font-display)',
        body:    'var(--font-body)',
      },
      fontSize: {
        'price': ['var(--text-price)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '4xl-bu': ['var(--text-4xl)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        'bu-sm': 'var(--radius-sm)',
        'bu-md': 'var(--radius-md)',
        'bu-lg': 'var(--radius-lg)',
        'bu-xl': 'var(--radius-xl)',
        'bu-2xl':'var(--radius-2xl)',
      },
      boxShadow: {
        'bu-card':   'var(--shadow-card)',
        'bu-raised': 'var(--shadow-raised)',
        'bu-gold':   'var(--shadow-gold)',
        'bu-action': 'var(--shadow-action)',
        'bu-lock':   'var(--shadow-lock)',
      },
      transitionDuration: {
        'bu': '200ms',
        'bu-slow': '350ms',
      },
    },
  },
  plugins: [],
}
export default config
```

### 1.3 Bileşen Stil Sözlüğü (component-tokens)

Bunları `src/lib/styles.ts` veya `cn()` helper'da sabit olarak kullanın:

```typescript
// src/lib/styles.ts
// Her string doğrudan className'de kullanılabilir

export const s = {
  /* ── KART ─────────────────────────────────────── */
  card:        'bg-bu-card border border-bu-border rounded-bu-lg shadow-bu-card',
  cardHover:   'hover:bg-bu-card-raised hover:shadow-bu-raised transition-all duration-bu',
  cardPadding: 'p-6',

  /* ── BUTON: PRIMARY (mavi) ──────────────────────── */
  btnPrimary: [
    'inline-flex items-center gap-2 px-5 py-2.5',
    'bg-bu-action hover:bg-bu-action-hover',
    'text-white font-medium text-sm',
    'rounded-bu-md shadow-bu-action',
    'transition-all duration-bu',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  /* ── BUTON: SECONDARY (kenarlıklı) ─────────────── */
  btnSecondary: [
    'inline-flex items-center gap-2 px-5 py-2.5',
    'bg-transparent border border-bu-border',
    'text-bu-text hover:bg-bu-card-raised',
    'font-medium text-sm rounded-bu-md',
    'transition-all duration-bu',
  ].join(' '),

  /* ── BUTON: GOLD ─────────────────────────────────── */
  btnGold: [
    'inline-flex items-center gap-2 px-5 py-2.5',
    'bg-bu-gold hover:bg-bu-gold-dim',
    'text-bu-text-inv font-semibold text-sm',
    'rounded-bu-md shadow-bu-gold',
    'transition-all duration-bu',
  ].join(' '),

  /* ── BUTON: GHOST ────────────────────────────────── */
  btnGhost: [
    'inline-flex items-center gap-2 px-4 py-2',
    'bg-transparent hover:bg-bu-card-raised',
    'text-bu-text-2 hover:text-bu-text',
    'text-sm rounded-bu-md',
    'transition-all duration-bu',
  ].join(' '),

  /* ── CHİP / HIZLI BİLGİ ─────────────────────────── */
  chip: [
    'inline-flex items-center gap-1.5 px-3 py-1.5',
    'bg-bu-card border border-bu-border',
    'rounded-bu-full text-sm text-bu-text-2',
  ].join(' '),
  chipGold: [
    'inline-flex items-center gap-1.5 px-3 py-1.5',
    'bg-bu-gold-muted border border-bu-gold-border',
    'rounded-bu-full text-sm text-bu-gold font-medium',
  ].join(' '),

  /* ── ROZET ───────────────────────────────────────── */
  badgeOk: [
    'inline-flex items-center gap-1 px-2.5 py-1',
    'bg-bu-ok-muted text-bu-ok',
    'rounded-bu-full text-xs font-semibold',
  ].join(' '),
  badgeDanger: [
    'inline-flex items-center gap-1 px-2.5 py-1',
    'bg-bu-danger-muted text-bu-danger',
    'rounded-bu-full text-xs font-semibold',
  ].join(' '),
  badgeWarning: [
    'inline-flex items-center gap-1 px-2.5 py-1',
    'bg-bu-warning-muted text-bu-warning',
    'rounded-bu-full text-xs font-semibold',
  ].join(' '),
  badgeGold: [
    'inline-flex items-center gap-1 px-2.5 py-1',
    'bg-bu-gold-muted text-bu-gold border border-bu-gold-border',
    'rounded-bu-full text-xs font-semibold',
  ].join(' '),

  /* ── VERIFIED ROZET (doğrulanmış emlakçı) ────────── */
  verified: [
    'inline-flex items-center gap-1 px-2.5 py-1',
    'bg-bu-gold text-bu-text-inv',
    'rounded-bu-full text-xs font-bold',
    'shadow-bu-gold',
  ].join(' '),

  /* ── BÖLÜM BAŞLIĞI ───────────────────────────────── */
  sectionTitle: 'font-display text-xl font-semibold text-bu-text',
  sectionSubtitle: 'text-sm text-bu-text-2 mt-1',

  /* ── SEPARATOR ───────────────────────────────────── */
  divider: 'border-t border-bu-border',
} as const
```

---

## BÖLÜM 2 — PORTFÖY DETAY SAYFASI SPEC

### 2.1 Sayfa Layout Yapısı

```
[Sidebar 240px] | [İçerik scroll] | [Sağ Sticky Panel 360px]
                    └── Bu sayfa sidebar'sız da olabilir (public URL)
```

**Sayfa genişlikleri:**
- Dashboard içi (sidebar var): `max-w-[1100px]` içerik + `360px` sticky panel
- Public URL (/p/slug, müşteri/anon): sidebar yok, `max-w-[1440px]`, aynı 2-kolon layout ama daha geniş

```
Toplam viewport kullanımı (dashboard içi):
├── Sidebar:          240px (sabit)
├── [gap 0px]
├── Ana içerik:       flex-1 max-w ~720px
├── [gap 32px]
└── Sağ sticky panel: 360px (sabit, top-24 sticky)
```

### 2.2 Hero Galeri Komponenti

```tsx
// PortfolioGallery.tsx
// ─────────────────────────────────────────────

/*
  LAYOUT:
  ┌─────────────────────────────────────────────────────────┐
  │                    HERO FOTO (16:9)                     │  ← h-[520px], cursor-zoom-in
  │                    [◄ 1/6 ►]  [⛶ Tümünü Gör]          │  ← sağ-alt overlay
  └─────────────────────────────────────────────────────────┘
  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
  │thumb1│ │thumb2│ │🔒 3 │ │🔒 4 │ │thumb5│ │ +2 ▸│   ← 80px yükseklik thumb grid
  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
*/

// Hero foto stilleri:
const heroStyles = [
  'relative w-full h-[520px]',          // sabit yükseklik
  'rounded-bu-xl overflow-hidden',
  'bg-bu-card cursor-zoom-in',
  'group',                              // hover için
].join(' ')

// Hero içindeki overlay (sağ-alt):
const heroOverlay = [
  'absolute bottom-4 right-4',
  'flex items-center gap-3',
].join(' ')

// Thumbnail grid container:
const thumbGrid = [
  'flex gap-2 mt-3 overflow-x-auto',
  'scrollbar-none',                     // webkit scrollbar gizle
].join(' ')

// Thumbnail item:
const thumbItem = [
  'relative flex-shrink-0 w-[120px] h-[80px]',
  'rounded-bu-md overflow-hidden',
  'cursor-pointer border-2',
  'transition-all duration-bu',
].join(' ')
// Aktif thumb: border-bu-gold
// Pasif thumb: border-transparent hover:border-bu-border

// KİLİTLİ THUMB (sahibi değilse):
// thumb üstüne koyu overlay + merkeze lock ikonu
// Görsel blur değil, sadece overlay (foto silueti görünsün)
const thumbLocked = [
  'absolute inset-0',
  'bg-bu-lock-bg/80 backdrop-blur-sm',
  'flex items-center justify-center',
].join(' ')

// FOTO SAYACI chip:
const photoCounter = [
  'px-3 py-1.5 rounded-bu-full',
  'bg-bu-lock-bg/80 backdrop-blur-md',
  'text-bu-text text-sm font-medium',
  'border border-bu-border',
].join(' ')

// "Tümünü Gör" butonu:
const showAllBtn = [
  'px-3 py-1.5 rounded-bu-full',
  'bg-bu-gold/90 hover:bg-bu-gold',
  'text-bu-text-inv text-sm font-semibold',
  'transition-all duration-bu',
].join(' ')
```

**Lightbox davranışı:**
- Hero'ya tıklayınca veya "Tümünü Gör" → tam ekran `fixed inset-0 z-50 bg-bu-overlay`
- Lightbox içinde: büyük foto, sol/sağ ok navigasyon, üst-sağ kapatma X
- Keyboard: Escape kapatır, ← → geçiş yapar
- Kilitli fotolar lightbox'ta gösterilmez (sahibi değilse)

### 2.3 Başlık + Fiyat Hiyerarşisi

```tsx
// Breadcrumb (sadece dashboard içi, public'te yok):
<nav className="flex items-center gap-2 text-sm text-bu-text-2 mb-6">
  <span>Portföylerim</span>
  <ChevronRight className="w-3 h-3" />
  <span className="text-bu-text">Acarkentte Havuzlu Villa</span>
</nav>

// Kategori chip'leri (galeri altında, başlık üstünde):
<div className="flex gap-2 flex-wrap mt-6 mb-3">
  {/* İşlem tipi */}
  <span className={s.chipGold}>Satılık</span>
  {/* Kategori */}
  <span className={s.chip}>Konut</span>
  <span className={s.chip}>Villa</span>
  {/* Görünürlük — sadece sahibi görür */}
  {isOwner && <span className={s.badgeOk}>● Yayında</span>}
</div>

// Başlık:
<h1 className="font-display text-3xl md:text-4xl font-bold text-bu-text leading-tight">
  Acarkentte Havuzlu Villa
</h1>

// Konum (yaklaşık — tam adres yok):
<div className="flex items-center gap-1.5 mt-2 text-bu-text-2 text-sm">
  <MapPin className="w-4 h-4 text-bu-gold flex-shrink-0" />
  <span>~Acarkent, Beykoz, İstanbul</span>
</div>

// Fiyat (sol sütun, başlığın altında):
<div className="mt-5">
  <p className="text-xs text-bu-text-2 uppercase tracking-wider mb-1">Fiyat</p>
  <p className="font-display text-price font-bold text-bu-gold leading-none">
    ₺117.000.000
  </p>
</div>
```

**NOT:** Fiyat sağ sticky panelde de tekrarlanır (sticky scroll boyunca görünür kalsın diye). Sol sütundaki büyük fiyat "wow" anı için, sağdaki ise aksiyon için.

### 2.4 Hızlı Bilgi Chip Şeridi

```tsx
// QuickInfoStrip — yatay scroll chip sırası
<div className="flex gap-2 flex-wrap mt-6 pt-6 border-t border-bu-border">

  {/* Her chip: ChipInfo komponenti */}
  {/* Örnek kullanım: */}
  <ChipInfo icon={<Bed className="w-3.5 h-3.5" />} label="Oda" value="7+2" />
  <ChipInfo icon={<Square className="w-3.5 h-3.5" />} label="Brüt" value="300 m²" />
  <ChipInfo icon={<Square className="w-3.5 h-3.5" />} label="Net" value="270 m²" />
  <ChipInfo icon={<Layers className="w-3.5 h-3.5" />} label="Kat" value="1. Kat" />
  <ChipInfo icon={<Bath className="w-3.5 h-3.5" />} label="Banyo" value="3" />
  <ChipInfo icon={<Car className="w-3.5 h-3.5" />} label="Otopark" value="Var" />

</div>

// ChipInfo komponenti:
function ChipInfo({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-bu-card border border-bu-border rounded-bu-lg">
      <span className="text-bu-gold">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] text-bu-text-3 uppercase tracking-wider leading-none">{label}</span>
        <span className="text-sm font-semibold text-bu-text mt-0.5">{value}</span>
      </div>
    </div>
  )
}
```

### 2.5 Açıklama + Public Özellikler

```tsx
// Açıklama bölümü:
<section className="mt-8">
  <h2 className={s.sectionTitle}>Açıklama</h2>
  <p className="mt-3 text-bu-text-2 text-base leading-relaxed">
    {portfolio.description}
  </p>
</section>

// Public özellikler (attribute grid):
<section className="mt-8 pt-8 border-t border-bu-border">
  <h2 className={s.sectionTitle}>Özellikler</h2>

  {/* Öne çıkan özellik chip'leri (havuz, manzara vb.) */}
  <div className="flex flex-wrap gap-2 mt-4">
    {portfolio.features.map(f => (
      <span key={f} className={s.chip}>{f}</span>
    ))}
  </div>

  {/* Teknik detay grid — 2 kolon */}
  <div className="grid grid-cols-2 gap-0 mt-6 border border-bu-border rounded-bu-lg overflow-hidden">
    {[
      { icon: <Thermometer />, label: 'Isıtma', value: 'Merkezi' },
      { icon: <Compass />,    label: 'Cephe',   value: 'Güney' },
      { icon: <Building2 />,  label: 'Bina Yaşı', value: '4 yıl' },
      { icon: <Sofa />,       label: 'Eşyalı',  value: 'Hayır' },
      { icon: <DollarSign />, label: 'Aidat',   value: '₺11.000' },
      { icon: <Layers />,     label: 'Bulunduğu Kat', value: '1' },
    ].map((item, i) => (
      <div
        key={i}
        className={cn(
          'flex items-center gap-3 px-4 py-3',
          'border-b border-bu-border last:border-b-0',
          i % 2 === 0 ? 'border-r border-bu-border' : ''
        )}
      >
        <span className="text-bu-text-2 w-4 h-4">{item.icon}</span>
        <span className="text-sm text-bu-text-2 flex-1">{item.label}</span>
        <span className="text-sm font-semibold text-bu-text">{item.value}</span>
      </div>
    ))}
  </div>
</section>

// Yaklaşık Konum bölümü:
<section className="mt-8 pt-8 border-t border-bu-border">
  <h2 className={s.sectionTitle}>Konum</h2>
  <p className="text-xs text-bu-text-3 mt-1">
    Yaklaşık konum gösterilmektedir. Tam adres detay talebi onaylandıktan sonra paylaşılır.
  </p>
  {/* Harita placeholder — map entegre olana kadar */}
  <div className="mt-4 h-48 bg-bu-card border border-bu-border rounded-bu-lg flex items-center justify-center">
    <div className="text-center">
      <MapPin className="w-8 h-8 text-bu-gold mx-auto mb-2" />
      <p className="text-sm text-bu-text-2">~Acarkent, Beykoz, İstanbul</p>
      <p className="text-xs text-bu-text-3 mt-1">Harita yakında</p>
    </div>
  </div>
</section>
```

### 2.6 Emlakçı Kartı

```tsx
// AgentCard — sol sütunun en altı, kilitli bölümden önce
<section className="mt-8 pt-8 border-t border-bu-border">
  <h2 className={s.sectionTitle}>Portföyü Paylaşan</h2>

  <div className={cn(s.card, 'mt-4 p-5 flex items-start gap-4')}>
    {/* Avatar */}
    <div className="relative flex-shrink-0">
      <img
        src={agent.avatarUrl}
        alt={agent.name}
        className="w-14 h-14 rounded-full object-cover border-2 border-bu-gold/30"
      />
      {/* Online dot — opsiyonel */}
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-bu-ok rounded-full border-2 border-bu-card" />
    </div>

    {/* Kimlik */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-bu-text text-base">{agent.name}</span>
        {/* Doğrulanmış rozet */}
        <span className={s.verified}>
          <ShieldCheck className="w-3 h-3" /> Doğrulanmış
        </span>
      </div>
      <p className="text-sm text-bu-text-2 mt-0.5">{agent.company}</p>
      {agent.region && (
        <div className="flex items-center gap-1 mt-1 text-xs text-bu-text-3">
          <MapPin className="w-3 h-3" />
          <span>{agent.region} Uzmanı</span>
        </div>
      )}
    </div>

    {/* Profil linki */}
    <a
      href={`/profil/${agent.username}`}
      className="text-xs text-bu-action hover:text-bu-action-hover transition-colors flex-shrink-0"
    >
      Profili Gör →
    </a>
  </div>

  {/* İletişim butonları */}
  <div className="flex gap-3 mt-3">
    <a
      href={`tel:${agent.phone}`}
      className={cn(s.btnSecondary, 'flex-1 justify-center')}
    >
      <Phone className="w-4 h-4" /> Ara
    </a>
    <a
      href={`https://wa.me/${agent.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(s.btnPrimary, 'flex-1 justify-center bg-[#25D366] hover:bg-[#128C7E] shadow-none')}
    >
      <MessageCircle className="w-4 h-4" /> WhatsApp
    </a>
  </div>
</section>
```

### 2.7 Sağ Sticky Panel

```tsx
// RightPanel — position: sticky, top: 96px (altındaki header yüksekliği)
<aside className="w-[360px] flex-shrink-0 space-y-4 sticky top-24 self-start">

  {/* ── BÖLÜM A: Fiyat + Hızlı Aksiyonlar ── */}
  <div className={cn(s.card, s.cardPadding)}>
    <p className="text-xs text-bu-text-3 uppercase tracking-wider">Fiyat</p>
    <p className="font-display text-3xl font-bold text-bu-gold mt-1">
      ₺117.000.000
    </p>

    {/* Sahibi için: Düzenle + Share Studio */}
    {isOwner && (
      <div className="flex gap-2 mt-4">
        <Button variant="secondary" className="flex-1 gap-2">
          <Pencil className="w-4 h-4" /> Düzenle
        </Button>
        <Button className={cn(s.btnGold, 'flex-1')}>
          <Share2 className="w-4 h-4" /> Paylaş
        </Button>
      </div>
    )}

    {/* Sahibi için: Durum badge */}
    {isOwner && (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-bu-border">
        <span className="text-sm text-bu-text-2">Durum</span>
        <StatusBadge status={portfolio.status} />
      </div>
    )}
  </div>

  {/* ── BÖLÜM B: KİLİTLİ BÖLÜM ── */}
  <LockedSection userType={userType} requestStatus={requestStatus} portfolio={portfolio} />

</aside>
```

### 2.8 KİLİTLİ BÖLÜM — Kritik Tasarım

Bu bölüm 4 farklı state'te render edilir. Her state için tam spec:

```tsx
// LockedSection.tsx
// userType: 'customer' | 'owner' | 'agent-no-grant' | 'agent-granted'
// requestStatus: null | 'pending' | 'approved' | 'rejected'

/* ────────────────────────────────────────────────
   TEMEL PANEL STİLİ (tüm state'lerde ortak)
   ─────────────────────────────────────────────── */
const panelBase = [
  'rounded-bu-xl overflow-hidden',
  'border border-bu-lock-border',
  'bg-bu-lock-bg',          // light modda da koyu kalır — dramatik kontrast
  'shadow-bu-lock',
].join(' ')

/* ────────────────────────────────────────────────
   STATE 1: MÜŞTERİ / ANON
   ─────────────────────────────────────────────── */
function LockedForCustomer() {
  return (
    <div className={panelBase}>
      {/* Üst şerit — altın çizgi */}
      <div className="h-0.5 bg-gradient-to-r from-bu-gold/0 via-bu-gold to-bu-gold/0" />

      <div className="p-6">
        {/* Başlık satırı */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-bu-md bg-bu-gold/10 border border