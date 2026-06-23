import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY_OPTIONS } from "@/lib/portfolio-labels";
import type { Database } from "@/lib/database.types";

type Currency = Database["public"]["Enums"]["currency"];

const fmt = (n: number) => new Intl.NumberFormat("tr-TR").format(n);

/**
 * Price input with live thousand separators (Faz 1.5): typing 45000000 shows
 * "45.000.000" while the parent always receives the clean numeric value (or null).
 * Optionally renders a currency Select when `currency` + `onCurrencyChange` are
 * given (otherwise amount-only — e.g. arayış min/max). Reused by yükleme / arayış /
 * keşfet (Faz 2+). Pure UI; parent owns the value.
 */
export function PriceInput({
  value,
  onChange,
  currency,
  onCurrencyChange,
  placeholder = "0",
  id,
  className,
  disabled,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  currency?: Currency;
  onCurrencyChange?: (c: Currency) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}) {
  const display = value == null ? "" : fmt(value);
  const handle = (raw: string) => {
    const digits = raw.replace(/\D/g, ""); // keep digits only → numeric value stays correct
    onChange(digits === "" ? null : Number(digits));
  };
  const showCurrency = currency != null && onCurrencyChange != null;

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        value={display}
        onChange={(e) => handle(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      {showCurrency && (
        <Select
          value={currency}
          onValueChange={(c) => onCurrencyChange(c as Currency)}
          disabled={disabled}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCY_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
