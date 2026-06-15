import { Link } from "@tanstack/react-router";
import { MapPin, Bookmark, Send, ShieldCheck, BadgeCheck } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FeatureChip } from "./badges";
import { KeyFactsStrip } from "./key-facts-strip";
import { BrokerAvatar } from "./broker-avatar";

export function PortfolioPreviewCard({
  portfolio,
  saved,
  onToggleSave,
  onRequestDetail,
  className,
}: {
  portfolio: Portfolio;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  onRequestDetail?: (p: Portfolio) => void;
  className?: string;
}) {
  const owner = portfolio.owner;
  const regionalExpert =
    owner.expertiseRegions.some(
      (r) => portfolio.neighborhood === r || portfolio.district === r || portfolio.regionLabel.includes(r),
    );

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface shadow-elegant", className)}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={portfolio.coverImage} alt={portfolio.title} loading="lazy" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-background/70 px-2 py-0.5 text-xs text-secondary-foreground ring-1 ring-inset ring-border-strong backdrop-blur">
          <MapPin className="size-3 text-gold" /> ~{portfolio.regionLabel}
        </span>
        <span className="absolute right-3 top-3 rounded bg-background/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-secondary-foreground ring-1 ring-inset ring-border-strong backdrop-blur">
          {portfolioTypeLabels[portfolio.type]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold text-foreground">{portfolio.title}</h3>
        <div className="mt-1.5 font-display text-2xl font-semibold text-gold">
          {formatPrice(portfolio.price, portfolio.currency)}
        </div>

        {/* Owner identity */}
        <Link
          to="/dashboard/professionals/$id"
          params={{ id: owner.id }}
          className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-2 transition-colors hover:border-border-strong"
        >
          <BrokerAvatar name={owner.fullName} src={owner.avatarUrl || undefined} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate text-xs font-semibold text-foreground">{owner.fullName}</span>
              <ShieldCheck className="size-3 shrink-0 text-gold" />
            </div>
            {regionalExpert ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-gold">
                <BadgeCheck className="size-3" /> Bu bölgede uzman
              </span>
            ) : (
              <span className="truncate text-[11px] text-muted-foreground">{owner.companyName}</span>
            )}
          </div>
          <span className="ml-auto shrink-0 text-[11px] font-medium text-gold">Profili Gör</span>
        </Link>

        <KeyFactsStrip portfolio={portfolio} className="mt-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {portfolio.features.slice(0, 4).map((f) => (
            <FeatureChip key={f} label={f} />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90" onClick={() => onRequestDetail?.(portfolio)}>
            <Send className="size-4" /> Detay Talebi Gönder
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onToggleSave?.(portfolio.id)}
            className={cn(saved && "border-gold/40 text-gold")}
            aria-label="Kaydet"
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
          </Button>
        </div>
      </div>
    </div>
  );
}
