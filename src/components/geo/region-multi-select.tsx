import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Combo } from "./region-select";
import { listProvinces, listDistricts, listNeighborhoods } from "@/lib/geo";

/**
 * Multi-region picker (İl → İlçe → opsiyonel Mahalle → "Ekle" → chip listesi).
 * Pure selection, canonical names only (no free text). Emits a string[] of the
 * most-specific selected region name (mahalle ?? ilçe), matching the existing
 * string[] columns (profiles.expertise_regions, searches mahalle). Reused later by
 * profil uzmanlık bölgeleri, arayış mahalle (multi) ve filtreler (Faz 2+).
 *
 * Pairs with the single-pick `RegionSelect` (same geo dataset + Combo) — the two
 * variants the plan's 1.1 calls for.
 */
export function RegionMultiSelect({
  value,
  onChange,
  className,
  max,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  className?: string;
  /** Optional upper bound (e.g. cap a search to N neighborhoods). */
  max?: number;
}) {
  const [city, setCity] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loadingN, setLoadingN] = useState(false);

  const provinces = useMemo(() => listProvinces().map((p) => p.name), []);
  const districts = useMemo(() => (city ? listDistricts(city).map((d) => d.name) : []), [city]);

  useEffect(() => {
    if (!city || !district) {
      setNeighborhoods([]);
      setNeighborhood(null);
      return;
    }
    let active = true;
    setLoadingN(true);
    listNeighborhoods(city, district)
      .then((n) => active && setNeighborhoods(n))
      .catch(() => active && setNeighborhoods([]))
      .finally(() => active && setLoadingN(false));
    return () => {
      active = false;
    };
  }, [city, district]);

  const atMax = max != null && value.length >= max;
  // The most-specific selected level becomes the chip (mahalle, else ilçe).
  const candidate = neighborhood ?? district;
  const canAdd = !!candidate && !value.includes(candidate) && !atMax;

  const add = () => {
    if (!candidate || !canAdd) return;
    onChange([...value, candidate]);
    setNeighborhood(null);
  };
  const remove = (r: string) => onChange(value.filter((x) => x !== r));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <Field label="İl">
          <Combo
            value={city}
            placeholder="İl seçin"
            options={provinces}
            onSelect={(c) => {
              setCity(c);
              setDistrict(null);
              setNeighborhood(null);
            }}
          />
        </Field>
        <Field label="İlçe">
          <Combo
            value={district}
            placeholder={city ? "İlçe seçin" : "Önce il"}
            options={districts}
            disabled={!city}
            onSelect={(d) => {
              setDistrict(d);
              setNeighborhood(null);
            }}
          />
        </Field>
        <Field label="Mahalle (opsiyonel)">
          <Combo
            value={neighborhood}
            placeholder={district ? "Mahalle seçin" : "Önce ilçe"}
            options={neighborhoods}
            disabled={!district}
            loading={loadingN}
            emptyText="Mahalle bulunamadı"
            onSelect={(n) => setNeighborhood(n)}
          />
        </Field>
        <div className="flex items-end">
          <button
            type="button"
            onClick={add}
            disabled={!canAdd}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-gold/40 px-3 text-sm text-gold transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" /> Ekle
          </button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold"
            >
              {r}
              <button
                type="button"
                onClick={() => remove(r)}
                aria-label={`${r} kaldır`}
                className="text-gold/70 hover:text-gold"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {atMax && (
        <p className="text-[11px] text-muted-foreground">En fazla {max} bölge seçilebilir.</p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
