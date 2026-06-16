import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Wallet,
  Home,
  Sparkles,
  ArrowRight,
  Bell,
  Pencil,
  PauseCircle,
  PlayCircle,
  Clock,
  User,
} from "lucide-react";
import type {
  BuyerSearch,
  BuyerSearchStatus,
  NotificationFrequency,
} from "@/lib/mock/types";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import { StatusBadge, FeatureChip } from "./badges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { useMySearches } from "@/lib/my-searches-store";
import { cn } from "@/lib/utils";

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

const freqOptions: NotificationFrequency[] = ["instant", "daily", "weekly", "off"];

export function BuyerSearchCard({ search }: { search: BuyerSearch }) {
  const { setStatus, setNotify } = useMySearches();
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [freq, setFreq] = useState<NotificationFrequency>(search.notify ?? "instant");
  const notify = search.notify ?? "instant";
  const isClosed = search.status === "closed";
  const newMatches = search.status === "matched" ? Math.min(search.matchCount, 2) : 0;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/dashboard/my-searches/$id"
            params={{ id: search.id }}
            className="font-display text-base font-semibold text-foreground transition-colors hover:text-gold"
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

      {/* Region chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground ring-1 ring-inset ring-border">
          <MapPin className="size-3 text-gold" /> {search.region}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground ring-1 ring-inset ring-border">
          {search.city}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Meta icon={Home} label={portfolioTypeLabels[search.type]} />
        <Meta
          icon={Wallet}
          label={`${formatPrice(search.budgetMin, search.currency)} – ${formatPrice(search.budgetMax, search.currency)}`}
        />
        <Meta icon={Bell} label={notificationFrequencyLabels[notify]} />
        <Meta icon={Clock} label={`Son eşleşme: ${search.lastMatchAt ?? "—"}`} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {search.mustHave.slice(0, 3).map((f) => (
          <FeatureChip key={f} label={f} />
        ))}
      </div>

      {/* Match counters */}
      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
        <span className="flex items-center gap-1.5 text-sm">
          <Sparkles className="size-4 text-gold" />
          <span className="font-semibold text-gold">{search.matchCount}</span>
          <span className="text-muted-foreground">eşleşme</span>
        </span>
        {newMatches > 0 && (
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success ring-1 ring-inset ring-success/25">
            {newMatches} yeni
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button asChild size="sm" className="col-span-2 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Link to="/dashboard/my-searches/$id" params={{ id: search.id }}>
            Eşleşmeleri Gör <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link to="/dashboard/my-searches/$id" params={{ id: search.id }} search={{ mode: "edit" }}>
            <Pencil className="size-3.5" /> Düzenle
          </Link>
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setNotifyOpen(true)}>
          <Bell className="size-3.5" /> Bildirimler
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn("col-span-2 gap-1.5", !isClosed && "text-muted-foreground")}
          onClick={() => setStatus(search.id, isClosed ? "active" : "closed")}
        >
          {isClosed ? <PlayCircle className="size-3.5" /> : <PauseCircle className="size-3.5" />}
          {isClosed ? "Yeniden Aktifleştir" : "Pasifleştir"}
        </Button>
      </div>

      {/* Notification settings modal */}
      <Dialog open={notifyOpen} onOpenChange={setNotifyOpen}>
        <DialogContent className="border-border-strong bg-surface">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Bildirimleri Yönet</DialogTitle>
            <DialogDescription>
              {search.title} için yeni eşleşme bildirim sıklığını seçin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-2">
            {freqOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  freq === f
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                )}
              >
                {notificationFrequencyLabels[f]}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyOpen(false)}>
              İptal
            </Button>
            <Button
              className="bg-gradient-gold text-primary-foreground hover:opacity-90"
              onClick={() => {
                setNotify(search.id, freq);
                setNotifyOpen(false);
              }}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
