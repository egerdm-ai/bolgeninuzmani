import { MapPin, ArrowRight, FolderLock, Sparkles } from "lucide-react";
import type { RegionExpertise } from "@/lib/mock/types";
import { SurfaceCard } from "./cards";
import { FeatureChip, CategoryChip } from "./badges";

/**
 * Region expertise card shown on the professional profile. Displays active
 * portfolio count, match count, primary property types and a mini location
 * indicator. Clicking the CTA filters the portfolio showcase to this region.
 */
export function ExpertiseRegionCard({
  region,
  onFocus,
}: {
  region: RegionExpertise & { matchCount?: number };
  onFocus: (region: string) => void;
}) {
  const matchCount = region.matchCount ?? Math.round(region.portfolioCount * 3.5 + 4);

  return (
    <SurfaceCard className="p-4" hover>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
            <MapPin className="size-4 text-gold" /> {region.region}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {region.primaryTypes.map((t) => (
              <FeatureChip key={t} label={t} />
            ))}
          </div>
        </div>
        {/* Mini map preview mock */}
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, oklch(0.78 0.12 85 / 0.25), transparent 55%), linear-gradient(135deg, oklch(0.22 0.02 250), oklch(0.16 0.02 250))",
            }}
          />
          <span
            className="absolute size-2 rounded-full bg-gold ring-2 ring-surface"
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5">
          <FolderLock className="size-3.5 text-gold" />
          <div>
            <div className="text-sm font-semibold text-foreground">{region.portfolioCount}</div>
            <div className="text-[10px] text-muted-foreground">Aktif Portföy</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5">
          <Sparkles className="size-3.5 text-gold" />
          <div>
            <div className="text-sm font-semibold text-foreground">{matchCount}</div>
            <div className="text-[10px] text-muted-foreground">Eşleşme</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onFocus(region.region)}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold/80"
      >
        Bu bölgedeki portföyleri gör <ArrowRight className="size-3" />
      </button>
    </SurfaceCard>
  );
}

export { CategoryChip };
