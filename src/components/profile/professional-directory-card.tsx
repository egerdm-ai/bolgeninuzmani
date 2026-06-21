import { Link } from "@tanstack/react-router";
import { FolderLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfessionalIdentityHeader } from "@/components/vault/professional-identity-header";
import { MembershipBadge, RegionExpertBadge, FeatureChip } from "@/components/vault/badges";
import { FollowButton } from "@/components/profile/follow-button";
import type { ProfessionalListItem } from "@/lib/data/professionals";

/**
 * Professionals directory card — reuses the Lovable ProfessionalIdentityHeader (card
 * variant) + badges, fed by REAL data. Vision-only bits (Takipçi, bölge-listesi sayısı,
 * son portföy küçük resimleri) are intentionally omitted. Profili Gör → in-app profile.
 */
export function ProfessionalDirectoryCard({ p }: { p: ProfessionalListItem }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-gold">
      <ProfessionalIdentityHeader
        variant="card"
        name={p.full_name}
        title={p.title ?? undefined}
        company={p.company_name ?? undefined}
        location={p.location ?? undefined}
        avatarSrc={p.avatar_url ?? undefined}
        coverBadge={<MembershipBadge tier={p.membership_tier} />}
        nameSlot={
          <Link
            to="/dashboard/professionals/$id"
            params={{ id: p.username }}
            className="truncate font-display text-lg font-semibold text-foreground transition-colors hover:text-gold"
          >
            {p.full_name}
          </Link>
        }
        badges={
          p.expertise_regions.length > 0 ? (
            <RegionExpertBadge region={p.expertise_regions[0]} />
          ) : undefined
        }
      />

      <div className="flex flex-1 flex-col px-5 pb-5">
        {p.expertise_regions.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Uzmanlık Bölgeleri
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {p.expertise_regions.slice(0, 4).map((r) => (
                <FeatureChip key={r} label={r} />
              ))}
            </div>
          </div>
        )}

        {p.expertise_types.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {p.expertise_types.map((t) => (
              <FeatureChip key={t} label={t} />
            ))}
          </div>
        )}

        {/* Stat — real active portfolio count (no vision stats) */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
          <FolderLock className="size-4 text-gold" />
          <div>
            <div className="text-sm font-semibold text-foreground">{p.active_portfolios}</div>
            <div className="text-[11px] text-muted-foreground">Aktif Portföy</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <FollowButton username={p.username} />
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/professionals/$id" params={{ id: p.username }}>
              Profili Gör
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
