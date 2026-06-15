import { Link } from "@tanstack/react-router";
import { ShieldCheck, FolderLock } from "lucide-react";
import type { Professional } from "@/lib/mock/types";
import { SurfaceCard } from "./cards";
import { BrokerAvatar } from "./broker-avatar";
import { RegionExpertBadge, MembershipBadge } from "./badges";
import { FollowButton } from "./follow-button";
import { Button } from "@/components/ui/button";

/**
 * "Benzer Profesyoneller" — 3-4 compact peer cards. Mock similarity logic:
 * shared expertise types / regions (computed by the caller).
 */
export function SimilarProfessionals({ professionals }: { professionals: Professional[] }) {
  if (professionals.length === 0) return null;
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Benzer Profesyoneller</h2>
        <p className="text-sm text-muted-foreground">
          Aynı bölge ve portföy tipinde çalışan, ağda öne çıkan profesyoneller.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((pro) => (
          <SurfaceCard key={pro.id} className="p-4" hover>
            <Link
              to="/dashboard/professionals/$id"
              params={{ id: pro.id }}
              className="flex items-center gap-3"
            >
              <BrokerAvatar
                name={pro.fullName}
                src={pro.avatarUrl || undefined}
                size="lg"
                className="ring-2 ring-gold/20"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-sm font-semibold text-foreground">{pro.fullName}</h3>
                  <ShieldCheck className="size-3.5 shrink-0 text-gold" />
                  <MembershipBadge tier={pro.membershipTier} label={pro.membershipBadge} />
                </div>
                <p className="truncate text-xs text-muted-foreground">{pro.title}</p>
              </div>
            </Link>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <RegionExpertBadge region={pro.expertBadge} />
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <FolderLock className="size-3 text-gold" /> {pro.activePortfolios} aktif portföy
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to="/dashboard/professionals/$id" params={{ id: pro.id }}>
                  Profili Gör
                </Link>
              </Button>
              <FollowButton id={pro.id} name={pro.fullName} size="sm" className="flex-1" />
            </div>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}
