import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Wallet,
  Home,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  Flame,
  Bell,
  BellOff,
  Layers,
} from "lucide-react";
import type { BuyerSearch, Urgency } from "@/lib/mock/types";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { SurfaceCard } from "./cards";
import { StatusBadge, FeatureChip } from "./badges";
import { Button } from "@/components/ui/button";

const urgencyLabels: Record<Urgency, string> = {
  high: "Yüksek Aciliyet",
  medium: "Orta Aciliyet",
  low: "Düşük Aciliyet",
};

const urgencyTones: Record<Urgency, "danger" | "warning" | "muted"> = {
  high: "danger",
  medium: "warning",
  low: "muted",
};

/**
 * Buyer search ("Arayış") card shown on a professional profile. Surfaces the
 * client note, budget, criteria, match count and notification status, plus
 * matching actions. `hasMatchingPortfolio` shows a gold CTA banner (mock).
 */
export function ProfessionalSearchCard({
  search,
  hasMatchingPortfolio,
}: {
  search: BuyerSearch;
  hasMatchingPortfolio?: boolean;
}) {
  const notifyOff = (search.notify ?? "off") === "off";

  return (
    <SurfaceCard className="p-4" hover>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-md bg-surface-3 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            <User className="size-3 text-gold" /> {search.clientLabel ?? "Özel müşteri için"}
          </span>
          <h3 className="mt-1.5 truncate font-semibold text-foreground">{search.title}</h3>
        </div>
        <StatusBadge label={urgencyLabels[search.urgency]} tone={urgencyTones[search.urgency]} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Meta icon={MapPin} label="Bölge" value={search.region} />
        <Meta
          icon={Wallet}
          label="Bütçe"
          value={`${formatPrice(search.budgetMax, search.currency)}'ye kadar`}
        />
        <Meta icon={Home} label="Tip" value={portfolioTypeLabels[search.type]} />
      </div>

      {/* Must-have features */}
      {search.mustHave.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {search.mustHave.map((f) => (
            <FeatureChip key={f} label={f} className="bg-surface-2" />
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-medium text-gold">
          <Sparkles className="size-3.5" /> {search.matchCount} eşleşme
        </span>
        <span className="inline-flex items-center gap-1">
          {notifyOff ? <BellOff className="size-3.5" /> : <Bell className="size-3.5 text-gold" />}
          {notificationFrequencyLabels[search.notify ?? "off"]}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" /> {search.createdAt}
        </span>
      </div>

      {hasMatchingPortfolio && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/[0.07] px-3 py-2 text-xs font-medium text-gold">
          <Flame className="size-3.5" /> Bu arayış portföylerinizden biriyle eşleşebilir.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button asChild size="sm" variant="outline" className="h-8 gap-1">
          <Link to="/dashboard/searches/$id" params={{ id: search.id }}>
            Arayışı Gör <ArrowRight className="size-3.5" />
          </Link>
        </Button>
        <Button asChild size="sm" className="h-8 gap-1 bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Link to="/dashboard/matches">
            <Layers className="size-3.5" /> Portföyümle Eşleştir
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="h-8 gap-1">
          <Link to="/dashboard/search">
            <Sparkles className="size-3.5 text-gold" /> Benzer Portföy Ara
          </Link>
        </Button>
      </div>
    </SurfaceCard>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-surface-2 px-2.5 py-1.5">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3 text-gold" /> {label}
      </span>
      <span className={cn("mt-0.5 block truncate text-xs font-medium text-foreground")}>{value}</span>
    </div>
  );
}
