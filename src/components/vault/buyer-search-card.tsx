import { Link } from "@tanstack/react-router";
import { MapPin, Wallet, Home, Calendar, Sparkles, ArrowRight } from "lucide-react";
import type { BuyerSearch, BuyerSearchStatus } from "@/lib/mock/types";
import { StatusBadge, FeatureChip } from "./badges";
import { Button } from "@/components/ui/button";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";

export const buyerSearchStatusLabels: Record<BuyerSearchStatus, string> = {
  active: "Aktif",
  matched: "Eşleşme Bulundu",
  awaiting: "Yanıt Bekliyor",
  closed: "Kapatıldı",
};

export const buyerSearchStatusTones: Record<
  BuyerSearchStatus,
  "success" | "warning" | "muted" | "info"
> = {
  active: "info",
  matched: "success",
  awaiting: "warning",
  closed: "muted",
};

const urgencyLabels = { low: "Düşük", medium: "Orta", high: "Yüksek" } as const;

export function BuyerSearchCard({ search }: { search: BuyerSearch }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/dashboard/buyer-searches/$id"
            params={{ id: search.id }}
            className="font-semibold text-foreground transition-colors hover:text-gold"
          >
            {search.title}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{search.clientType}</p>
        </div>
        <StatusBadge
          label={buyerSearchStatusLabels[search.status]}
          tone={buyerSearchStatusTones[search.status]}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Meta icon={MapPin} label={`${search.region} / ${search.city}`} />
        <Meta icon={Home} label={portfolioTypeLabels[search.type]} />
        <Meta
          icon={Wallet}
          label={`${formatPrice(search.budgetMin, search.currency)} – ${formatPrice(search.budgetMax, search.currency)}`}
        />
        <Meta icon={Calendar} label={search.createdAt} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {search.mustHave.slice(0, 3).map((f) => (
          <FeatureChip key={f} label={f} />
        ))}
        <FeatureChip label={`Aciliyet: ${urgencyLabels[search.urgency]}`} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1.5 text-sm">
          <Sparkles className="size-4 text-gold" />
          <span className="font-semibold text-gold">{search.matchCount}</span>
          <span className="text-muted-foreground">eşleşme</span>
        </span>
        <Button asChild size="sm" className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Link to="/dashboard/buyer-searches/$id" params={{ id: search.id }}>
            Eşleşmeleri Gör <ArrowRight className="size-4" />
          </Link>
        </Button>
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
