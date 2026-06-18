import { Database, Check, AlertCircle } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { getPortfolioDataScore, dataScoreLabels } from "@/lib/mock/insights";
import { cn } from "@/lib/utils";

const levelStyles = {
  high: {
    ring: "text-success",
    track: "text-success/15",
    badge: "bg-success/15 text-success ring-success/25",
  },
  medium: { ring: "text-gold", track: "text-gold/15", badge: "bg-gold/15 text-gold ring-gold/30" },
  low: {
    ring: "text-warning",
    track: "text-warning/15",
    badge: "bg-warning/15 text-warning ring-warning/25",
  },
} as const;

export function DataScoreRing({
  score,
  level,
  size = 56,
}: {
  score: number;
  level: "low" | "medium" | "high";
  size?: number;
}) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const styles = levelStyles[level];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={5}
          fill="none"
          className={cn("stroke-current", styles.track)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
          className={cn("stroke-current transition-all", styles.ring)}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-sm font-bold",
          styles.ring,
        )}
      >
        {score}
      </span>
    </div>
  );
}

export function DataScoreCard({
  portfolio,
  className,
}: {
  portfolio: Portfolio;
  className?: string;
}) {
  const ds = getPortfolioDataScore(portfolio);
  const styles = levelStyles[ds.level];
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-gradient-surface p-4 shadow-elegant",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <DataScoreRing score={ds.score} level={ds.level} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Database className="size-3.5 text-gold" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Portföy Veri Skoru
            </p>
          </div>
          <p className="mt-1 text-sm text-secondary-foreground">
            Veri tamlığı seviyesi:{" "}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
                styles.badge,
              )}
            >
              {dataScoreLabels[ds.level]}
            </span>
          </p>
        </div>
      </div>

      {ds.missing.length > 0 ? (
        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <AlertCircle className="size-3 text-warning" /> Eksik alanlar
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ds.missing.slice(0, 5).map((m) => (
              <span
                key={m}
                className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-secondary-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-success">
          <Check className="size-3.5" /> Tüm temel alanlar tamamlandı.
        </div>
      )}
    </div>
  );
}
