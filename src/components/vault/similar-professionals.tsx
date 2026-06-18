import { Link } from "@tanstack/react-router";
import { ShieldCheck, FolderLock, MapPin, ArrowRight } from "lucide-react";
import type { Professional } from "@/lib/mock/types";
import { SurfaceCard } from "./cards";
import { BrokerAvatar } from "./broker-avatar";
import { MembershipBadge } from "./badges";
import { FollowButton } from "./follow-button";

/**
 * "Benzer Profesyoneller" — compact list of peers. Mock similarity logic:
 * shared expertise types / regions (computed by the caller).
 */
export function SimilarProfessionals({ professionals }: { professionals: Professional[] }) {
  if (professionals.length === 0) return null;
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Benzer Profesyoneller
        </h2>
        <p className="text-sm text-muted-foreground">
          Aynı bölge ve portföy tipinde çalışan, ağda öne çıkan profesyoneller.
        </p>
      </div>

      <SurfaceCard className="divide-y divide-border p-0">
        {professionals.map((pro) => (
          <div
            key={pro.id}
            className="flex flex-wrap items-center gap-4 px-4 py-3.5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-2"
          >
            <Link
              to="/dashboard/professionals/$id"
              params={{ id: pro.id }}
              className="flex min-w-[200px] flex-1 items-center gap-3"
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
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3 text-gold" /> {pro.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FolderLock className="size-3 text-gold" /> {pro.activePortfolios} aktif portföy
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <FollowButton id={pro.id} name={pro.fullName} size="sm" />
              <Link
                to="/dashboard/professionals/$id"
                params={{ id: pro.id }}
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-surface-3"
              >
                Profili Gör <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </SurfaceCard>
    </section>
  );
}
