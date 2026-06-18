import { Link } from "@tanstack/react-router";
import {
  MapPin,
  BedDouble,
  Ruler,
  LandPlot,
  Bath,
  Car,
  Bookmark,
  Share2,
  Send,
  ArrowRight,
} from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { formatNumber, formatPrice, portfolioTypeLabels } from "@/lib/format";
import { FeatureChip, LockedBadge } from "./badges";
import { Button } from "@/components/ui/button";

/** Derived catalog feature chips, WhatsApp-catalog style. */
function featureChips(p: Portfolio): string[] {
  const has = (kw: string) =>
    p.features.some((f) => f.toLocaleLowerCase("tr").includes(kw.toLocaleLowerCase("tr"))) ||
    p.tags.some((t) => t.toLocaleLowerCase("tr").includes(kw.toLocaleLowerCase("tr")));
  const chips: string[] = [];
  if (has("deniz")) chips.push("Deniz Manzarası");
  if (has("havuz")) chips.push("Havuzlu");
  if (has("müstakil") || p.type === "villa") chips.push("Müstakil");
  if (p.documents.some((d) => d.type === "pdf")) chips.push("PDF Hazır");
  return chips;
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BedDouble;
  value: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-secondary-foreground">
      <Icon className="size-3.5 text-gold/70" />
      <span className="font-medium text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

/**
 * Dense, WhatsApp-catalog style portfolio list item for a professional profile.
 * Compact thumbnail on the left, scannable details in the middle, price +
 * quick actions on the right.
 */
export function ProfessionalPortfolioListItem({
  portfolio,
  saved,
  onToggleSave,
  onRequestDetail,
}: {
  portfolio: Portfolio;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onRequestDetail: (p: Portfolio) => void;
}) {
  const chips = featureChips(portfolio);
  const locked = portfolio.locationMode !== "exact_visible";

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-border bg-surface-2/40 p-3 transition-colors hover:border-gold/40 sm:flex-row">
      <Link
        to="/dashboard/portfolios/$id"
        params={{ id: portfolio.id }}
        className="relative shrink-0 overflow-hidden rounded-lg"
      >
        <img
          src={portfolio.coverImage}
          alt={portfolio.title}
          loading="lazy"
          className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-28"
        />
        {locked && (
          <span className="absolute left-1.5 top-1.5">
            <LockedBadge label="Konum" />
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to="/dashboard/portfolios/$id" params={{ id: portfolio.id }}>
              <h4 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-gold">
                {portfolio.title}
              </h4>
            </Link>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3 text-gold" />
              <span className="truncate">{portfolio.regionLabel}</span>
              <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] text-secondary-foreground">
                {portfolioTypeLabels[portfolio.type]}
              </span>
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-base font-semibold text-gold">
              {formatPrice(portfolio.price, portfolio.currency)}
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {portfolio.rooms && <Stat icon={BedDouble} value={portfolio.rooms} label="oda" />}
          {portfolio.grossM2 && (
            <Stat icon={Ruler} value={`${formatNumber(portfolio.grossM2)}`} label="m² brüt" />
          )}
          {portfolio.landM2 && (
            <Stat icon={LandPlot} value={`${formatNumber(portfolio.landM2)}`} label="m² arsa" />
          )}
          {portfolio.bathrooms != null && (
            <Stat icon={Bath} value={String(portfolio.bathrooms)} label="banyo" />
          )}
          {portfolio.parkingCapacity != null && (
            <Stat icon={Car} value={String(portfolio.parkingCapacity)} label="otopark" />
          )}
        </div>

        {/* Feature chips */}
        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {chips.map((c) => (
              <FeatureChip key={c} label={c} className="bg-surface-3" />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Button
            asChild
            size="sm"
            className="h-8 gap-1 bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <Link to="/dashboard/portfolios/$id" params={{ id: portfolio.id }}>
              Portföyü Gör <ArrowRight className="size-3.5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => onRequestDetail(portfolio)}
          >
            <Send className="size-3.5 text-gold" /> Detay Talep Et
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 gap-1", saved && "text-gold")}
            onClick={() => onToggleSave(portfolio.id)}
          >
            <Bookmark className={cn("size-3.5", saved && "fill-gold")} />
            {saved ? "Kaydedildi" : "Kaydet"}
          </Button>
          <Button asChild variant="ghost" size="icon" className="size-8">
            <Link
              to="/dashboard/portfolios/$id/share"
              params={{ id: portfolio.id }}
              aria-label="Paylaş"
            >
              <Share2 className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
