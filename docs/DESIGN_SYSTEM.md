# Bölgenin Uzmanı — Design System

Dark-luxury theme inherited from the prototype, rebranded from "VAULT" to
**Bölgenin Uzmanı**. Near-black foundations, champagne→bronze gold as the single
brand accent, high-contrast serif for display, neutral sans for UI. Color values
are estimates read from the prototype screenshots; fonts are the closest match
(Playfair Display / Inter) — swap if the real files differ.

## Color tokens
| Token | Hex | Use |
|---|---|---|
| `obsidian` | `#0B0B0D` | App background |
| `surface` | `#141418` | Cards, panels |
| `elevated` | `#1E1E24` | Hover, inputs, raised |
| `border` | `#2A2A31` | Hairlines, dividers |
| `champagne` | `#ECD9A7` | Light gold (gradient start) |
| `gold` | `#D4AF6E` | Primary accent (logo, links, active) |
| `antique` | `#C29A4E` | Mid gold |
| `bronze` | `#A87E3C` | Deep gold (gradient end, borders) |
| `pearl` | `#F4F1EA` | Primary text |
| `mist` | `#9A9AA2` | Secondary text |
| `slate` | `#5C5C64` | Tertiary / disabled |
| `emerald` | `#34D399` | Active / success |
| `coral` | `#F26D6D` | Urgent / destructive |
| `azure` | `#6AA6F0` | Info / public |

Gold gradient (buttons / featured CTA): `linear-gradient(90deg,#ECD9A7,#D4AF6E,#A87E3C)`.

## Typography
- Display / headings: **Playfair Display** (serif). Titles, prices, stat numbers.
- UI / body / labels: **Inter** (sans).
- Logo wordmark: Playfair, letter-spaced, champagne — now reads **Bölgenin Uzmanı**
  (the old shield-only "VAULT" mark is retired; logo direction is open — a "BU"
  monogram or a region-pin mark both fit).

## Conventions
- Locked content (exact address, tapu, malik, private notes) is never rendered on the
  public/customer listing view.
- Status pills: tinted dark bg + colored text (emerald active, coral urgent,
  azure public). Solid gold pill for emphasis.
- Radius: pills full; cards ~16px; inputs/buttons ~14px. Gold is an accent, used
  sparingly; surfaces stay dark, never pure white.

## CSS variables
```css
:root {
  --obsidian:#0B0B0D; --surface:#141418; --elevated:#1E1E24; --border:#2A2A31;
  --champagne:#ECD9A7; --gold:#D4AF6E; --antique:#C29A4E; --bronze:#A87E3C;
  --pearl:#F4F1EA; --mist:#9A9AA2; --slate:#5C5C64;
  --emerald:#34D399; --coral:#F26D6D; --azure:#6AA6F0;
  --gold-grad:linear-gradient(90deg,#ECD9A7,#D4AF6E,#A87E3C);
  --font-display:"Playfair Display",serif;
  --font-ui:"Inter",system-ui,sans-serif;
}
```

## Tailwind (theme.extend.colors)
```js
colors: {
  obsidian:'#0B0B0D', surface:'#141418', elevated:'#1E1E24', border:'#2A2A31',
  champagne:'#ECD9A7', gold:'#D4AF6E', antique:'#C29A4E', bronze:'#A87E3C',
  pearl:'#F4F1EA', mist:'#9A9AA2', slate:'#5C5C64',
  emerald:'#34D399', coral:'#F26D6D', azure:'#6AA6F0',
}
```
