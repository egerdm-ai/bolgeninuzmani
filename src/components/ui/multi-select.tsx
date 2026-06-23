import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable selectable chip (Faz 1.4). Shared by MultiSelect, FeatureMultiSelect
 * and the expertise-type picker so every multi-select surface looks identical.
 */
export function ToggleChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-gold/20 text-gold ring-1 ring-inset ring-gold/40"
          : "bg-surface-2 text-muted-foreground hover:text-foreground",
        disabled && !active && "cursor-not-allowed opacity-40",
      )}
    >
      {children}
    </button>
  );
}

export type MultiSelectOption = { value: string; label: string };

/**
 * Flat chip multi-select (Faz 1.4). value is a string[]; optional `maxSelect` caps
 * the count (unselected chips disable at the cap) — e.g. Cephe (max 3). Pure UI,
 * parent owns the value. For grouped feature sets use FeatureMultiSelect.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  maxSelect,
  className,
}: {
  options: MultiSelectOption[];
  value: string[];
  onChange: (v: string[]) => void;
  maxSelect?: number;
  className?: string;
}) {
  const atMax = maxSelect != null && value.length >= maxSelect;
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else if (!atMax) onChange([...value, v]);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = value.includes(o.value);
          return (
            <ToggleChip
              key={o.value}
              active={active}
              disabled={!active && atMax}
              onClick={() => toggle(o.value)}
            >
              {o.label}
            </ToggleChip>
          );
        })}
      </div>
      {maxSelect != null && (
        <p className="text-[11px] text-muted-foreground">
          {value.length}/{maxSelect} seçildi
        </p>
      )}
    </div>
  );
}
