import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABELS, subcategoriesForCategory } from "@/lib/portfolio-labels";
import type { Database } from "@/lib/database.types";

type Category = Database["public"]["Enums"]["portfolio_category"];

export type CategoryValue = { category: Category; subcategory: string | null };

/**
 * Canonical category → dependent subcategory picker (Faz 1.2). Category comes from
 * the DB enum (CATEGORY_LABELS); subcategory options follow the chosen category and
 * reset when it changes. Reusable by yükleme / arayış / keşfet (Faz 2+). Pure UI —
 * parent owns the value.
 */
export function CategorySelect({
  value,
  onChange,
  className,
}: {
  value: CategoryValue;
  onChange: (v: CategoryValue) => void;
  className?: string;
}) {
  const subs = subcategoriesForCategory(value.category);

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <Field label="Kategori">
        <Select
          value={value.category}
          onValueChange={(c) => onChange({ category: c as Category, subcategory: null })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Alt Kategori">
        <Select
          value={value.subcategory ?? ""}
          onValueChange={(s) => onChange({ ...value, subcategory: s })}
          disabled={subs.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={subs.length ? "Alt kategori seçin" : "—"} />
          </SelectTrigger>
          <SelectContent>
            {subs.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
