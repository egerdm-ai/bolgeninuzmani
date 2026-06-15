import { Link } from "@tanstack/react-router";
import { MapPin, ShieldCheck, FolderLock, Users, Layers } from "lucide-react";
import type { Professional } from "@/lib/mock/types";
import { formatNumber } from "@/lib/format";
import { getPortfoliosByProfessional } from "@/lib/mock/data";
import { BrokerAvatar } from "./broker-avatar";
import { MembershipBadge, FeatureChip, RegionExpertBadge } from "./badges";
import { RegionLinkChip } from "./region-link-chip";
import { topExpertRegion } from "@/lib/mock/insights";
import { FollowButton } from "./follow-button";
import { ProfessionalMiniCard } from "./professional-mini-card";
import { useFollow } from "@/lib/follow-store";
import { Button } from "@/components/ui/button";

export function ProfessionalCard({
  professional,
  compact,
}: {
  professional: Professional;
  compact?: boolean;
}) {
  const { followerCount } = useFollow();
  const previews = getPortfoliosByProfessional(professional.id, { activeOnly: true }).slice(0, 3);

  if (compact) {
    return <ProfessionalMiniCard professional={professional} />;
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-gold">
      {/* Cover */}
      <div className="relative h-28 overflow-hidden">
        <img
          src={professional.coverImage}
          alt=""
          className="size-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/55 to-transparent" />
        <div className="absolute right-3 top-3">
          <MembershipBadge tier={professional.membershipTier} label={professional.membershipBadge} />
        </div>
      </div>

      <div className="-mt-10 flex flex-1 flex-col px-5 pb-5">
        <BrokerAvatar
          name={professional.fullName}
          src={professional.avatarUrl || undefined}
          size="xl"
          className="size-20 ring-4 ring-surface"
        />
        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <Link
              to="/dashboard/professionals/$id"
              params={{ id: professional.id }}
              className="truncate font-display text-lg font-semibold text-foreground transition-colors hover:text-gold"
            >
              {professional.fullName}
            </Link>
            <ShieldCheck className="size-4 shrink-0 text-gold" />
          </div>
          <p className="truncate text-sm text-muted-foreground">{professional.title}</p>
          <p className="truncate text-sm font-medium text-gold">{professional.companyName}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 text-gold" /> {professional.location}
          </p>
          <div className="mt-2">
            <RegionExpertBadge region={professional.expertBadge ?? topExpertRegion(professional)} />
          </div>
        </div>

        {/* Expertise regions (linkable) */}
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Uzmanlık Bölgeleri
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {professional.expertiseRegions.slice(0, 4).map((r) => (
              <RegionLinkChip key={r} region={r} />
            ))}
          </div>
        </div>

        {/* Type chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {professional.expertiseTypes.map((t) => (
            <FeatureChip key={t} label={t} />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
            <FolderLock className="size-4 text-gold" />
            <div>
              <div className="text-sm font-semibold text-foreground">{professional.activePortfolios}</div>
              <div className="text-[11px] text-muted-foreground">Aktif Portföy</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
            <Users className="size-4 text-gold" />
            <div>
              <div className="text-sm font-semibold text-foreground">
                {formatNumber(followerCount(professional.id, professional.followerCount))}
              </div>
              <div className="text-[11px] text-muted-foreground">Takipçi</div>
            </div>
          </div>
        </div>

        {/* Region list membership */}
        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Layers className="size-3.5 text-gold" />
          <span className="font-semibold text-secondary-foreground">{professional.regionListCount}</span>{" "}
          bölge listesinde yer alıyor
        </p>

        {/* Recent portfolio thumbnails */}
        {previews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {previews.map((pf) => (
              <Link
                key={pf.id}
                to="/dashboard/portfolios/$id"
                params={{ id: pf.id }}
                className="relative aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-border"
              >
                <img
                  src={pf.coverImage}
                  alt={pf.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform hover:scale-110"
                />
              </Link>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <FollowButton id={professional.id} name={professional.fullName} fullWidth />
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/professionals/$id" params={{ id: professional.id }}>
                Profili Gör
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
              <Link to="/dashboard/professionals/$id" params={{ id: professional.id }} hash="portfoy-vitrini">
                Portföylerini Gör
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
