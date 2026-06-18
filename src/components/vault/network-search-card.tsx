import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Wallet,
  Home,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Bookmark,
  GitCompareArrows,
  UserRound,
  FolderLock,
} from "lucide-react";
import type { BuyerSearch, Urgency } from "@/lib/mock/types";
import { StatusBadge, FeatureChip } from "./badges";
import { BrokerAvatar } from "./broker-avatar";
import { Button } from "@/components/ui/button";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { getMyMatchesForBuyerSearch } from "@/lib/mock/matching";
import { useMySearches } from "@/lib/my-searches-store";
import { cn } from "@/lib/utils";

export const urgencyLabels: Record<Urgency, string> = {
  low: "Esnek",
  medium: "Normal",
  high: "Acil",
};

export const urgencyTones: Record<Urgency, "muted" | "info" | "danger"> = {
  low: "muted",
  medium: "info",
  high: "danger",
};

export function NetworkSearchCard({ search }: { search: BuyerSearch }) {
  const { saveFromNetwork, isNetworkSaved } = useMySearches();
  const myMatches = getMyMatchesForBuyerSearch(search);
  const saved = isNetworkSaved(search.id);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-gold">
      {/* Header: title + urgency */}
      <div className="flex items-start justify-between gap-3">
        <Link
          to="/dashboard/searches/$id"
          params={{ id: search.id }}
          className="min-w-0 font-display text-base font-semibold text-foreground transition-colors hover:text-gold"
        >
          {search.title}
        </Link>
        <StatusBadge
          tone={urgencyTones[search.urgency]}
          label={urgencyLabels[search.urgency]}
          className={cn(search.urgency === "high" && "gap-1")}
        />
      </div>

      {/* Created by */}
      <Link
        to="/dashboard/professionals/$id"
        params={{ id: search.owner.id }}
        className="mt-3 flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 p-2 transition-colors hover:border-gold/40"
      >
        <BrokerAvatar
          name={search.owner.fullName}
          src={search.owner.avatarUrl || undefined}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-medium text-foreground">
              {search.owner.fullName}
            </span>
            <ShieldCheck className="size-3.5 shrink-0 text-gold" />
          </div>
          <span className="truncate text-[11px] text-muted-foreground">
            {search.owner.companyName}
          </span>
        </div>
      </Link>

      {/* Meta grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Meta icon={MapPin} label={`${search.region} / ${search.city}`} />
        <Meta icon={Home} label={portfolioTypeLabels[search.type]} />
        <Meta
          icon={Wallet}
          label={`${formatPrice(search.budgetMin, search.currency)} – ${formatPrice(search.budgetMax, search.currency)}`}
        />
        <Meta icon={Flame} label={`${search.matchCount} ağ eşleşmesi`} />
      </div>

      {/* Must-have features */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {search.mustHave.slice(0, 4).map((f) => (
          <FeatureChip key={f} label={f} />
        ))}
      </div>

      {/* Portfolio match badge */}
      {myMatches.length > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/[0.06] px-3 py-2">
          <FolderLock className="size-4 shrink-0 text-gold" />
          <p className="text-xs font-medium text-secondary-foreground">
            Portföylerinizden{" "}
            <span className="font-semibold text-gold">{myMatches.length} tanesi</span> bu arayışla
            eşleşebilir
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3">
        <Button
          asChild
          size="sm"
          className="col-span-2 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
        >
          <Link to="/dashboard/searches/$id" params={{ id: search.id }}>
            Arayışı Gör <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="gap-1.5 border-gold/30 text-gold hover:bg-gold/10"
        >
          <Link to="/dashboard/matches" search={{ searchId: search.id, source: "network" }}>
            <GitCompareArrows className="size-3.5" /> Portföyümle Eşleştir
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link to="/dashboard/professionals/$id" params={{ id: search.owner.id }}>
            <UserRound className="size-3.5" /> Profesyoneli Gör
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn("col-span-2 gap-1.5", saved && "border-gold/40 text-gold")}
          onClick={() => saveFromNetwork(search)}
        >
          <Bookmark className={cn("size-3.5", saved && "fill-current")} />
          {saved ? "Arayışlarım'da Kayıtlı" : "Arayışı Kaydet"}
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-gold" />
        {search.createdAt} oluşturuldu · {search.savedBy} profesyonel kaydetti
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-3.5 shrink-0 text-gold" />
      <span className="truncate text-secondary-foreground">{label}</span>
    </span>
  );
}
