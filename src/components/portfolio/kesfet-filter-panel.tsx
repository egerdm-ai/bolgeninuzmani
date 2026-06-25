import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { FilterSection } from "@/components/vault/filter-section";
import { CategorySelect } from "@/components/portfolio/category-select";
import { RegionSelect } from "@/components/geo/region-select";
import { PriceInput } from "@/components/ui/price-input";
import { MultiSelect } from "@/components/ui/multi-select";
import { FeatureMultiSelect } from "@/components/portfolio/feature-multi-select";
import { useIsMobile } from "@/hooks/use-mobile";
import { ROOM_COUNTS } from "@/lib/portfolio-attributes";
import { TRANSACTION_LABELS } from "@/lib/portfolio-labels";
import { Constants } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import {
  type KesfetFilters,
  filterableAttributes,
  countActiveFilters,
} from "@/lib/kesfet-filters";

const TRANSACTIONS = Constants.public.Enums.transaction_type;
const ANY = "__any"; // Radix SelectItem can't use "" — sentinel for "cleared".

/**
 * Airbnb-style Keşfet filter panel (E3.1): the full Sahibinden filter set, wired to
 * the canonical Faz 1 pieces + the PUBLIC attribute registry. Bottom-sheet (vaul) on
 * mobile, modal on desktop. Controlled — parent owns `value` and the live `count`;
 * filters apply instantly (no Apply step), so the footer just closes the panel.
 * Teaser-safe by construction (see lib/kesfet-filters.ts).
 */
export function KesfetFilterPanel({
  value,
  onChange,
  onClear,
  count,
  open,
  onOpenChange,
}: {
  value: KesfetFilters;
  onChange: (next: KesfetFilters) => void;
  onClear: () => void;
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const active = countActiveFilters(value);

  const body = (
    <PanelBody value={value} onChange={onChange} />
  );
  const footer = (
    <div className="flex items-center justify-between gap-3 border-t border-border bg-background px-4 py-3">
      <button
        type="button"
        onClick={onClear}
        disabled={active === 0}
        className="text-sm font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-40"
      >
        Tümünü temizle
      </button>
      <Button
        onClick={() => onOpenChange(false)}
        className="bg-gradient-gold text-primary-foreground hover:opacity-90"
      >
        {count} portföy göster
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="border-b border-border text-left">
            <DrawerTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-gold" /> Filtreler
            </DrawerTitle>
            <DrawerDescription>Ağdaki yayında portföyleri filtreleyin.</DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">{body}</div>
          {footer}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[95vw] max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-gold" /> Filtreler
          </DialogTitle>
          <DialogDescription>Ağdaki yayında portföyleri filtreleyin.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">{body}</div>
        {footer}
      </DialogContent>
    </Dialog>
  );
}

function PanelBody({
  value,
  onChange,
}: {
  value: KesfetFilters;
  onChange: (next: KesfetFilters) => void;
}) {
  const set = <K extends keyof KesfetFilters>(key: K, v: KesfetFilters[K]) =>
    onChange({ ...value, [key]: v });

  const setAttr = (key: string, v: string | boolean) => {
    const next = { ...value.attrs };
    if (v === "" || v === false || v === ANY) delete next[key];
    else next[key] = v;
    onChange({ ...value, attrs: next });
  };

  const attrs = filterableAttributes(value.category);

  return (
    <>
      {/* 1 Tip + alt kategori */}
      <FilterSection label="Portföy Tipi" defaultOpen count={value.category ? 1 : 0}>
        <CategorySelect
          value={{ category: value.category ?? "konut", subcategory: value.subcategory }}
          onChange={(v) =>
            onChange({
              ...value,
              category: v.category,
              subcategory: v.subcategory,
              // category değişince kategoriye özel gelişmiş filtreleri sıfırla
              attrs: {},
            })
          }
        />
        {value.category && (
          <button
            type="button"
            onClick={() => onChange({ ...value, category: null, subcategory: null, attrs: {} })}
            className="text-xs text-gold hover:underline"
          >
            Kategoriyi temizle (Tümü)
          </button>
        )}
      </FilterSection>

      {/* 2 İşlem */}
      <FilterSection label="İşlem Tipi" defaultOpen count={value.transaction ? 1 : 0}>
        <div className="flex flex-wrap gap-1.5">
          {TRANSACTIONS.map((t) => (
            <SegBtn
              key={t}
              active={value.transaction === t}
              onClick={() => set("transaction", value.transaction === t ? null : t)}
            >
              {TRANSACTION_LABELS[t]}
            </SegBtn>
          ))}
        </div>
      </FilterSection>

      {/* 3 Lokasyon */}
      <FilterSection
        label="Lokasyon"
        defaultOpen
        count={value.region.city || value.region.district || value.region.neighborhood ? 1 : 0}
      >
        <RegionSelect value={value.region} onChange={(r) => set("region", r)} />
      </FilterSection>

      {/* 4 Fiyat */}
      <FilterSection
        label="Fiyat"
        count={value.priceMin != null || value.priceMax != null ? 1 : 0}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">En az</Label>
            <PriceInput
              value={value.priceMin}
              onChange={(v) => set("priceMin", v)}
              currency={value.currency}
              onCurrencyChange={(c) => set("currency", c)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">En çok</Label>
            <PriceInput value={value.priceMax} onChange={(v) => set("priceMax", v)} placeholder="∞" />
          </div>
        </div>
      </FilterSection>

      {/* 5 Oda */}
      <FilterSection label="Oda Sayısı" count={value.rooms.length}>
        <MultiSelect options={ROOM_COUNTS} value={value.rooms} onChange={(v) => set("rooms", v)} />
      </FilterSection>

      {/* 6 m² */}
      <FilterSection
        label="Alan (m²)"
        count={
          (value.grossMin != null || value.grossMax != null ? 1 : 0) +
          (value.netMin != null || value.netMax != null ? 1 : 0)
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Brüt min" value={value.grossMin} onChange={(v) => set("grossMin", v)} />
          <NumField label="Brüt maks" value={value.grossMax} onChange={(v) => set("grossMax", v)} />
          <NumField label="Net min" value={value.netMin} onChange={(v) => set("netMin", v)} />
          <NumField label="Net maks" value={value.netMax} onChange={(v) => set("netMax", v)} />
        </div>
      </FilterSection>

      {/* 7-10 Gelişmiş (kategori-duyarlı): bina yaşı, ısıtma, otopark, asansör, balkon,
          mutfak, kullanım durumu, tapu durumu… */}
      {attrs.length > 0 && (
        <FilterSection
          label="Detaylı Özellikler"
          count={Object.values(value.attrs).filter((v) => v !== "" && v !== false && v != null).length}
        >
          <div className="space-y-3">
            {attrs.map((a) =>
              a.type === "boolean" ? (
                <div key={a.key} className="flex items-center justify-between gap-2">
                  <Label className="text-xs text-secondary-foreground">{a.label}</Label>
                  <Switch
                    checked={value.attrs[a.key] === true}
                    onCheckedChange={(c) => setAttr(a.key, c)}
                  />
                </div>
              ) : (
                <div key={a.key} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{a.label}</Label>
                  <Select
                    value={(value.attrs[a.key] as string) ?? ANY}
                    onValueChange={(v) => setAttr(a.key, v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Farketmez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ANY}>Farketmez</SelectItem>
                      {a.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            )}
          </div>
        </FilterSection>
      )}

      {/* Özellikler (manzara / muhit / iç-dış) */}
      <FilterSection label="Özellikler" count={value.features.length}>
        <FeatureMultiSelect value={value.features} onChange={(v) => set("features", v)} />
      </FilterSection>

      {/* Gizlilik & Erişim */}
      <FilterSection label="Erişim" count={value.mode ? 1 : 0}>
        <div className="flex flex-wrap gap-1.5">
          <SegBtn
            active={value.mode === "controlled"}
            onClick={() => set("mode", value.mode === "controlled" ? null : "controlled")}
          >
            Detay Talebi Açık
          </SegBtn>
          <SegBtn
            active={value.mode === "call_only"}
            onClick={() => set("mode", value.mode === "call_only" ? null : "call_only")}
          >
            Kapalı Portföy
          </SegBtn>
        </div>
      </FilterSection>
    </>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-gold/40 bg-gold/10 text-gold"
          : "border-border bg-surface-2 text-secondary-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    </div>
  );
}