import { Link } from "@tanstack/react-router";
import { Bookmark, MapPin, BedDouble, Maximize, Bath } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { formatNumber, formatPrice, portfolioTypeLabels, statusLabels, statusTones } from "@/lib/format";
import { FeatureChip, LockedBadge, StatusBadge } from "./badges";

export function PortfolioCard({
  portfolio,
  saved,
  onToggleSave,
  className,
}: {
  portfolio: Portfolio;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-surface shadow-elegant transition-all hover:-translate-y-1 hover:border-border-strong hover:shadow-gold",
        className,
      )}
    >
      <Link to="/p/$slug" params={{ slug: portfolio.slug }} className="relative block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={portfolio.coverImage}
            alt={portfolio.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex gap-2">
            <StatusBadge label={statusLabels[portfolio.status]} tone={statusTones[portfolio.status]} />
            {portfolio.requestRequired && <LockedBadge label="Detay Kilitli" />}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleSave?.(portfolio.id);
            }}
            className={cn(
              "absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg bg-background/70 ring-1 ring-inset ring-border-strong backdrop-blur transition-colors hover:bg-background",
              saved ? "text-gold" : "text-secondary-foreground",
            )}
            aria-label="Kaydet"
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
          </button>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-gold" />
          <span>~{portfolio.regionLabel}</span>
          <span className="ml-auto rounded bg-surface-3 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
            {portfolioTypeLabels[portfolio.type]}
          </span>
        </div>
        <Link to="/p/$slug" params={{ slug: portfolio.slug }}>
          <h3 className="mt-2 line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-gold">
            {portfolio.title}
          </h3>
        </Link>
        <div className="mt-2 font-display text-xl font-semibold text-gold">
          {formatPrice(portfolio.price, portfolio.currency)}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-secondary-foreground">
          {portfolio.rooms && (
            <span className="flex items-center gap-1"><BedDouble className="size-3.5 text-muted-foreground" />{portfolio.rooms}</span>
          )}
          {portfolio.grossM2 && (
            <span className="flex items-center gap-1"><Maximize className="size-3.5 text-muted-foreground" />{formatNumber(portfolio.grossM2)} m²</span>
          )}
          {portfolio.bathrooms && (
            <span className="flex items-center gap-1"><Bath className="size-3.5 text-muted-foreground" />{portfolio.bathrooms}</span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {portfolio.features.slice(0, 3).map((f) => (
            <FeatureChip key={f} label={f} />
          ))}
        </div>
      </div>
    </div>
  );
}
