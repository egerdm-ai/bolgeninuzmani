import { Link } from "@tanstack/react-router";
import { MapPin, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Broker } from "@/lib/mock/types";
import { SurfaceCard } from "./cards";
import { BrokerAvatar } from "./broker-avatar";
import { MembershipBadge } from "./badges";

export function OwnerCard({ owner }: { owner: Broker }) {
  return (
    <SurfaceCard>
      <div className="flex items-center gap-3">
        <BrokerAvatar name={owner.fullName} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-foreground">{owner.fullName}</h3>
            <ShieldCheck className="size-4 shrink-0 text-gold" />
            <MembershipBadge tier={owner.membershipTier} />
          </div>
          <p className="truncate text-xs text-muted-foreground">{owner.title}</p>
          <p className="truncate text-xs text-gold">{owner.companyName}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> Yanıt</span>
          <span className="font-semibold text-foreground">{owner.responseTimeLabel ?? "—"}</span>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="size-3" /> Onay</span>
          <span className="font-semibold text-foreground">%{owner.approvalRate ?? "—"}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5 text-gold" /> {owner.location}
      </div>
      <Link
        to="/dashboard/profile"
        className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:border-border-strong"
      >
        Profili Görüntüle
      </Link>
    </SurfaceCard>
  );
}
