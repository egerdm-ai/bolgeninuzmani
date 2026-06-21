import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Award, ShieldCheck, FolderLock, Loader2 } from "lucide-react";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { getRegionExperts, type RegionExpert } from "@/lib/data/region-experts";

/**
 * "Bu Bölgenin Uzmanları" — compact recommended-experts section for a portfolio/search/
 * region. Fetches get_region_experts (verified caller; PUBLIC profile allow-list + count
 * only). Render this behind featureFlags.regionExperts until the RPC is pushed (the stub
 * returns [] → the section renders nothing).
 */
export function RegionExperts({
  city,
  district,
  excludeOwner,
  title = "Bu Bölgenin Uzmanları",
}: {
  city: string | null;
  district?: string | null;
  excludeOwner?: string | null;
  title?: string;
}) {
  const [experts, setExperts] = useState<RegionExpert[] | null>(null);

  useEffect(() => {
    if (!city) {
      setExperts([]);
      return;
    }
    let active = true;
    getRegionExperts(city, district, excludeOwner)
      .then((r) => active && setExperts(r))
      .catch(() => active && setExperts([]));
    return () => {
      active = false;
    };
  }, [city, district, excludeOwner]);

  if (experts !== null && experts.length === 0) return null; // nothing to recommend

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Award className="size-5 text-gold" />
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      </div>

      {experts === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-8">
          <Loader2 className="size-5 animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((e) => (
            <Link
              key={e.username}
              to="/dashboard/professionals/$id"
              params={{ id: e.username }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-surface p-3 shadow-elegant transition-colors hover:border-gold/40"
            >
              <BrokerAvatar name={e.full_name} src={e.avatar_url || undefined} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {e.full_name}
                  </span>
                  <ShieldCheck className="size-3 shrink-0 text-gold" />
                </div>
                {e.company_name && (
                  <p className="truncate text-[11px] text-muted-foreground">{e.company_name}</p>
                )}
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gold">
                  <FolderLock className="size-3" /> {e.region_active_count} portföy bu bölgede
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
