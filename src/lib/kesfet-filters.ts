// Keşfet filter state (Airbnb-style panel) → NetworkFilters mapping. Pure, no JSX.
//
// D13: every field here is TEASER-SAFE — real columns (price, m², room_count,
// city/district/neighborhood, category…) or PUBLIC attributes (portfolios.attributes
// via the canonical registry). No locked column/attribute is ever referenced.
// Location filters use the canonical region (city/district/neighborhood), never exact.
import type { Database } from "@/lib/database.types";
import type { NetworkFilters } from "@/lib/data/portfolios";
import type { RegionValue } from "@/components/geo/region-select";
import {
  PORTFOLIO_ATTRIBUTES,
  attributesForCategory,
  type AttributeDef,
  type PortfolioCategoryKey,
} from "@/lib/portfolio-attributes";
import { CATEGORY_LABELS, TRANSACTION_LABELS } from "@/lib/portfolio-labels";

type Category = Database["public"]["Enums"]["portfolio_category"];
type TransactionType = Database["public"]["Enums"]["transaction_type"];
type Mode = Database["public"]["Enums"]["portfolio_mode"];
type Currency = Database["public"]["Enums"]["currency"];

export type KesfetFilters = {
  q: string;
  category: Category | null;
  subcategory: string | null;
  transaction: TransactionType | null;
  region: RegionValue;
  priceMin: number | null;
  priceMax: number | null;
  currency: Currency;
  rooms: string[];
  grossMin: number | null;
  grossMax: number | null;
  netMin: number | null;
  netMax: number | null;
  features: string[];
  /** Canonical PUBLIC select/boolean attributes (bina_yasi, isitma, asansor…). */
  attrs: Record<string, string | boolean>;
  /** Detay Talebi açık (controlled) / Kapalı portföy (call_only). */
  mode: Mode | null;
};

export const EMPTY_KESFET_FILTERS: KesfetFilters = {
  q: "",
  category: null,
  subcategory: null,
  transaction: null,
  region: { city: null, district: null, neighborhood: null },
  priceMin: null,
  priceMax: null,
  currency: "TRY",
  rooms: [],
  grossMin: null,
  grossMax: null,
  netMin: null,
  netMax: null,
  features: [],
  attrs: {},
  mode: null,
};

/**
 * Advanced attribute filters shown when no category is selected ("Tümü"): the
 * cross-category essentials. With a category chosen we show that category's full
 * public select/boolean set instead (see filterableAttributes).
 */
const COMMON_FILTER_KEYS = [
  "isitma",
  "otopark",
  "asansor",
  "bina_yasi",
  "kullanim_durumu",
  "tapu_durumu",
  "krediye_uygun",
  "takas",
];

/** Public select/boolean attributes usable as Keşfet filters for a category (or common when null). */
export function filterableAttributes(category: Category | null): AttributeDef[] {
  const base = category
    ? attributesForCategory(category as PortfolioCategoryKey)
    : PORTFOLIO_ATTRIBUTES.filter((a) => COMMON_FILTER_KEYS.includes(a.key));
  return base.filter(
    (a) => a.visibility === "public" && (a.type === "select" || a.type === "boolean"),
  );
}

/** Map the panel state to the teaser-safe NetworkFilters used by listNetworkPortfolios. */
export function kesfetFiltersToNetwork(f: KesfetFilters): NetworkFilters {
  const attrs = Object.fromEntries(
    Object.entries(f.attrs).filter(([, v]) => v !== "" && v !== false && v != null),
  );
  return {
    q: f.q.trim() || undefined,
    city: f.region.city ?? undefined,
    district: f.region.district ?? undefined,
    neighborhood: f.region.neighborhood ?? undefined,
    category: f.category ?? undefined,
    subcategory: f.subcategory ?? undefined,
    transaction_type: f.transaction ?? undefined,
    priceMin: f.priceMin ?? undefined,
    priceMax: f.priceMax ?? undefined,
    grossMin: f.grossMin ?? undefined,
    grossMax: f.grossMax ?? undefined,
    netMin: f.netMin ?? undefined,
    netMax: f.netMax ?? undefined,
    roomCounts: f.rooms.length ? f.rooms : undefined,
    features: f.features.length ? f.features : undefined,
    mode: f.mode ?? undefined,
    attrs: Object.keys(attrs).length ? attrs : undefined,
  };
}

/** Count of active (non-empty) filter groups — drives the "Filtreler (n)" badge. */
export function countActiveFilters(f: KesfetFilters): number {
  let n = 0;
  if (f.q.trim()) n++;
  if (f.category) n++;
  if (f.subcategory) n++;
  if (f.transaction) n++;
  if (f.region.city || f.region.district || f.region.neighborhood) n++;
  if (f.priceMin != null || f.priceMax != null) n++;
  if (f.grossMin != null || f.grossMax != null) n++;
  if (f.netMin != null || f.netMax != null) n++;
  if (f.rooms.length) n++;
  if (f.features.length) n++;
  if (f.mode) n++;
  n += Object.values(f.attrs).filter((v) => v !== "" && v !== false && v != null).length;
  return n;
}

export type FilterChip = { key: string; label: string; clear: (f: KesfetFilters) => KesfetFilters };

/** Removable applied-filter chips shown under the bar (Airbnb pattern). */
export function deriveChips(f: KesfetFilters): FilterChip[] {
  const chips: FilterChip[] = [];
  if (f.q.trim())
    chips.push({ key: "q", label: `“${f.q.trim()}”`, clear: (s) => ({ ...s, q: "" }) });
  if (f.category)
    chips.push({
      key: "cat",
      label: CATEGORY_LABELS[f.category],
      clear: (s) => ({ ...s, category: null, subcategory: null }),
    });
  if (f.transaction)
    chips.push({
      key: "txn",
      label: TRANSACTION_LABELS[f.transaction],
      clear: (s) => ({ ...s, transaction: null }),
    });
  const region = [f.region.neighborhood, f.region.district, f.region.city].filter(Boolean).join(", ");
  if (region)
    chips.push({
      key: "region",
      label: region,
      clear: (s) => ({ ...s, region: { city: null, district: null, neighborhood: null } }),
    });
  if (f.priceMin != null || f.priceMax != null)
    chips.push({
      key: "price",
      label: priceLabel(f.priceMin, f.priceMax, f.currency),
      clear: (s) => ({ ...s, priceMin: null, priceMax: null }),
    });
  if (f.rooms.length)
    chips.push({
      key: "rooms",
      label: `${f.rooms.join(", ")} oda`,
      clear: (s) => ({ ...s, rooms: [] }),
    });
  if (f.grossMin != null || f.grossMax != null)
    chips.push({
      key: "gross",
      label: rangeLabel(f.grossMin, f.grossMax, "m²"),
      clear: (s) => ({ ...s, grossMin: null, grossMax: null }),
    });
  if (f.mode)
    chips.push({
      key: "mode",
      label: f.mode === "call_only" ? "Kapalı Portföy" : "Detay Talebi Açık",
      clear: (s) => ({ ...s, mode: null }),
    });
  if (f.features.length)
    chips.push({
      key: "features",
      label: f.features.join(", "),
      clear: (s) => ({ ...s, features: [] }),
    });
  for (const [key, val] of Object.entries(f.attrs)) {
    if (val === "" || val === false || val == null) continue;
    const def = PORTFOLIO_ATTRIBUTES.find((a) => a.key === key);
    if (!def) continue;
    const label =
      def.type === "boolean"
        ? def.label
        : `${def.label}: ${def.options?.find((o) => o.value === val)?.label ?? val}`;
    chips.push({ key: `attr:${key}`, label, clear: (s) => dropAttr(s, key) });
  }
  return chips;
}

function dropAttr(s: KesfetFilters, key: string): KesfetFilters {
  const next = { ...s.attrs };
  delete next[key];
  return { ...s, attrs: next };
}

const tr = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

function priceLabel(min: number | null, max: number | null, cur: Currency): string {
  if (min != null && max != null) return `${tr(min)}–${tr(max)} ${cur}`;
  if (min != null) return `≥ ${tr(min)} ${cur}`;
  return `≤ ${tr(max as number)} ${cur}`;
}

function rangeLabel(min: number | null, max: number | null, unit: string): string {
  if (min != null && max != null) return `${tr(min)}–${tr(max)} ${unit}`;
  if (min != null) return `≥ ${tr(min)} ${unit}`;
  return `≤ ${tr(max as number)} ${unit}`;
}
