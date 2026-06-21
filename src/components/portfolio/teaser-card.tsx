import { Link } from "@tanstack/react-router";
import { Bed, Square, ShieldCheck, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { s } from "@/lib/styles";
import { ThumbImage } from "@/components/portfolio/thumb-image";
import { CoverPlaceholder } from "@/components/portfolio/cover-placeholder";
import { ClosedModeBadge, RefNoText } from "@/components/portfolio/portfolio-badges";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { CATEGORY_LABELS, TRANSACTION_LABELS, formatPortfolioPrice } from "@/lib/portfolio-labels";
import type { Database } from "@/lib/database.types";

type Category = Database["public"]["Enums"]["portfolio_category"];
type Txn = Database["public"]["Enums"]["transaction_type"];
type Mode = Database["public"]["Enums"]["portfolio_mode"];
type Currency = Database["public"]["Enums"]["currency"];

export type TeaserCardData = {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: Currency;
  transaction_type: Txn;
  category: Category;
  mode: Mode;
  ref_no: string;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  coverThumb: string | null;
  coverFull: string | null;
  roomCount?: string | null;
  grossM2?: number | null;
  features?: string[];
  agent?: { username: string; full_name: string; avatar_url: string | null } | null;
};

/** Shared portfolio teaser card (Keşfet + profile + agent pages). navy+gold, D35. */
export function PortfolioTeaserCard({
  p,
  context,
  saved,
  onToggleSave,
}: {
  p: TeaserCardData;
  context: "app" | "public";
  /** When onToggleSave is provided, a Kaydet (bookmark) toggle is shown (in-app only). */
  saved?: boolean;
  onToggleSave?: (id: string) => void;
}) {
  const region = [p.neighborhood, p.district, p.city].filter(Boolean).join(", ") || "—";
  const body = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden bg-bu-card-raised">
        {p.coverThumb ? (
          <ThumbImage
            thumb={p.coverThumb}
            full={p.coverFull}
            alt={p.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <CoverPlaceholder category={p.category} size="md" />
        )}
        <ClosedModeBadge mode={p.mode} className="absolute right-2 top-2" />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-bu-text-2">
          <span>{CATEGORY_LABELS[p.category]}</span>
          <span>·</span>
          <span>{TRANSACTION_LABELS[p.transaction_type]}</span>
        </div>
        <h3 className="line-clamp-1 font-display text-lg font-semibold text-bu-text">{p.title}</h3>
        <p className="line-clamp-1 text-xs text-bu-text-2">~{region}</p>
        <p className="font-display text-xl font-bold text-bu-gold">
          {formatPortfolioPrice(p.price, p.currency)}
        </p>
        {(p.roomCount || p.grossM2 != null) && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {p.roomCount && (
              <span className="inline-flex items-center gap-1 rounded-bu-md bg-bu-card-raised px-2 py-0.5 text-[11px] text-bu-text-2">
                <Bed className="size-3 text-bu-gold" /> {p.roomCount}
              </span>
            )}
            {p.grossM2 != null && (
              <span className="inline-flex items-center gap-1 rounded-bu-md bg-bu-card-raised px-2 py-0.5 text-[11px] text-bu-text-2">
                <Square className="size-3 text-bu-gold" /> {p.grossM2} m²
              </span>
            )}
          </div>
        )}
        {p.features && p.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {p.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="rounded-bu-full bg-bu-gold-muted px-2 py-0.5 text-[10px] font-medium text-bu-gold"
              >
                {f}
              </span>
            ))}
          </div>
        )}
        <RefNoText value={p.ref_no} className="block pt-0.5" />
      </div>
    </>
  );

  return (
    <div className="group relative overflow-hidden rounded-bu-lg border border-bu-border bg-bu-card shadow-bu-card transition-all duration-200 hover:border-bu-border-gold hover:shadow-bu-raised">
      {onToggleSave && (
        <button
          type="button"
          aria-label={saved ? "Kayıtlardan çıkar" : "Kaydet"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSave(p.id);
          }}
          className={cn(
            "absolute left-2 top-2 z-10 flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-colors",
            // Over a real photo: dark scrim for contrast. Over the branded placeholder:
            // a soft token chip (no black blob).
            p.coverThumb
              ? cn(
                  "border border-white/15 bg-black/55",
                  saved ? "text-bu-gold" : "text-white hover:text-bu-gold",
                )
              : cn(
                  "border border-bu-border bg-bu-card/85",
                  saved ? "text-bu-gold" : "text-bu-text-2 hover:text-bu-gold",
                ),
          )}
        >
          <Bookmark className={cn("size-4", saved && "fill-current")} />
        </button>
      )}
      {context === "app" ? (
        <Link to="/dashboard/portfolios/$id" params={{ id: p.id }} className="block">
          {body}
        </Link>
      ) : (
        <Link to="/p/$slug" params={{ slug: p.slug }} className="block">
          {body}
        </Link>
      )}
      {p.agent && (
        <Link
          to="/v/$username"
          params={{ username: p.agent.username }}
          className="flex items-center gap-2 border-t border-bu-border px-4 py-2.5 hover:bg-bu-card-raised"
        >
          <BrokerAvatar name={p.agent.full_name} src={p.agent.avatar_url ?? undefined} size="sm" />
          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate text-xs font-medium text-bu-text">{p.agent.full_name}</span>
            <ShieldCheck className="size-3 shrink-0 text-bu-gold" aria-label="Doğrulanmış" />
          </span>
        </Link>
      )}
    </div>
  );
}
