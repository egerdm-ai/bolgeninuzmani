import { MapPin, TrendingUp, Clock, Activity, Tag } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { getMarketContext } from "@/lib/mock/insights";
import { cn } from "@/lib/utils";

const demandStyles = {
  high: "bg-success/15 text-success ring-success/25",
  medium: "bg-gold/15 text-gold ring-gold/30",
  low: "bg-muted text-muted-foreground ring-border",
} as const;

export function MarketContextCard({ portfolio, className }: { portfolio: Portfolio; className?: string }) {
  const m = getMarketContext(portfolio);
  const rows = [
    { icon: MapPin, label: "Bölge", value: m.region },
    { icon: Tag, label: "Benzer portföy aralığı", value: m.similarRange },
    { icon: Clock, label: "Son güncelleme", value: m.lastUpdated },
  ];
  return (
    <div className={cn("rounded-2xl border border-border bg-gradient-surface p-0 shadow-elegant", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="size-4 text-gold" />
          <h3 className="text-sm font-semibold text-foreground">Piyasa Bağlamı</h3>
        </div>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          Tahmini
        </span>
      </div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <r.icon className="size-3.5 text-gold" /> {r.label}
            </span>
            <span className="truncate text-sm font-medium text-foreground">{r.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="size-3.5 text-gold" /> Talep yoğunluğu
          </span>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", demandStyles[m.demandLevel])}>
            {m.demandLabel}
          </span>
        </div>
      </div>
      <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        Değerler tahmini ve bilgilendirme amaçlıdır. Gerçek değerleme içermez.
      </p>
    </div>
  );
}
