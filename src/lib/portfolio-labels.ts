import type { Database } from "@/lib/database.types";

type Category = Database["public"]["Enums"]["portfolio_category"];
type Txn = Database["public"]["Enums"]["transaction_type"];
type Status = Database["public"]["Enums"]["portfolio_status"];
type Currency = Database["public"]["Enums"]["currency"];

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

export const STATUS_LABELS: Record<Status, string> = {
  draft: "Taslak",
  active: "Yayında",
  passive: "Pasif",
  sold: "Satıldı / Kiralandı",
};

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
