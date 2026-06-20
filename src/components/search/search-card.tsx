import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Wallet,
  Home,
  Pencil,
  PauseCircle,
  PlayCircle,
  BedDouble,
  Ruler,
  ShieldCheck,
  User,
} from "lucide-react";
import { SurfaceCard } from "@/components/vault/cards";
import { StatusBadge, FeatureChip } from "@/components/vault/badges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, TRANSACTION_LABELS, formatPortfolioPrice } from "@/lib/portfolio-labels";
import type { Search, NetworkSearch, SearchStatus } from "@/lib/data/searches";

const STATUS_LABEL: Record<SearchStatus, string> = {
  active: "Aktif",
  matched: "Eşleşti",
  closed: "Pasif",
};
const STATUS_TONE = { active: "info", matched: "success", closed: "muted" } as const;
const URGENCY_LABEL = { low: "Düşük", medium: "Orta", high: "Yüksek" } as const;

function budgetLabel(s: Search) {
  if (s.budget_min == null && s.budget_max == null) return "Bütçe belirtilmemiş";
  const lo = s.budget_min != null ? formatPortfolioPrice(s.budget_min, s.currency) : "—";
  const hi = s.budget_max != null ? formatPortfolioPrice(s.budget_max, s.currency) : "—";
  return `${lo} – ${hi}`;
}

const region = (s: Search) =>
  [s.neighborhood, s.district, s.city].filter(Boolean).join(", ") || "Bölge belirtilmemiş";

function Meta({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-3.5 shrink-0 text-gold" />
      <span className="truncate text-secondary-foreground">{label}</span>
    </span>
  );
}

/**
 * Real Arayış card (no B8 match counters / B11 notify — those are vision and are
 * intentionally omitted, not faked). Reuses the Lovable visual language (SurfaceCard,
 * StatusBadge, FeatureChip). `mine` shows owner actions; `network` shows the owner
 * agent (→ /v).
 */
export function SearchCard({
  search,
  context,
  onSetStatus,
  busy,
}: {
  search: Search | NetworkSearch;
  context: "mine" | "network";
  onSetStatus?: (id: string, status: SearchStatus) => void;
  busy?: boolean;
}) {
  const owner = "owner" in search ? search.owner : null;
  const isClosed = search.status === "closed";

  return (
    <SurfaceCard className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {context === "mine" ? (
            <Link
              to="/dashboard/my-searches/$id"
              params={{ id: search.id }}
              className="font-display text-base font-semibold text-foreground transition-colors hover:text-gold"
            >
              {search.title}
            </Link>
          ) : (
            <span className="font-display text-base font-semibold text-foreground">
              {search.title}
            </span>
          )}
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 text-gold" /> {region(search)}
          </p>
        </div>
        <StatusBadge label={STATUS_LABEL[search.status]} tone={STATUS_TONE[search.status]} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Meta
          icon={Home}
          label={`${CATEGORY_LABELS[search.category]} · ${TRANSACTION_LABELS[search.transaction_type]}`}
        />
        <Meta icon={Wallet} label={budgetLabel(search)} />
        {search.room_count && <Meta icon={BedDouble} label={search.room_count} />}
        {search.min_m2 != null && <Meta icon={Ruler} label={`${search.min_m2}+ m²`} />}
      </div>

      {search.features.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {search.features.slice(0, 4).map((f) => (
            <FeatureChip key={f} label={f} />
          ))}
        </div>
      )}

      {search.notes && (
        <p className="line-clamp-2 border-t border-border pt-3 text-xs text-muted-foreground">
          “{search.notes}”
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Aciliyet:{" "}
          <span className="text-secondary-foreground">{URGENCY_LABEL[search.urgency]}</span>
        </span>

        {context === "mine" ? (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link
                to="/dashboard/my-searches/$id"
                params={{ id: search.id }}
                search={{ mode: "edit" }}
              >
                <Pencil className="size-3.5" /> Düzenle
              </Link>
            </Button>
            {onSetStatus && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                className={cn("gap-1.5", !isClosed && "text-muted-foreground")}
                onClick={() => onSetStatus(search.id, isClosed ? "active" : "closed")}
              >
                {isClosed ? (
                  <PlayCircle className="size-3.5" />
                ) : (
                  <PauseCircle className="size-3.5" />
                )}
                {isClosed ? "Aktifleştir" : "Pasifleştir"}
              </Button>
            )}
          </div>
        ) : owner ? (
          <Link
            to="/v/$username"
            params={{ username: owner.username }}
            className="flex items-center gap-1.5 text-xs text-foreground transition-colors hover:text-gold"
          >
            {owner.avatar_url ? (
              <img src={owner.avatar_url} alt="" className="size-5 rounded-full object-cover" />
            ) : (
              <span className="flex size-5 items-center justify-center rounded-full bg-surface-3 text-[10px] text-gold">
                <User className="size-3" />
              </span>
            )}
            <span className="max-w-[120px] truncate font-medium">{owner.full_name}</span>
            <ShieldCheck className="size-3 text-gold" />
          </Link>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
