import { Link } from "@tanstack/react-router";
import { MapPin, ShieldCheck, FolderLock, Users } from "lucide-react";
import type { Broker } from "@/lib/mock/types";
import { SurfaceCard } from "./cards";
import { BrokerAvatar } from "./broker-avatar";
import { MembershipBadge, FeatureChip } from "./badges";
import { FollowButton } from "./follow-button";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { getProfessionalById } from "@/lib/mock/data";
import { useFollow } from "@/lib/follow-store";

export function OwnerCard({ owner }: { owner: Broker }) {
  const { followerCount } = useFollow();
  const pro = getProfessionalById(owner.id);
  const followers = pro ? followerCount(pro.id, pro.followerCount) : undefined;

  return (
    <SurfaceCard>
      <Link
        to="/dashboard/professionals/$id"
        params={{ id: owner.id }}
        className="flex items-center gap-3"
      >
        <BrokerAvatar name={owner.fullName} src={owner.avatarUrl || undefined} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-foreground">{owner.fullName}</h3>
            <ShieldCheck className="size-4 shrink-0 text-gold" />
            <MembershipBadge tier={owner.membershipTier} />
          </div>
          <p className="truncate text-xs text-muted-foreground">{owner.title}</p>
          <p className="truncate text-xs text-gold">{owner.companyName}</p>
        </div>
      </Link>

      {/* Expertise regions */}
      {owner.expertiseRegions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {owner.expertiseRegions.slice(0, 4).map((r) => (
            <FeatureChip key={r} label={r} />
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><FolderLock className="size-3" /> Aktif Portföy</span>
          <span className="font-semibold text-foreground">{pro?.activePortfolios ?? owner.portfolioCount}</span>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="size-3" /> Takipçi</span>
          <span className="font-semibold text-foreground">{followers != null ? formatNumber(followers) : "—"}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5 text-gold" /> {owner.location}
      </div>

      <div className="mt-4 space-y-2">
        <FollowButton id={owner.id} name={owner.fullName} fullWidth />
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/professionals/$id" params={{ id: owner.id }}>Profili Gör</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
            <Link to="/dashboard/professionals/$id" params={{ id: owner.id }} hash="portfoy-vitrini">
              Diğer Portföyleri
            </Link>
          </Button>
        </div>
      </div>
    </SurfaceCard>
  );
}
