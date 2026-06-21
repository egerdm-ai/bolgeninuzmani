import { Link } from "@tanstack/react-router";
import { MapPin, BedDouble, Maximize, ShieldCheck, Send, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrokerAvatar } from "./broker-avatar";
import { ThumbImage } from "@/components/portfolio/thumb-image";
import { CoverPlaceholder } from "@/components/portfolio/cover-placeholder";
import { ClosedModeBadge, RefNoText } from "@/components/portfolio/portfolio-badges";
import { CATEGORY_LABELS, TRANSACTION_LABELS, formatPortfolioPrice } from "@/lib/portfolio-labels";
import type { PortfolioWithCover } from "@/lib/data/portfolios";

/**
 * Lovable Keşfet result card (horizontal: cover + details + save, then a detailed
 * agent footer) — reconnected to REAL teaser data. Links use context="app" → in-app
 * detail (where the Detay Talebi flow lives), NOT /p, so logged-in agents never hit the
 * public-page login loop. Teaser-only (no locked field).
 */
export function SearchResultCard({
  p,
  selected,
  saved,
  onSelect,
  onHover,
  onToggleSave,
}: {
  p: PortfolioWithCover;
  selected?: boolean;
  saved?: boolean;
  onSelect?: (p: PortfolioWithCover) => void;
  onHover?: (p: PortfolioWithCover | null) => void;
  onToggleSave?: (id: string) => void;
}) {
  const region = [p.neighborhood, p.district, p.city].filter(Boolean).join(", ") || "—";
  const agent = p.agent;

  return (
    <div
      onClick={() => onSelect?.(p)}
      onMouseEnter={() => onHover?.(p)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-2xl border bg-surface shadow-elegant transition-all hover:border-border-strong",
        selected ? "border-gold/50 shadow-gold" : "border-border",
      )}
    >
      <div className="flex gap-3 p-3">
        <Link
          to="/dashboard/portfolios/$id"
          params={{ id: p.id }}
          onClick={(e) => e.stopPropagation()}
          className="relative block size-28 shrink-0 overflow-hidden rounded-xl bg-surface-3"
        >
          {p.cover_url ? (
            <ThumbImage
              thumb={p.cover_url}
              full={p.cover_url_full}
              alt={p.title}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <CoverPlaceholder category={p.category} size="sm" />
          )}
          <ClosedModeBadge mode={p.mode} className="absolute left-1.5 top-1.5" />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <MapPin className="size-3 shrink-0 text-gold" />
            <span className="truncate">~{region}</span>
            <span className="ml-auto shrink-0 rounded bg-surface-3 px-1.5 py-0.5 uppercase tracking-wide">
              {CATEGORY_LABELS[p.category]}
            </span>
          </div>
          <Link
            to="/dashboard/portfolios/$id"
            params={{ id: p.id }}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          >
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-gold">
              {p.title}
            </h3>
          </Link>
          <div className="mt-0.5 font-display text-lg font-semibold text-gold">
            {formatPortfolioPrice(p.price, p.currency)}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-secondary-foreground">
            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-muted-foreground">
              {TRANSACTION_LABELS[p.transaction_type]}
            </span>
            {p.room_count && (
              <span className="flex items-center gap-1">
                <BedDouble className="size-3 text-muted-foreground" />
                {p.room_count}
              </span>
            )}
            {p.gross_m2 != null && (
              <span className="flex items-center gap-1">
                <Maximize className="size-3 text-muted-foreground" />
                {p.gross_m2} m²
              </span>
            )}
          </div>
          {p.features.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {p.features.slice(0, 3).map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold ring-1 ring-inset ring-gold/20"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
          <RefNoText value={p.ref_no} className="mt-1" />
        </div>

        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(p.id);
            }}
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-border-strong transition-colors hover:bg-surface-3",
              saved ? "text-gold" : "text-secondary-foreground",
            )}
            aria-label={saved ? "Kayıtlardan çıkar" : "Kaydet"}
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
          </button>
        )}
      </div>

      {/* Owner identity + CTAs */}
      {agent && (
        <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
          <BrokerAvatar name={agent.full_name} src={agent.avatar_url || undefined} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="truncate text-xs font-semibold text-foreground">
                {agent.full_name}
              </span>
              <ShieldCheck className="size-3 shrink-0 text-gold" />
            </div>
            {agent.company_name && (
              <span className="truncate text-[11px] text-muted-foreground">
                {agent.company_name}
              </span>
            )}
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to="/v/$username" params={{ username: agent.username }}>
              Profili Gör
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-7 gap-1 bg-gradient-gold px-2 text-[11px] text-primary-foreground hover:opacity-90"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to="/dashboard/portfolios/$id" params={{ id: p.id }}>
              <Send className="size-3" /> Detay Talep Et
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
