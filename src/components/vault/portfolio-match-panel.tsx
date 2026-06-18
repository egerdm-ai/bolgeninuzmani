import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Target } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { getMatchingSearchesForPortfolio } from "@/lib/mock/matching";
import { SurfaceCard } from "./cards";
import { Button } from "@/components/ui/button";
import { featureFlags } from "@/lib/feature-flags";

export function PortfolioMatchPanel({
  portfolio,
  mode,
}: {
  portfolio: Portfolio;
  mode: "public" | "member" | "owner";
}) {
  // Arayış/Eşleşme deferred (D18) — hide the match panel until enabled.
  if (!featureFlags.arayis && !featureFlags.matches) return null;
  const searches = getMatchingSearchesForPortfolio(portfolio);
  if (mode === "public" || searches.length === 0) return null;

  return (
    <SurfaceCard className="border-gold/30 bg-gold/[0.05] p-0">
      <div className="flex items-center gap-1.5 border-b border-gold/20 px-4 py-3">
        <Target className="size-4 text-gold" />
        <h3 className="text-sm font-semibold text-foreground">Eşleşme Paneli</h3>
      </div>
      <div className="p-4">
        <p className="text-sm text-secondary-foreground">
          {mode === "owner" ? "Bu portföy " : "Bu portföy ağda "}
          <span className="font-semibold text-gold">{searches.length} aktif arayışla</span>{" "}
          eşleşiyor.
        </p>
        <ul className="mt-3 space-y-2">
          {searches.slice(0, 3).map((s) => (
            <li key={s.id}>
              <Link
                to="/dashboard/searches/$id"
                params={{ id: s.id }}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm transition-colors hover:border-gold/40"
              >
                <Sparkles className="size-3.5 shrink-0 text-gold" />
                <span className="min-w-0 flex-1 truncate text-secondary-foreground">{s.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{s.region}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Button
          asChild
          variant="outline"
          className="mt-3 w-full gap-1.5 border-gold/30 text-gold hover:bg-gold/10"
        >
          <Link to="/dashboard/searches">
            Eşleşmeleri Gör <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </SurfaceCard>
  );
}
