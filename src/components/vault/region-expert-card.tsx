import { Link } from "@tanstack/react-router";
import { FolderLock, Users, Sparkles } from "lucide-react";
import type { Professional } from "@/lib/mock/types";
import { BrokerAvatar } from "./broker-avatar";
import { RegionExpertBadge } from "./badges";
import { FollowButton } from "./follow-button";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { getPortfoliosByRegion } from "@/lib/mock/matching";
import { useFollow } from "@/lib/follow-store";

export function RegionExpertCard({
  professional,
  regionName,
}: {
  professional: Professional;
  regionName: string;
}) {
  const { followerCount } = useFollow();
  const activeInRegion = getPortfoliosByRegion(regionName).filter(
    (p) => p.owner.id === professional.id && p.status === "active",
  ).length;
  const matchCount = 4 + (professional.id.charCodeAt(2) % 7);

  return (
    <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-elegant transition-colors hover:border-border-strong">
      <div className="flex items-center gap-3">
        <BrokerAvatar name={professional.fullName} src={professional.avatarUrl || undefined} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{professional.fullName}</h3>
          <p className="truncate text-xs text-muted-foreground">{professional.title}</p>
          <p className="truncate text-xs text-gold">{professional.companyName}</p>
        </div>
      </div>

      <div className="mt-3">
        <RegionExpertBadge region={regionName} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat icon={FolderLock} value={activeInRegion} label="Bölge portföyü" />
        <MiniStat
          icon={Users}
          value={formatNumber(followerCount(professional.id, professional.followerCount))}
          label="Takipçi"
        />
        <MiniStat icon={Sparkles} value={matchCount} label="Eşleşme" />
      </div>

      <div className="mt-3 flex gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to="/dashboard/professionals/$id" params={{ id: professional.id }}>
            Profili Gör
          </Link>
        </Button>
        <FollowButton id={professional.id} name={professional.fullName} size="sm" className="flex-1" />
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-surface-2 px-2 py-2 text-center">
      <Icon className="mx-auto size-3.5 text-gold" />
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
