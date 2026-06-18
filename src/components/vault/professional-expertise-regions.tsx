import { MapPin, ArrowRight, FolderLock, Sparkles, Search, Award } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Professional, RegionExpertise } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { SurfaceCard } from "./cards";
import { regionSlugForName } from "@/lib/mock/matching";

/**
 * "Uzmanlık Bölgeleri" — clean, scannable list. Each row shows the region,
 * a "Bölge Uzmanı" badge, portfolio / search / match counts and quick links.
 */
export function ProfessionalExpertiseRegions({
  professional,
  activeRegion,
  onFocusRegion,
}: {
  professional: Professional;
  activeRegion: string | null;
  onFocusRegion: (region: string) => void;
}) {
  const regions = [...professional.regionExpertise].sort(
    (a, b) => b.portfolioCount - a.portfolioCount,
  );

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Uzmanlık Bölgeleri</h2>
        <p className="text-sm text-muted-foreground">
          Bu profesyonel{" "}
          <span className="font-medium text-gold">
            {professional.regionListCount} bölge listesinde
          </span>{" "}
          yer alıyor. Bir bölgeye tıklayarak portföyleri filtreleyin.
        </p>
      </div>

      <SurfaceCard className="divide-y divide-border p-0">
        {regions.map((r) => (
          <RegionRow
            key={r.region}
            region={r}
            active={activeRegion === r.region}
            onFocus={onFocusRegion}
          />
        ))}
      </SurfaceCard>
    </section>
  );
}

function RegionRow({
  region,
  active,
  onFocus,
}: {
  region: RegionExpertise & { matchCount?: number; searchCount?: number };
  active: boolean;
  onFocus: (region: string) => void;
}) {
  const matchCount = region.matchCount ?? Math.round(region.portfolioCount * 3.5 + 4);
  const searchCount = region.searchCount ?? Math.max(1, Math.round(region.portfolioCount * 0.6));
  const slug = regionSlugForName(region.region);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 px-4 py-3.5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-2",
        active && "bg-gold/[0.06]",
      )}
    >
      {/* Region pin + name */}
      <div className="flex min-w-[180px] flex-1 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-gold ring-1 ring-inset ring-gold/20">
          <MapPin className="size-4.5" />
        </span>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 truncate font-semibold text-foreground">
            {region.region}
          </h3>
          <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-gold">
            <Award className="size-3" /> Bölge Uzmanı
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5">
        <Stat icon={FolderLock} value={region.portfolioCount} label="Portföy" />
        <Stat icon={Search} value={searchCount} label="Arayış" />
        <Stat icon={Sparkles} value={matchCount} label="Eşleşme" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onFocus(region.region)}
          className="inline-flex items-center gap-1 text-xs font-medium text-gold transition-colors hover:text-gold/80"
        >
          Portföyleri Gör <ArrowRight className="size-3" />
        </button>
        {slug && (
          <Link
            to="/dashboard/regions/$slug"
            params={{ slug }}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Bölge <ArrowRight className="size-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof FolderLock;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
        <Icon className="size-3.5 text-gold" /> {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}
