import { MapPin, ArrowRight, FolderLock, Sparkles, Search, Award } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { RegionExpertise } from "@/lib/mock/types";
import { SurfaceCard } from "./cards";
import { FeatureChip, CategoryChip } from "./badges";
import { regionSlugForName } from "@/lib/mock/matching";

/**
 * Region expertise card shown on the professional profile. Displays active
 * portfolio count, active buyer-search count, match count, primary property
 * types and a "Bölge Uzmanı" badge. "Bu Bölgedeki Portföyleri Gör" filters the
 * catalog; "Bölgeyi Gör" navigates to the region page when it exists.
 */
export function ExpertiseRegionCard({
  region,
  onFocus,
}: {
  region: RegionExpertise & { matchCount?: number; searchCount?: number };
  onFocus: (region: string) => void;
}) {
  const matchCount = region.matchCount ?? Math.round(region.portfolioCount * 3.5 + 4);
  const searchCount = region.searchCount ?? Math.max(1, Math.round(region.portfolioCount * 0.6));
  const slug = regionSlugForName(region.region);

  return (
    <SurfaceCard className="p-4" hover>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
            <MapPin className="size-4 text-gold" /> {region.region}
          </h3>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold ring-1 ring-inset ring-gold/30">
            <Award className="size-3" /> Bölge Uzmanı
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
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

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Mini icon={FolderLock} value={region.portfolioCount} label="Portföy" />
        <Mini icon={Search} value={searchCount} label="Arayış" />
        <Mini icon={Sparkles} value={matchCount} label="Eşleşme" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <button
          onClick={() => onFocus(region.region)}
          className="inline-flex items-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold/80"
        >
          Bu Bölgedeki Portföyleri Gör <ArrowRight className="size-3" />
        </button>
        {slug && (
          <Link
            to="/dashboard/regions/$slug"
            params={{ slug }}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Bölgeyi Gör <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
    </SurfaceCard>
  );
}

function Mini({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof FolderLock;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-surface-2 px-2 py-1.5 text-center">
      <Icon className="mx-auto size-3.5 text-gold" />
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

export { CategoryChip };
