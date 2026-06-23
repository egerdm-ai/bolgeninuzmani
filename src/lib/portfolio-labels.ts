import type { Database } from "@/lib/database.types";

type Category = Database["public"]["Enums"]["portfolio_category"];
type Txn = Database["public"]["Enums"]["transaction_type"];
type Status = Database["public"]["Enums"]["portfolio_status"];
type Currency = Database["public"]["Enums"]["currency"];
type DocumentKind = Database["public"]["Enums"]["document_kind"];

export const CATEGORY_LABELS: Record<Category, string> = {
  konut: "Konut",
  ticari: "Ticari",
  arsa: "Arsa",
  turizm: "Turizm",
  isletme: "İşletme",
  ozel_varlik: "Özel Varlık",
};

export const TRANSACTION_LABELS: Record<Txn, string> = {
  satilik: "Satılık",
  kiralik: "Kiralık",
};

// Canonical subcategory tree (Faz 1.2). Keyed by the DB portfolio_category enum
// (NOT the mock taxonomy.ts, which drifts: "endustriyel" ∉ enum). Stored as
// portfolios.subcategory (free-text column) but chosen from this list so the
// value space stays consistent across wizard / filter / detail. Ticari is
// further subdividable here via its option list.
export type SubcategoryOption = { value: string; label: string };

export const SUBCATEGORY_OPTIONS: Record<Category, SubcategoryOption[]> = {
  konut: [
    { value: "daire", label: "Daire" },
    { value: "villa", label: "Villa" },
    { value: "mustakil_ev", label: "Müstakil Ev" },
    { value: "dubleks", label: "Dubleks" },
    { value: "rezidans", label: "Rezidans" },
    { value: "yali", label: "Yalı" },
    { value: "yali_dairesi", label: "Yalı Dairesi" },
    { value: "kosk", label: "Köşk" },
    { value: "yazlik", label: "Yazlık" },
    { value: "ciftlik_evi", label: "Çiftlik Evi" },
  ],
  ticari: [
    { value: "dukkan", label: "Dükkan" },
    { value: "ofis", label: "Ofis" },
    { value: "magaza", label: "Mağaza" },
    { value: "plaza_kati", label: "Plaza Katı" },
    { value: "depo", label: "Depo" },
    { value: "atolye", label: "Atölye" },
    { value: "is_hani_kati", label: "İş Hanı Katı" },
    { value: "bufe", label: "Büfe / Kiosk" },
  ],
  arsa: [
    { value: "konut_imarli", label: "Konut İmarlı" },
    { value: "ticari_imarli", label: "Ticari İmarlı" },
    { value: "sanayi_imarli", label: "Sanayi İmarlı" },
    { value: "turizm_imarli", label: "Turizm İmarlı" },
    { value: "tarla", label: "Tarla" },
    { value: "bag_bahce", label: "Bağ-Bahçe" },
    { value: "zeytinlik", label: "Zeytinlik" },
  ],
  turizm: [
    { value: "otel", label: "Otel" },
    { value: "butik_otel", label: "Butik Otel" },
    { value: "apart_otel", label: "Apart Otel" },
    { value: "tatil_koyu", label: "Tatil Köyü" },
    { value: "pansiyon", label: "Pansiyon" },
    { value: "termal_tesis", label: "Termal Tesis" },
  ],
  isletme: [
    { value: "fabrika", label: "Fabrika" },
    { value: "uretim_tesisi", label: "Üretim Tesisi" },
    { value: "depo_antrepo", label: "Depo / Antrepo" },
    { value: "ciftlik", label: "Çiftlik" },
    { value: "komple_bina", label: "Komple Bina" },
    { value: "benzin_istasyonu", label: "Benzin İstasyonu" },
    { value: "avm", label: "AVM" },
  ],
  ozel_varlik: [
    { value: "tarihi_yapi", label: "Tarihi Yapı" },
    { value: "ada_koru", label: "Ada / Koru" },
    { value: "marina", label: "Marina" },
    { value: "yat", label: "Yat" },
    { value: "koleksiyon", label: "Sanat / Koleksiyon" },
    { value: "diger", label: "Diğer" },
  ],
};

/** Subcategory options for a category (empty array = none defined). */
export function subcategoriesForCategory(category: Category): SubcategoryOption[] {
  return SUBCATEGORY_OPTIONS[category] ?? [];
}

/** Human label for a stored subcategory value (falls back to the raw value). */
export function subcategoryLabel(category: Category, value: string | null): string | null {
  if (!value) return null;
  return SUBCATEGORY_OPTIONS[category]?.find((o) => o.value === value)?.label ?? value;
}

export const STATUS_LABELS: Record<Status, string> = {
  draft: "Taslak",
  active: "Yayında",
  passive: "Pasif",
  sold: "Satıldı / Kiralandı",
};

// Canonical document type labels (Faz 2.4). Kat Planı is primary; Tapu available
// but never a default. Used by the media manager + the /p teaser ("Kilitli: Kat Planı").
export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  kat_plani: "Kat Planı",
  ruhsat: "Ruhsat",
  imar_plani: "İmar Planı",
  proje: "Proje",
  tapu: "Tapu",
  pdf: "PDF",
  diger: "Diğer",
};

/** Human label for a stored document_kind value (falls back to the raw value). */
export function documentKindLabel(kind: string): string {
  return DOCUMENT_KIND_LABELS[kind as DocumentKind] ?? kind;
}

export const CURRENCY_OPTIONS: Currency[] = ["TRY", "USD", "EUR"];

const CURRENCY_SYMBOL: Record<Currency, string> = { TRY: "₺", USD: "$", EUR: "€" };

/** Teaser-friendly price; null → "Belirtilmemiş". */
export function formatPortfolioPrice(price: number | null, currency: Currency): string {
  if (price == null) return "Belirtilmemiş";
  return `${CURRENCY_SYMBOL[currency]}${new Intl.NumberFormat("tr-TR").format(price)}`;
}

/** Compact price for map pins / chips — e.g. "64,5M ₺", "850B ₺" (teaser-safe). */
export function abbreviatePrice(price: number | null, currency: Currency): string {
  const sym = CURRENCY_SYMBOL[currency];
  if (price == null) return sym;
  if (price >= 1_000_000)
    return `${(price / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}M ${sym}`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}B ${sym}`;
  return `${new Intl.NumberFormat("tr-TR").format(price)} ${sym}`;
}
