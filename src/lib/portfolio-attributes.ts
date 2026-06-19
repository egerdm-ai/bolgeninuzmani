// Attribute registry (D33/D40) — the SINGLE source of truth for which portfolio
// attribute is PUBLIC (teaser-safe → portfolios.attributes) vs LOCKED
// (→ portfolio_private.attributes, gated by has_portfolio_access).
//
// Wizard, data layer and detail all derive from this list. The write path MUST
// route each key by `visibility` here and a LOCKED key must NEVER reach the
// public bag (see splitAttributes + assertNoLockedInPublic + the test).
//
// D40: category-based standard field set (docs/ATTRIBUTE_MAP.md). Each field
// declares `categories` — which portfolio categories it applies to — so the
// wizard can show only the relevant fields (wizard binding is a later step).
//
// NOT modeled here (first-class teaser COLUMNS, not attributes — avoid two
// sources of truth): oda sayısı (portfolios.room_count), brüt/net/arsa m²
// (gross_m2/net_m2/land_m2), and "genel özellikler/nitelikler" (portfolios.features[]).

/** Mirrors the DB enum portfolio_category (kept local so this file stays import-free). */
export type PortfolioCategoryKey =
  | "konut"
  | "ticari"
  | "arsa"
  | "turizm"
  | "isletme"
  | "ozel_varlik";

export type AttributeType = "text" | "number" | "select" | "boolean" | "multiselect";
export type AttributeVisibility = "public" | "locked";

export type AttributeDef = {
  key: string;
  label: string;
  type: AttributeType;
  options?: { value: string; label: string }[];
  visibility: AttributeVisibility;
  /** Categories this field applies to (wizard filters by the portfolio's category). */
  categories: PortfolioCategoryKey[];
};

// Reusable category groups.
const KONUT: PortfolioCategoryKey[] = ["konut"];
const ISYERI: PortfolioCategoryKey[] = ["ticari"]; // "ticari" enum = işyeri (dükkan/ofis/mağaza…)
const ARSA: PortfolioCategoryKey[] = ["arsa"];
const TICARI: PortfolioCategoryKey[] = ["isletme", "turizm"]; // otel/fabrika/çiftlik/komple
const BUILDINGS: PortfolioCategoryKey[] = ["konut", "ticari", "isletme", "turizm"];
const ALL_TYPES: PortfolioCategoryKey[] = ["konut", "ticari", "arsa", "isletme", "turizm"];

const HEATING = [
  { value: "dogalgaz", label: "Doğalgaz / Kombi" },
  { value: "merkezi", label: "Merkezi" },
  { value: "klima", label: "Klima" },
  { value: "soba", label: "Soba" },
  { value: "yerden", label: "Yerden Isıtma" },
  { value: "yok", label: "Yok" },
];
const FACADE = [
  { value: "kuzey", label: "Kuzey" },
  { value: "guney", label: "Güney" },
  { value: "dogu", label: "Doğu" },
  { value: "bati", label: "Batı" },
];
const PARKING = [
  { value: "kapali", label: "Kapalı Otopark" },
  { value: "acik", label: "Açık Otopark" },
  { value: "yok", label: "Yok" },
];
const USAGE = [
  { value: "bos", label: "Boş" },
  { value: "kiracili", label: "Kiracılı" },
  { value: "malik", label: "Mülk Sahibi" },
];
const TAPU = [
  { value: "kat_mulkiyeti", label: "Kat Mülkiyetli" },
  { value: "kat_irtifaki", label: "Kat İrtifaklı" },
  { value: "hisseli", label: "Hisseli Tapu" },
  { value: "mustakil", label: "Müstakil Tapulu" },
  { value: "arsa_tapulu", label: "Arsa Tapulu" },
  { value: "tahsis", label: "Tahsis" },
];

export const PORTFOLIO_ATTRIBUTES: AttributeDef[] = [
  // ======================= PUBLIC (teaser-safe) =======================
  // ---- shared across building categories ----
  {
    key: "isitma",
    label: "Isıtma",
    type: "select",
    visibility: "public",
    categories: [...BUILDINGS],
    options: HEATING,
  },
  {
    key: "cephe",
    label: "Cephe",
    type: "select",
    visibility: "public",
    categories: ["konut", "ticari"],
    options: FACADE,
  },
  {
    key: "kat",
    label: "Bulunduğu Kat",
    type: "text",
    visibility: "public",
    categories: ["konut", "ticari"],
  },
  {
    key: "bina_kat_sayisi",
    label: "Bina Kat Sayısı",
    type: "number",
    visibility: "public",
    categories: [...BUILDINGS],
  },
  {
    key: "bina_yasi",
    label: "Bina Yaşı",
    type: "text",
    visibility: "public",
    categories: [...BUILDINGS],
  },
  {
    key: "otopark",
    label: "Otopark",
    type: "select",
    visibility: "public",
    categories: [...BUILDINGS],
    options: PARKING,
  },
  {
    key: "asansor",
    label: "Asansör",
    type: "boolean",
    visibility: "public",
    categories: ["konut", "ticari"],
  },
  {
    key: "kullanim_durumu",
    label: "Kullanım Durumu",
    type: "select",
    visibility: "public",
    categories: ["konut", "ticari"],
    options: USAGE,
  },
  {
    key: "aidat",
    label: "Aidat (₺)",
    type: "number",
    visibility: "public",
    categories: ["konut", "ticari"],
  },
  {
    key: "tapu_durumu",
    label: "Tapu Durumu",
    type: "select",
    visibility: "public",
    categories: [...ALL_TYPES],
    options: TAPU,
  },
  {
    key: "krediye_uygun",
    label: "Krediye Uygun",
    type: "boolean",
    visibility: "public",
    categories: [...ALL_TYPES],
  },
  {
    key: "takas",
    label: "Takas",
    type: "boolean",
    visibility: "public",
    categories: [...ALL_TYPES],
  },

  // ---- KONUT ----
  {
    key: "banyo_sayisi",
    label: "Banyo Sayısı",
    type: "number",
    visibility: "public",
    categories: [...KONUT],
  },
  { key: "balkon", label: "Balkon", type: "boolean", visibility: "public", categories: [...KONUT] },
  { key: "esyali", label: "Eşyalı", type: "boolean", visibility: "public", categories: [...KONUT] },
  {
    key: "site_icinde",
    label: "Site İçerisinde",
    type: "boolean",
    visibility: "public",
    categories: [...KONUT],
  },
  {
    key: "yapi_tipi",
    label: "Yapı Tipi",
    type: "select",
    visibility: "public",
    categories: [...KONUT],
    options: [
      { value: "betonarme", label: "Betonarme" },
      { value: "celik", label: "Çelik" },
      { value: "ahsap", label: "Ahşap" },
      { value: "prefabrik", label: "Prefabrik" },
    ],
  },

  // ---- İŞYERI (ticari) ----
  {
    key: "isyeri_tipi",
    label: "İşyeri Tipi",
    type: "select",
    visibility: "public",
    categories: [...ISYERI],
    options: [
      { value: "dukkan", label: "Dükkan" },
      { value: "ofis", label: "Ofis" },
      { value: "magaza", label: "Mağaza" },
      { value: "depo", label: "Depo" },
      { value: "atolye", label: "Atölye" },
      { value: "plaza_kat", label: "Plaza Katı" },
    ],
  },
  {
    key: "tuvalet_sayisi",
    label: "Tuvalet Sayısı",
    type: "number",
    visibility: "public",
    categories: [...ISYERI],
  },
  {
    key: "mutfak",
    label: "Mutfak",
    type: "boolean",
    visibility: "public",
    categories: [...ISYERI],
  },
  {
    key: "depozito",
    label: "Depozito (₺)",
    type: "number",
    visibility: "public",
    categories: [...ISYERI],
  },
  {
    key: "bina_tipi",
    label: "Bulunduğu Bina Tipi",
    type: "select",
    visibility: "public",
    categories: [...ISYERI],
    options: [
      { value: "avm", label: "AVM" },
      { value: "plaza", label: "Plaza" },
      { value: "han", label: "Han" },
      { value: "mustakil", label: "Müstakil" },
    ],
  },

  // ---- ARSA ----
  {
    key: "arsa_tipi",
    label: "Arsa Tipi",
    type: "select",
    visibility: "public",
    categories: [...ARSA],
    options: [
      { value: "konut_imarli", label: "Konut İmarlı" },
      { value: "ticari_imarli", label: "Ticari İmarlı" },
      { value: "sanayi", label: "Sanayi" },
      { value: "tarla", label: "Tarla" },
      { value: "bag_bahce", label: "Bağ-Bahçe" },
      { value: "zeytinlik", label: "Zeytinlik" },
    ],
  },
  {
    key: "imar_durumu",
    label: "İmar Durumu",
    type: "select",
    visibility: "public",
    categories: [...ARSA],
    options: [
      { value: "konut", label: "Konut" },
      { value: "ticari", label: "Ticari" },
      { value: "sanayi", label: "Sanayi" },
      { value: "tarim", label: "Tarım" },
      { value: "plansiz", label: "Plansız" },
    ],
  },
  { key: "kaks", label: "KAKS (Emsal)", type: "text", visibility: "public", categories: [...ARSA] },
  { key: "gabari", label: "Gabari", type: "text", visibility: "public", categories: [...ARSA] },
  { key: "taks", label: "TAKS", type: "text", visibility: "public", categories: [...ARSA] },
  {
    key: "kat_karsiligi",
    label: "Kat Karşılığı",
    type: "boolean",
    visibility: "public",
    categories: [...ARSA],
  },
  {
    key: "yola_cephe",
    label: "Yola Cephe (m)",
    type: "number",
    visibility: "public",
    categories: [...ARSA],
  },
  {
    key: "altyapi",
    label: "Altyapı (elektrik/su/yol)",
    type: "select",
    visibility: "public",
    categories: [...ARSA],
    options: [
      { value: "var", label: "Var" },
      { value: "kismi", label: "Kısmi" },
      { value: "yok", label: "Yok" },
    ],
  },

  // ---- TİCARİ (isletme + turizm) ----
  {
    key: "ticari_tip",
    label: "Ticari Tip",
    type: "select",
    visibility: "public",
    categories: [...TICARI],
    options: [
      { value: "otel", label: "Otel" },
      { value: "apart", label: "Apart" },
      { value: "fabrika", label: "Fabrika" },
      { value: "depo", label: "Depo / Antrepo" },
      { value: "ciftlik", label: "Çiftlik" },
      { value: "komple_bina", label: "Komple Bina" },
      { value: "benzin", label: "Benzin İstasyonu" },
      { value: "avm", label: "AVM" },
    ],
  },
  {
    key: "unite_sayisi",
    label: "Oda / Ünite Sayısı",
    type: "number",
    visibility: "public",
    categories: [...TICARI],
  },
  {
    key: "kapasite",
    label: "Kapasite (kişi)",
    type: "number",
    visibility: "public",
    categories: [...TICARI],
  },
  {
    key: "ruhsat_durumu",
    label: "İmar / Ruhsat Durumu",
    type: "select",
    visibility: "public",
    categories: [...TICARI],
    options: [
      { value: "var", label: "İşletme Ruhsatı Var" },
      { value: "kismi", label: "Kısmi" },
      { value: "yok", label: "Yok" },
    ],
  },
  {
    key: "devren",
    label: "Devren",
    type: "boolean",
    visibility: "public",
    categories: [...TICARI],
  },
  {
    key: "isletme_durumu",
    label: "İşletme Durumu",
    type: "select",
    visibility: "public",
    categories: [...TICARI],
    options: [
      { value: "faal", label: "Faal" },
      { value: "bos", label: "Boş" },
      { value: "kiracili", label: "Kiracılı" },
    ],
  },

  // ======================= LOCKED (identity-revealing) =======================
  // Building / facility name + door/unit + block: pinpoint the property/owner.
  {
    key: "bina_site_adi",
    label: "Bina / Site / Tesis Adı",
    type: "text",
    visibility: "locked",
    categories: [...BUILDINGS],
  },
  {
    key: "daire_no",
    label: "Daire / Kapı No",
    type: "text",
    visibility: "locked",
    categories: ["konut", "ticari"],
  },
  { key: "blok", label: "Blok", type: "text", visibility: "locked", categories: [...KONUT] },
  // Ada/parsel: a tapu query from these returns the owner directly → LOCKED.
  {
    key: "ada_no",
    label: "Ada No",
    type: "text",
    visibility: "locked",
    categories: ["arsa", "isletme", "turizm"],
  },
  {
    key: "parsel_no",
    label: "Parsel No",
    type: "text",
    visibility: "locked",
    categories: ["arsa", "isletme", "turizm"],
  },
  {
    key: "pafta",
    label: "Pafta / Tam Konum",
    type: "text",
    visibility: "locked",
    categories: ["arsa", "isletme", "turizm"],
  },
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

/** Fields that apply to a given portfolio category (wizard filters by this). */
export function attributesForCategory(category: PortfolioCategoryKey): AttributeDef[] {
  return PORTFOLIO_ATTRIBUTES.filter((a) => a.categories.includes(category));
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
