// Component style dictionary (DESIGN_SPEC §1.3) — navy + gold (D35).
// Each string is usable directly in className (compose with cn()).
export const s = {
  /* ── CARD ── */
  card: "bg-bu-card border border-bu-border rounded-bu-lg shadow-bu-card",
  cardHover: "hover:bg-bu-card-raised hover:shadow-bu-raised transition-all duration-200",
  cardPadding: "p-6",

  /* ── BUTTON: PRIMARY (blue action) ── */
  btnPrimary: [
    "inline-flex items-center gap-2 px-5 py-2.5",
    "bg-bu-action hover:bg-bu-action-hover",
    "text-white font-medium text-sm",
    "rounded-bu-md shadow-bu-action",
    "transition-all duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  /* ── BUTTON: SECONDARY (bordered) ── */
  btnSecondary: [
    "inline-flex items-center gap-2 px-5 py-2.5",
    "bg-transparent border border-bu-border",
    "text-bu-text hover:bg-bu-card-raised",
    "font-medium text-sm rounded-bu-md",
    "transition-all duration-200",
  ].join(" "),

  /* ── BUTTON: GOLD ── */
  btnGold: [
    "inline-flex items-center gap-2 px-5 py-2.5",
    "bg-bu-gold hover:bg-bu-gold-dim",
    "text-bu-text-inv font-semibold text-sm",
    "rounded-bu-md shadow-bu-gold",
    "transition-all duration-200",
  ].join(" "),

  /* ── BUTTON: GHOST ── */
  btnGhost: [
    "inline-flex items-center gap-2 px-4 py-2",
    "bg-transparent hover:bg-bu-card-raised",
    "text-bu-text-2 hover:text-bu-text",
    "text-sm rounded-bu-md",
    "transition-all duration-200",
  ].join(" "),

  /* ── CHIP / QUICK INFO ── */
  chip: [
    "inline-flex items-center gap-1.5 px-3 py-1.5",
    "bg-bu-card border border-bu-border",
    "rounded-bu-full text-sm text-bu-text-2",
  ].join(" "),
  chipGold: [
    "inline-flex items-center gap-1.5 px-3 py-1.5",
    "bg-bu-gold-muted border border-bu-gold-border",
    "rounded-bu-full text-sm text-bu-gold font-medium",
  ].join(" "),

  /* ── BADGES ── */
  badgeOk: [
    "inline-flex items-center gap-1 px-2.5 py-1",
    "bg-bu-ok-muted text-bu-ok",
    "rounded-bu-full text-xs font-semibold",
  ].join(" "),
  badgeDanger: [
    "inline-flex items-center gap-1 px-2.5 py-1",
    "bg-bu-danger-muted text-bu-danger",
    "rounded-bu-full text-xs font-semibold",
  ].join(" "),
  badgeWarning: [
    "inline-flex items-center gap-1 px-2.5 py-1",
    "bg-bu-warning-muted text-bu-warning",
    "rounded-bu-full text-xs font-semibold",
  ].join(" "),
  badgeGold: [
    "inline-flex items-center gap-1 px-2.5 py-1",
    "bg-bu-gold-muted text-bu-gold border border-bu-gold-border",
    "rounded-bu-full text-xs font-semibold",
  ].join(" "),

  /* ── VERIFIED (doğrulanmış emlakçı) ── */
  verified: [
    "inline-flex items-center gap-1 px-2.5 py-1",
    "bg-bu-gold text-bu-text-inv",
    "rounded-bu-full text-xs font-bold",
    "shadow-bu-gold",
  ].join(" "),

  /* ── SECTION TITLES ── */
  sectionTitle: "font-display text-xl font-semibold text-bu-text",
  sectionSubtitle: "text-sm text-bu-text-2 mt-1",

  /* ── SEPARATOR ── */
  divider: "border-t border-bu-border",
} as const;
