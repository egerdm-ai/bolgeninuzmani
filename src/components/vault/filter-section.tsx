import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { FieldDef, FilterValue } from "@/lib/taxonomy";

// ---------------------------------------------------------------------------
// Collapsible filter section
// ---------------------------------------------------------------------------

export function FilterSection({
  label,
  count,
  defaultOpen = false,
  children,
}: {
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-surface-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {label}
          {!!count && count > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-gold/15 text-[10px] font-bold text-gold ring-1 ring-inset ring-gold/30">
              {count}
            </span>
          )}
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-3 border-t border-border px-3.5 py-3">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic field renderer driven by FieldDef + filter state
// ---------------------------------------------------------------------------

export function FilterField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: FilterValue;
  onChange: (key: string, value: FilterValue) => void;
}) {
  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-secondary-foreground">{field.label}</Label>
        <Switch checked={!!value} onCheckedChange={(c) => onChange(field.key, c)} />
      </div>
    );
  }

  if (field.type === "multiselect") {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (v: string) =>
      onChange(field.key, selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{field.label}</Label>
        <div className="flex flex-wrap gap-1.5">
          {field.options?.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                selected.includes(o.value)
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-border bg-surface-3 text-secondary-foreground hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{field.label}</Label>
        <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(field.key, v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Seçin" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // text / number
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {field.label}
        {field.unit ? ` (${field.unit})` : ""}
      </Label>
      <Input
        className="h-9"
        type={field.type === "number" ? "number" : "text"}
        inputMode={field.type === "number" ? "numeric" : undefined}
        value={(value as string | number | undefined) ?? ""}
        onChange={(e) =>
          onChange(field.key, field.type === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value)
        }
      />
    </div>
  );
}

export function FilterFieldGrid({
  fields,
  state,
  onChange,
}: {
  fields: FieldDef[];
  state: Record<string, FilterValue>;
  onChange: (key: string, value: FilterValue) => void;
}) {
  const booleans = fields.filter((f) => f.type === "boolean");
  const rest = fields.filter((f) => f.type !== "boolean");
  return (
    <>
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {rest.map((f) => (
            <div key={f.key} className={cn(f.type === "multiselect" && "col-span-2")}>
              <FilterField field={f} value={state[f.key]} onChange={onChange} />
            </div>
          ))}
        </div>
      )}
      {booleans.length > 0 && (
        <div className="grid grid-cols-1 gap-2 rounded-lg bg-surface-3/50 p-2.5 sm:grid-cols-2">
          {booleans.map((f) => (
            <FilterField key={f.key} field={f} value={state[f.key]} onChange={onChange} />
          ))}
        </div>
      )}
    </>
  );
}
