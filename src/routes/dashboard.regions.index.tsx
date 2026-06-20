import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, FolderLock, Loader2, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard, EmptyStateCard } from "@/components/vault/cards";
import { featureFlags } from "@/lib/feature-flags";
import { getRegionSummary, type RegionSummary } from "@/lib/data/regions";

export const Route = createFileRoute("/dashboard/regions/")({
  beforeLoad: () => {
    if (!featureFlags.regions) throw redirect({ to: "/dashboard" });
  },
  component: Regions,
});

function Regions() {
  const [rows, setRows] = useState<RegionSummary[] | null>(null);

  useEffect(() => {
    let active = true;
    getRegionSummary()
      .then((r) => active && setRows(r))
      .catch(() => active && setRows([]));
    return () => {
      active = false;
    };
  }, []);

  const total = rows?.reduce((n, r) => n + r.active_count, 0) ?? 0;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Bölgeler"
        subtitle={`Ağdaki aktif portföylerin bölge dağılımı${rows ? ` · ${total} portföy` : ""}.`}
      />

      {rows === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyStateCard
          icon={MapPin}
          title="Bölge verisi yok"
          description="Ağda yayında portföy oldukça bölgeler burada listelenir."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const slug = encodeURIComponent(r.district ?? "");
            return (
              <Link
                key={`${r.city}-${r.district}`}
                to="/dashboard/regions/$slug"
                params={{ slug }}
                className="group flex flex-col rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant transition-colors hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-1.5 font-display text-lg font-semibold text-foreground">
                      <MapPin className="size-4 shrink-0 text-gold" /> {r.district ?? "—"}
                    </h3>
                    {r.city && <p className="mt-0.5 text-xs text-muted-foreground">{r.city}</p>}
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <FolderLock className="size-4" />
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                  <div>
                    <span className="font-display text-2xl font-semibold text-foreground">
                      {r.active_count}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">aktif portföy</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-gold transition-transform group-hover:translate-x-0.5">
                    İncele <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
