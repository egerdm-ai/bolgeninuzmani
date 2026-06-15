import { BedDouble, Maximize, Bath, Trees, Car } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function KeyFactsStrip({
  portfolio,
  className,
}: {
  portfolio: Portfolio;
  className?: string;
}) {
  const facts = [
    portfolio.rooms && { icon: BedDouble, label: "Oda", value: portfolio.rooms },
    portfolio.grossM2 && { icon: Maximize, label: "Kapalı Alan", value: `${formatNumber(portfolio.grossM2)} m²` },
    portfolio.bathrooms && { icon: Bath, label: "Banyo", value: String(portfolio.bathrooms) },
    portfolio.landM2 && { icon: Trees, label: "Arsa Alanı", value: `${formatNumber(portfolio.landM2)} m²` },
    portfolio.parkingCapacity && { icon: Car, label: "Otopark", value: String(portfolio.parkingCapacity) },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string; value: string }[];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {facts.map((f) => (
        <div key={f.label} className="flex flex-col gap-1 bg-surface-2 px-4 py-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <f.icon className="size-3.5 text-gold" />
            {f.label}
          </span>
          <span className="text-sm font-semibold text-foreground">{f.value}</span>
        </div>
      ))}
    </div>
  );
}
