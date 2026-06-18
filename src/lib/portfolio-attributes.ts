// Attribute registry (D33) — the SINGLE source of truth for which portfolio
// attribute is PUBLIC (teaser-safe → portfolios.attributes) vs LOCKED
// (→ portfolio_private.attributes, gated by has_portfolio_access).
//
// Wizard, data layer and detail all derive from this list. The write path MUST
// route each key by `visibility` here and a LOCKED key must NEVER reach the
// public bag (see splitAttributes + assertNoLockedInPublic + the test).

export type AttributeType = "text" | "number" | "select" | "boolean";
export type AttributeVisibility = "public" | "locked";

export type AttributeDef = {
  key: string;
  label: string;
  type: AttributeType;
  options?: { value: string; label: string }[];
  visibility: AttributeVisibility;
};

export const PORTFOLIO_ATTRIBUTES: AttributeDef[] = [
  // ---- PUBLIC (teaser-safe) ----
  {
    key: "cephe",
    label: "Cephe",
    type: "select",
    visibility: "public",
    options: [
      { value: "kuzey", label: "Kuzey" },
      { value: "guney", label: "Güney" },
      { value: "dogu", label: "Doğu" },
      { value: "bati", label: "Batı" },
    ],
  },
  {
    key: "isitma",
    label: "Isıtma",
    type: "select",
    visibility: "public",
    options: [
      { value: "dogalgaz", label: "Doğalgaz" },
      { value: "merkezi", label: "Merkezi" },
      { value: "klima", label: "Klima" },
      { value: "yok", label: "Yok" },
    ],
  },
  { key: "kat", label: "Bulunduğu Kat", type: "text", visibility: "public" },
  { key: "bina_yasi", label: "Bina Yaşı", type: "text", visibility: "public" },
  { key: "esyali", label: "Eşyalı", type: "boolean", visibility: "public" },
  { key: "aidat", label: "Aidat (₺)", type: "number", visibility: "public" },
  // ---- LOCKED (revealed only to owner / granted) ----
  { key: "bina_site_adi", label: "Bina / Site Adı", type: "text", visibility: "locked" },
  { key: "daire_no", label: "Daire No", type: "text", visibility: "locked" },
];

const BY_KEY = new Map(PORTFOLIO_ATTRIBUTES.map((a) => [a.key, a]));

export const PUBLIC_ATTRIBUTES = PORTFOLIO_ATTRIBUTES.filter((a) => a.visibility === "public");
export const LOCKED_ATTRIBUTES = PORTFOLIO_ATTRIBUTES.filter((a) => a.visibility === "locked");

export function attributeDef(key: string): AttributeDef | undefined {
  return BY_KEY.get(key);
}

export function attributeVisibility(key: string): AttributeVisibility | undefined {
  return BY_KEY.get(key)?.visibility;
}

export type AttributesInput = Record<string, unknown>;
export type AttributeBag = Record<string, unknown>;

/**
 * Split a flat {key: value} map into PUBLIC and LOCKED bags per the registry.
 * Empty/undefined/null values are dropped. An UNKNOWN key throws (the registry
 * is the only source of truth — silently passing it through would risk a leak).
 */
export function splitAttributes(input: AttributesInput): {
  publicAttrs: AttributeBag;
  lockedAttrs: AttributeBag;
} {
  const publicAttrs: AttributeBag = {};
  const lockedAttrs: AttributeBag = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;
    const def = BY_KEY.get(key);
    if (!def) throw new Error(`Bilinmeyen özellik anahtarı: "${key}" (registry'de tanımlı değil)`);
    if (def.visibility === "locked") lockedAttrs[key] = value;
    else publicAttrs[key] = value;
  }
  return { publicAttrs, lockedAttrs };
}

/**
 * Hard guard at the write boundary (defense in depth, D33): assert NO locked key
 * is present in the public bag before it is written to portfolios.attributes.
 * Throws on violation — a locked key must never leak into the teaser table.
 */
export function assertNoLockedInPublic(publicAttrs: AttributeBag): void {
  for (const key of Object.keys(publicAttrs)) {
    if (attributeVisibility(key) === "locked") {
      throw new Error(
        `Güvenlik ihlali (D33): kilitli özellik "${key}" public attributes bag'ine yazılamaz.`,
      );
    }
  }
}
