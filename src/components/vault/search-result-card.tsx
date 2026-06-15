import { Link } from "@tanstack/react-router";
import { MapPin, BedDouble, Maximize, Bath, ShieldCheck, BadgeCheck, Send, Bookmark } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { formatNumber, formatPrice, portfolioTypeLabels } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrokerAvatar } from "./broker-avatar";
import { LockedBadge } from "./badges";

export function SearchResultCard({
  portfolio,
  selected,
  saved,
  onSelect,
  onHover,
  onToggleSave,
  onRequestDetail,
}: {
  portfolio: Portfolio;
  selected?: boolean;
  saved?: boolean;
  onSelect?: (p: Portfolio) => void;
  onHover?: (p: Portfolio | null) => void;
  onToggleSave?: (id: string) => void;
  onRequestDetail?: (p: Portfolio) => void;
}) {
  const owner = portfolio.owner;
  const regionalExpert = owner.expertiseRegions.some(
    (r) => portfolio.neighborhood === r || portfolio.district === r || portfolio.regionLabel.includes(r),
  );

  return (
    <div
      onClick={() => onSelect?.(portfolio)}
      onMouseEnter={() => onHover?.(portfolio)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-2xl border bg-surface shadow-elegant transition-all hover:border-border-strong",
        selected ? "border-gold/50 shadow-gold" : "border-border",
      )}
    >
      <div className="flex gap-3 p-3">
        <Link
          to="/p/$slug"
          params={{ slug: portfolio.slug }}
          onClick={(e) => e.stopPropagation()}
          className="relative block size-28 shrink-0 overflow-hidden rounded-xl"
        >
          <img
            src={portfolio.coverImage}
            alt={portfolio.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {portfolio.requestRequired && (
            <span className="absolute left-1.5 top-1.5">
              <LockedBadge label="Kilitli" />
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <MapPin className="size-3 text-gold" /> ~{portfolio.regionLabel}
            <span className="ml-auto rounded bg-surface-3 px-1.5 py-0.5 uppercase tracking-wide">
              {portfolioTypeLabels[portfolio.type]}
            </span>
          </div>
          <Link
            to="/p/$slug"
            params={{ slug: portfolio.slug }}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          >
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-gold">
              {portfolio.title}
            </h3>
          </Link>
          <div className="mt-0.5 font-display text-lg font-semibold text-gold">
            {formatPrice(portfolio.price, portfolio.currency)}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-secondary-foreground">
            {portfolio.rooms && (
              <span className="flex items-center gap-1"><BedDouble className="size-3 text-muted-foreground" />{portfolio.rooms}</span>
            )}
            {portfolio.grossM2 && (
              <span className="flex items-center gap-1"><Maximize className="size-3 text-muted-foreground" />{formatNumber(portfolio.grossM2)} m²</span>
            )}
            {portfolio.bathrooms && (
              <span className="flex items-center gap-1"><Bath className="size-3 text-muted-foreground" />{portfolio.bathrooms}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(portfolio.id);
          }}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border-strong transition-colors hover:bg-surface-3",
            saved ? "text-gold" : "text-secondary-foreground",
          )}
          aria-label="Kaydet"
        >
          <Bookmark className={cn("size-4", saved && "fill-current")} />
        </button>
      </div>

      {/* Owner identity + CTAs */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
        <BrokerAvatar name={owner.fullName} src={owner.avatarUrl || undefined} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-xs font-semibold text-foreground">{owner.fullName}</span>
            <ShieldCheck className="size-3 shrink-0 text-gold" />
          </div>
          {regionalExpert ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-gold">
              <BadgeCheck className="size-3" /> Bölge Uzmanı
            </span>
          ) : (
            <span className="truncate text-[11px] text-muted-foreground">{owner.companyName}</span>
          )}
        </div>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px]"
          onClick={(e) => e.stopPropagation()}
        >
          <Link to="/dashboard/professionals/$id" params={{ id: owner.id }}>
            Profili Gör
          </Link>
        </Button>
        <Button
          size="sm"
          className="h-7 gap-1 bg-gradient-gold px-2 text-[11px] text-primary-foreground hover:opacity-90"
          onClick={(e) => {
            e.stopPropagation();
            onRequestDetail?.(portfolio);
          }}
        >
          <Send className="size-3" /> Detay Talep Et
        </Button>
      </div>
    </div>
  );
}
