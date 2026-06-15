import { useMemo } from "react";
import {
  Minus,
  Plus,
  Check,
  Waves,
  Droplets,
  FileText,
  BadgeCheck,
  Sparkles,
  Clock,
  Send,
  Car,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FilterField } from "./filter-section";
import {
  recommendedFilters,
  modalCategories,
  modalTransactionTypes,
  livingSpaceCounters,
  areaRangeFields,
  konutDetailFields,
  landFields,
  commercialFields,
  luxuryFeatures,
  privacyAccessFields,
  professionalFields,
  matchSearchFields,
  currencies,
  priceHistogram,
  priceBounds,
  type FieldDef,
  type FilterState,
  type FilterValue,
  type CategoryKey,
} from "@/lib/taxonomy";

const recommendedIcons: Record<string, LucideIcon> = {
  Waves,
  Droplets,
  FileText,
  BadgeCheck,
  Sparkles,
  Clock,
  Send,
  Car,
};

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function SectionShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-5 first:pt-1 last:border-b-0">
      <div className="mb-3">
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-xl border px-3.5 py-2 text-sm font-medium transition-all",
              active
                ? "border-gold/50 bg-gold/15 text-gold shadow-gold"
                : "border-border bg-surface-2 text-secondary-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Counter({
  label,
  value,
  max = 10,
  onChange,
}: {
  label: string;
  value: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="text-sm text-secondary-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:border-gold/50 hover:text-gold",
            value <= 0 && "cursor-not-allowed opacity-35 hover:border-border-strong hover:text-foreground",
          )}
          aria-label={`${label} azalt`}
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums text-foreground">
          {value > 0 ? `${value}+` : "—"}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:border-gold/50 hover:text-gold",
            value >= max && "cursor-not-allowed opacity-35 hover:border-border-strong hover:text-foreground",
          )}
          aria-label={`${label} arttır`}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
        checked
          ? "border-gold/50 bg-gold/10 text-gold"
          : "border-border bg-surface-2 text-secondary-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked ? "border-gold bg-gold text-primary-foreground" : "border-border-strong",
        )}
      >
        {checked && <Check className="size-3" />}
      </span>
      {label}
    </button>
  );
}

function BoolGrid({
  fields,
  filters,
  setFilter,
}: {
  fields: FieldDef[];
  filters: FilterState;
  setFilter: (k: string, v: FilterValue) => void;
}) {
  const booleans = fields.filter((f) => f.type === "boolean");
  const rest = fields.filter((f) => f.type !== "boolean");
  return (
    <div className="space-y-3">
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {rest.map((f) => (
            <FilterField key={f.key} field={f} value={filters[f.key]} onChange={setFilter} />
          ))}
        </div>
      )}
      {booleans.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {booleans.map((f) => (
            <CheckRow
              key={f.key}
              label={f.label}
              checked={!!filters[f.key]}
              onToggle={() => setFilter(f.key, !filters[f.key])}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function compactPrice(n: number, currency: string) {
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}M`;
  if (n >= 1000) return `${sym}${Math.round(n / 1000)}K`;
  return `${sym}${n}`;
}

function PriceRange({
  filters,
  setFilter,
}: {
  filters: FilterState;
  setFilter: (k: string, v: FilterValue) => void;
}) {
  const currency = (filters.currency as string) ?? "TRY";
  const bounds = priceBounds[currency] ?? priceBounds.TRY;
  const min = Number(filters.priceMin ?? bounds.min);
  const max = Number(filters.priceMax ?? bounds.max);

  const bars = priceHistogram.length;
  const range = bounds.max - bounds.min || 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {currencies.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setFilter("currency", c.value);
              setFilter("priceMin", undefined);
              setFilter("priceMax", undefined);
            }}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
              currency === c.value
                ? "border-gold/50 bg-gold/15 text-gold"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Histogram */}
      <div className="flex h-20 items-end gap-[3px] rounded-xl border border-border bg-surface-2/60 px-3 pt-3">
        {priceHistogram.map((h, i) => {
          const barLow = bounds.min + (i / bars) * range;
          const barHigh = bounds.min + ((i + 1) / bars) * range;
          const inRange = barHigh >= min && barLow <= max;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition-colors",
                inRange ? "bg-gradient-gold" : "bg-surface-3",
              )}
              style={{ height: `${(h / Math.max(...priceHistogram)) * 100}%` }}
            />
          );
        })}
      </div>

      <Slider
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={[min, max]}
        onValueChange={(v) => {
          setFilter("priceMin", v[0] <= bounds.min ? undefined : v[0]);
          setFilter("priceMax", v[1] >= bounds.max ? undefined : v[1]);
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Min fiyat</Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={compactPrice(bounds.min, currency)}
            value={(filters.priceMin as number) ?? ""}
            onChange={(e) => setFilter("priceMin", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Max fiyat</Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={compactPrice(bounds.max, currency)}
            value={(filters.priceMax as number) ?? ""}
            onChange={(e) => setFilter("priceMax", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter modal
// ---------------------------------------------------------------------------

export function FilterModal({
  open,
  onOpenChange,
  filters,
  setFilter,
  resultCount,
  onClear,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  filters: FilterState;
  setFilter: (k: string, v: FilterValue) => void;
  resultCount: number;
  onClear: () => void;
}) {
  const modalCat = (filters.modalCategory as string) ?? "all";
  const cat: CategoryKey | undefined = useMemo(
    () => modalCategories.find((c) => c.value === modalCat)?.category,
    [modalCat],
  );

  const showKonut = !cat || cat === "konut";
  const showArsa = cat === "arsa";
  const showTicari = cat === "ticari" || cat === "endustriyel" || cat === "turizm";
  const showLuxury = !cat || cat === "konut" || cat === "turizm";

  const toggleLux = (v: string) => {
    const cur = Array.isArray(filters.luxuryFeatures) ? filters.luxuryFeatures : [];
    setFilter("luxuryFeatures", cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };
  const luxSelected = Array.isArray(filters.luxuryFeatures) ? filters.luxuryFeatures : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden border-border-strong bg-surface p-0 shadow-elegant">
        {/* Sticky header */}
        <div className="flex shrink-0 items-center justify-center border-b border-border bg-surface/95 px-6 py-4 backdrop-blur">
          <h2 className="font-display text-xl font-semibold text-foreground">Filtreler</h2>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          {/* Önerilenler */}
          <SectionShell title="Önerilenler" hint="VAULT'un öne çıkardığı hızlı filtreler">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {recommendedFilters.map((r) => {
                const Icon = recommendedIcons[r.icon] ?? Sparkles;
                const active = !!filters[r.key];
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setFilter(r.key, !active)}
                    className={cn(
                      "flex flex-col gap-2 rounded-2xl border p-3 text-left transition-all",
                      active
                        ? "border-gold/50 bg-gold/10 text-gold shadow-gold"
                        : "border-border bg-surface-2 text-secondary-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("size-5", active ? "text-gold" : "text-muted-foreground")} />
                    <span className="text-sm font-semibold leading-tight">{r.label}</span>
                    {r.hint && <span className="text-[11px] text-muted-foreground">{r.hint}</span>}
                  </button>
                );
              })}
            </div>
          </SectionShell>

          {/* Portföy Tipi */}
          <SectionShell title="Portföy Tipi">
            <Segmented
              options={modalCategories}
              value={modalCat}
              onChange={(v) => setFilter("modalCategory", v)}
            />
          </SectionShell>

          {/* İşlem Tipi */}
          <SectionShell title="İşlem Tipi">
            <Segmented
              options={modalTransactionTypes}
              value={(filters.transaction as string) ?? "satilik"}
              onChange={(v) => setFilter("transaction", v)}
            />
          </SectionShell>

          {/* Fiyat Aralığı */}
          <SectionShell title="Fiyat Aralığı">
            <PriceRange filters={filters} setFilter={setFilter} />
          </SectionShell>

          {/* Alan / m² */}
          <SectionShell title="Alan / m²" hint="Minimum değer (m²)">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {areaRangeFields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{f.label}</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="min"
                    value={(filters[f.key] as number) ?? ""}
                    onChange={(e) => setFilter(f.key, e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </SectionShell>

          {/* Oda ve Yaşam Alanları */}
          <SectionShell title="Oda ve Yaşam Alanları">
            <div className="rounded-2xl border border-border bg-surface-2/60 px-4 py-1.5">
              {livingSpaceCounters.map((c) => (
                <Counter
                  key={c.key}
                  label={c.label}
                  max={c.max}
                  value={Number(filters[c.key] ?? 0)}
                  onChange={(v) => setFilter(c.key, v === 0 ? undefined : v)}
                />
              ))}
            </div>
          </SectionShell>

          {/* Lokasyon */}
          <SectionShell title="Lokasyon" hint="Tam adres yalnızca detay talebi onaylanınca gösterilir">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Şehir</Label>
                <Input
                  placeholder="örn. Muğla"
                  value={(filters.city as string) ?? ""}
                  onChange={(e) => setFilter("city", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">İlçe</Label>
                <Input
                  placeholder="örn. Bodrum"
                  value={(filters.region as string) ?? ""}
                  onChange={(e) => setFilter("region", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Bölge / Mahalle</Label>
                <Input
                  placeholder="örn. Yalıkavak"
                  value={(filters.neighborhood as string) ?? ""}
                  onChange={(e) => setFilter("neighborhood", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 flex h-28 items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-2/60 text-xs text-muted-foreground">
              Haritada alan seç · Yaklaşık konum gösterilir
            </div>
          </SectionShell>

          {/* Konut / Villa Detayları */}
          {showKonut && (
            <SectionShell title="Konut / Villa Detayları">
              <BoolGrid fields={konutDetailFields} filters={filters} setFilter={setFilter} />
            </SectionShell>
          )}

          {/* Luxury Özellikler */}
          {showLuxury && (
            <SectionShell title="Luxury Özellikler">
              <div className="flex flex-wrap gap-2">
                {luxuryFeatures.map((f) => {
                  const active = luxSelected.includes(f.value);
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => toggleLux(f.value)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                        active
                          ? "border-gold/50 bg-gold/15 text-gold shadow-gold"
                          : "border-border bg-surface-2 text-secondary-foreground hover:border-border-strong hover:text-foreground",
                      )}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </SectionShell>
          )}

          {/* Arsa Detayları */}
          {showArsa && (
            <SectionShell title="Arsa Detayları">
              <BoolGrid fields={landFields} filters={filters} setFilter={setFilter} />
            </SectionShell>
          )}

          {/* Ticari Detaylar */}
          {showTicari && (
            <SectionShell title="Ticari Detaylar">
              <BoolGrid fields={commercialFields} filters={filters} setFilter={setFilter} />
            </SectionShell>
          )}

          {/* Gizlilik & Erişim */}
          <SectionShell title="Gizlilik & Erişim">
            <BoolGrid fields={privacyAccessFields} filters={filters} setFilter={setFilter} />
          </SectionShell>

          {/* Profesyonel / Bölge Uzmanı */}
          <SectionShell title="Profesyonel / Bölge Uzmanı">
            <BoolGrid fields={professionalFields} filters={filters} setFilter={setFilter} />
          </SectionShell>

          {/* Eşleşme & Arayış */}
          <SectionShell title="Eşleşme & Arayış">
            <BoolGrid fields={matchSearchFields} filters={filters} setFilter={setFilter} />
          </SectionShell>
        </div>

        {/* Sticky footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur">
          <Button variant="ghost" className="text-sm underline-offset-4 hover:underline" onClick={onClear}>
            Tümünü Temizle
          </Button>
          <Button
            className="gap-1.5 bg-gradient-gold px-6 text-primary-foreground hover:opacity-90"
            onClick={() => onOpenChange(false)}
          >
            {resultCount} Portföy Göster
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
