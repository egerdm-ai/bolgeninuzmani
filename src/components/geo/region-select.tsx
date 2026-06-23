import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { listProvinces, listDistricts, listNeighborhoods, slugify } from "@/lib/geo";

export type RegionValue = {
  city: string | null;
  district: string | null;
  neighborhood: string | null;
};

const EMPTY: RegionValue = { city: null, district: null, neighborhood: null };

// Türkçe-aware fuzzy match so "kadi" finds "Kadıköy" (cmdk's default substring filter
// breaks on dotless-ı). Both sides slugified (ı→i, ş→s … + ascii fold).
const cmdFilter = (value: string, search: string) =>
  slugify(value).includes(slugify(search)) ? 1 : 0;

/**
 * Cascading searchable region picker (İl → İlçe → Mahalle). Pure selection — no free
 * text. Mahalle is optional + lazy-loaded. Canonical names only (D8/D20); coordinates
 * are derived server-side from the selection (D30), never here.
 */
export function RegionSelect({
  value = EMPTY,
  onChange,
  className,
}: {
  value?: RegionValue;
  onChange: (v: RegionValue) => void;
  className?: string;
}) {
  const provinces = useMemo(() => listProvinces().map((p) => p.name), []);
  const districts = useMemo(
    () => (value.city ? listDistricts(value.city).map((d) => d.name) : []),
    [value.city],
  );

  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loadingN, setLoadingN] = useState(false);

  useEffect(() => {
    if (!value.city || !value.district) {
      setNeighborhoods([]);
      return;
    }
    let active = true;
    setLoadingN(true);
    listNeighborhoods(value.city, value.district)
      .then((n) => active && setNeighborhoods(n))
      .catch(() => active && setNeighborhoods([]))
      .finally(() => active && setLoadingN(false));
    return () => {
      active = false;
    };
  }, [value.city, value.district]);

  // Legacy free-text values that aren't in the canonical lists (still shown, not lost).
  const cityUnknown = !!value.city && !provinces.includes(value.city);
  const districtUnknown =
    !!value.city && !!value.district && !cityUnknown && !districts.includes(value.district);

  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      <Field label="İl">
        <Combo
          value={value.city}
          placeholder="İl seçin"
          options={provinces}
          onSelect={(city) => onChange({ city, district: null, neighborhood: null })}
        />
      </Field>

      <Field label="İlçe">
        <Combo
          value={value.district}
          placeholder={value.city ? "İlçe seçin" : "Önce il"}
          options={districts}
          disabled={!value.city}
          onSelect={(district) => onChange({ ...value, district, neighborhood: null })}
        />
      </Field>

      <Field label="Mahalle (opsiyonel)">
        <Combo
          value={value.neighborhood}
          placeholder={value.district ? "Mahalle seçin" : "Önce ilçe"}
          options={neighborhoods}
          disabled={!value.district}
          loading={loadingN}
          emptyText="Mahalle bulunamadı"
          onSelect={(neighborhood) => onChange({ ...value, neighborhood })}
        />
      </Field>

      {(cityUnknown || districtUnknown) && (
        <p className="text-xs text-warning sm:col-span-3">
          Bu kayıt eski serbest-metin konum içeriyor — standart hale getirmek için yeniden seçin.
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function Combo({
  value,
  placeholder,
  options,
  onSelect,
  disabled,
  loading,
  emptyText = "Sonuç yok",
}: {
  value: string | null;
  placeholder: string;
  options: string[];
  onSelect: (v: string) => void;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-surface-2 px-3 text-sm transition-colors",
            "focus:border-gold/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            value ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[200px] border-border bg-surface p-0"
      >
        <Command filter={cmdFilter}>
          <CommandInput placeholder="Ara…" className="h-9" />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-gold" /> Yükleniyor…
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {options.map((o) => (
                    <CommandItem
                      key={o}
                      value={o}
                      onSelect={() => {
                        onSelect(o);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4 text-gold",
                          value === o ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {o}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
