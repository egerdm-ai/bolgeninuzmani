import { Link } from "@tanstack/react-router";
import { ShieldCheck, MapPin } from "lucide-react";
import type { Broker, Professional } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { BrokerAvatar } from "./broker-avatar";
import { MembershipBadge, RegionExpertBadge } from "./badges";
import { FollowButton } from "./follow-button";
import { Button } from "@/components/ui/button";
import { getProfessionalById } from "@/lib/mock/data";
import { topExpertRegion } from "@/lib/mock/insights";

/**
 * Compact, consistent professional card used wherever a professional appears
 * inline (search results, portfolio owner panel, "benzer profesyoneller").
 * Accepts either a full Professional or a lighter Broker (owner) reference.
 */
export function ProfessionalMiniCard({
  professional,
  className,
}: {
  professional: Professional | Broker;
  className?: string;
}) {
  const pro = getProfessionalById(professional.id);
  const expertBadge =
    (professional as Professional).expertBadge ?? (pro ? topExpertRegion(pro) : undefined);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-gradient-surface p-4 shadow-elegant transition-all hover:border-gold/40 hover:shadow-gold",
        className,
      )}
    >
      <Link
        to="/dashboard/professionals/$id"
        params={{ id: professional.id }}
        className="flex items-center gap-3"
      >
        <BrokerAvatar
          name={professional.fullName}
          src={professional.avatarUrl || undefined}
          size="lg"
          className="ring-2 ring-gold/20"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-foreground">{professional.fullName}</h3>
            <ShieldCheck className="size-3.5 shrink-0 text-gold" />
            <MembershipBadge tier={professional.membershipTier} label={pro?.membershipBadge} />
          </div>
          <p className="truncate text-xs text-muted-foreground">{professional.title}</p>
          <p className="truncate text-xs text-gold">{professional.companyName}</p>
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {expertBadge && <RegionExpertBadge region={expertBadge} />}
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3 text-gold" /> {professional.location}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to="/dashboard/professionals/$id" params={{ id: professional.id }}>
            Profili Gör
          </Link>
        </Button>
        <FollowButton id={professional.id} name={professional.fullName} size="sm" className="flex-1" />
      </div>
    </div>
  );
}
