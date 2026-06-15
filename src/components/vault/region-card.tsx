import { Link } from "@tanstack/react-router";
import { MapPin, FolderLock, Search, Users, TrendingUp, ArrowRight, Bell, BellOff } from "lucide-react";
import type { Region } from "@/lib/mock/types";
import { FeatureChip } from "./badges";
import { Button } from "@/components/ui/button";
import { useRegionWatch } from "@/lib/region-watch-store";

const demandLabel: Record<Region["demandLevel"], { label: string; cls: string }> = {
  high: { label: "Yüksek talep", cls: "text-success" },
  medium: { label: "Orta talep", cls: "text-gold" },
  low: { label: "Düşük talep", cls: "text-muted-foreground" },
};

export function RegionCard({ region }: { region: Region }) {
  const d = demandLabel[region.demandLevel];
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-gold">
      {/* Mock map header */}
      <div className="relative h-24 overflow-hidden border-b border-border bg-surface-2">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, color-mix(in oklab, var(--gold) 25%, transparent), transparent 55%), linear-gradient(135deg, var(--surface-2), var(--surface-3))",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_60%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_60%,transparent)_1px,transparent_1px)] bg-[size:22px_22px] opacity-40" />
        <span
          className="absolute size-3 rounded-full bg-gold ring-4 ring-gold/20"
          style={{ left: `${region.mapX}%`, top: `${region.mapY}%` }}
        />
        <div className="absolute bottom-2 left-3">
          <h3 className="font-display text-lg font-semibold text-foreground">{region.name}</h3>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3 text-gold" /> {region.city}
          </p>
        </div>
        <span className={`absolute right-3 top-3 flex items-center gap-1 text-[11px] font-medium ${d.cls}`}>
          <TrendingUp className="size-3" /> {d.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-xs text-muted-foreground">{region.blurb}</p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat icon={FolderLock} value={region.activePortfolios} label="Portföy" />
          <Stat icon={Search} value={region.buyerSearchCount} label="Arayış" />
          <Stat icon={Users} value={region.expertCount} label="Uzman" />
        </div>

        <div className="mt-3 rounded-lg border border-border bg-surface-2 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Ortalama aralık</p>
          <p className="font-display text-sm font-semibold text-gold">{region.priceRange}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {region.topFeatures.slice(0, 3).map((f) => (
            <FeatureChip key={f} label={f} />
          ))}
        </div>

        <Button asChild className="mt-4 w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Link to="/dashboard/regions/$slug" params={{ slug: region.slug }}>
            Bölgeyi Gör <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <div className="rounded-lg bg-surface-2 px-2 py-2 text-center">
      <Icon className="mx-auto size-3.5 text-gold" />
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
