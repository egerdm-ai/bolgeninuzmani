import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Wallet,
  Home,
  Sparkles,
  ArrowRight,
  Bell,
  BellOff,
  Pencil,
  PauseCircle,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type {
  BuyerSearch,
  BuyerSearchStatus,
  NotificationFrequency,
} from "@/lib/mock/types";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import { StatusBadge, FeatureChip } from "./badges";
import { Button } from "@/components/ui/button";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";

export const buyerSearchStatusLabels: Record<BuyerSearchStatus, string> = {
  active: "Aktif",
  matched: "Yeni Eşleşme",
  awaiting: "Yanıt Bekliyor",
  closed: "Pasif",
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

function NotifyBadge({ frequency }: { frequency: NotificationFrequency }) {
  const off = frequency === "off";
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset " +
        (off
          ? "bg-surface-2 text-muted-foreground ring-border"
          : "bg-gold/10 text-gold ring-gold/30")
      }
    >
      {off ? <BellOff className="size-3" /> : <Bell className="size-3" />}
      {notificationFrequencyLabels[frequency]}
    </span>
  );
}

export function BuyerSearchCard({ search }: { search: BuyerSearch }) {
  const notify = search.notify ?? "instant";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/dashboard/searches/$id"
            params={{ id: search.id }}
            className="font-semibold text-foreground transition-colors hover:text-gold"
          >
            {search.title}
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="size-3 text-gold" />
            {search.clientLabel ?? search.clientType}
          </p>
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
        <Meta icon={Clock} label={`Son eşleşme: ${search.lastMatchAt ?? "—"}`} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {search.mustHave.slice(0, 3).map((f) => (
          <FeatureChip key={f} label={f} />
        ))}
        <NotifyBadge frequency={notify} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1.5 text-sm">
          <Sparkles className="size-4 text-gold" />
          <span className="font-semibold text-gold">{search.matchCount}</span>
          <span className="text-muted-foreground">eşleşme</span>
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Düzenle"
            onClick={() => toast.info("Arayış düzenleme (mock)", { description: search.title })}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Pasifleştir"
            onClick={() => toast.info("Arayış pasifleştirildi (mock)", { description: search.title })}
          >
            <PauseCircle className="size-4" />
          </Button>
          <Button asChild size="sm" className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Link to="/dashboard/searches/$id" params={{ id: search.id }}>
              Eşleşmeleri Gör <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
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
