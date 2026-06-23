import { cn } from "@/lib/utils";
import { ToggleChip } from "@/components/ui/multi-select";
import { FEATURE_GROUPS } from "@/lib/portfolio-features";

/**
 * Grouped feature picker (Faz 1.4) — replaces the "Özellikler (virgülle)" text box
 * with İç/Dış/Muhit/Manzara chip groups over the canonical feature list. Emits a
 * flat string[] for the portfolios.features column (value === label, so it matches
 * the existing Keşfet contains-filter). Pure UI; parent owns the value.
 */
export function FeatureMultiSelect({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  className?: string;
}) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className={cn("space-y-4", className)}>
      {FEATURE_GROUPS.map((g) => (
        <div key={g.id} className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {g.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {g.options.map((o) => (
              <ToggleChip
                key={o.value}
                active={value.includes(o.value)}
                onClick={() => toggle(o.value)}
              >
                {o.label}
              </ToggleChip>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
