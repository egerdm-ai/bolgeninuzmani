import { createFileRoute, redirect } from "@tanstack/react-router";
import { featureFlags } from "@/lib/feature-flags";
import { FolderLock, Search, Users, TrendingUp } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/vault/cards";
import { RegionCard } from "@/components/vault/region-card";
import { regions } from "@/lib/mock/matching";

export const Route = createFileRoute("/dashboard/regions/")({
  beforeLoad: () => {
    if (!featureFlags.regions) throw redirect({ to: "/dashboard" });
  },
  component: Regions,
});

function Regions() {
  const totalPortfolios = regions.reduce((s, r) => s + r.activePortfolios, 0);
  const totalSearches = regions.reduce((s, r) => s + r.buyerSearchCount, 0);
  const highDemand = regions.filter((r) => r.demandLevel === "high").length;

  return (
    <PageContainer className="space-y-7">
      <PageHeader
        title="Bölgeler"
        subtitle="Takip ettiğiniz bölgelerdeki yeni portföyleri, arayışları ve bölge uzmanlarını keşfedin."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Bölge" value={String(regions.length)} icon={TrendingUp} />
        <KpiCard label="Aktif Portföy" value={String(totalPortfolios)} icon={FolderLock} />
        <KpiCard label="Açık Arayış" value={String(totalSearches)} icon={Search} />
        <KpiCard label="Yüksek Talep" value={String(highDemand)} icon={Users} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {regions.map((r) => (
          <RegionCard key={r.slug} region={r} />
        ))}
      </div>
    </PageContainer>
  );
}
