import { Link } from "@tanstack/react-router";
import { Bookmark, MapPin, BedDouble, Maximize, Bath, ShieldCheck, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Portfolio } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { formatNumber, formatPrice, portfolioTypeLabels, statusLabels, statusTones } from "@/lib/format";
import { FeatureChip, LockedBadge, StatusBadge } from "./badges";
import { BrokerAvatar } from "./broker-avatar";
import { Button } from "@/components/ui/button";

export function PortfolioCard({
  portfolio,
  saved,
  onToggleSave,
  onRequestDetail,
  showOwner,
  className,
}: {
  portfolio: Portfolio;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  onRequestDetail?: (p: Portfolio) => void;
  showOwner?: boolean;
  className?: string;
}) {
  const sharePortfolio = () => {
    const path = `/p/${portfolio.slug}`;
    try {
      navigator.clipboard?.writeText(
        typeof window !== "undefined" ? `${window.location.origin}${path}` : path,
      );
    } catch {
      /* mock-only */
    }
    toast.success("Portföy bağlantısı kopyalandı", { description: path });
  };

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-elegant transition-all hover:-translate-y-1 hover:border-border-strong hover:shadow-gold",
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
      <div className="flex flex-1 flex-col p-4">
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

        {showOwner && (
          <Link
            to="/dashboard/professionals/$id"
            params={{ id: portfolio.owner.id }}
            className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-2 transition-colors hover:border-border-strong"
          >
            <BrokerAvatar name={portfolio.owner.fullName} src={portfolio.owner.avatarUrl || undefined} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="truncate text-xs font-semibold text-foreground">{portfolio.owner.fullName}</span>
                <ShieldCheck className="size-3 shrink-0 text-gold" />
              </div>
              <span className="truncate text-[11px] text-muted-foreground">{portfolio.owner.companyName}</span>
            </div>
            <span className="ml-auto shrink-0 text-[11px] font-medium text-gold">Profili Gör</span>
          </Link>
        )}

        {onRequestDetail && (
          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              onClick={() => onRequestDetail(portfolio)}
            >
              <Send className="size-3.5" /> Detay Talep Et
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={sharePortfolio} aria-label="Paylaş">
              <Share2 className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={cn(saved && "border-gold/40 text-gold")}
              onClick={() => onToggleSave?.(portfolio.id)}
              aria-label="Kaydet"
            >
              <Bookmark className={cn("size-3.5", saved && "fill-current")} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
