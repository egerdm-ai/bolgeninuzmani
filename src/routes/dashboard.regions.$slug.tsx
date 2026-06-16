import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin,
  FolderLock,
  Search,
  Users,
  TrendingUp,
  Activity,
  Sparkles,
  Bell,
  BellOff,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { InfoPanel, SurfaceCard, KpiCard, EmptyStateCard } from "@/components/vault/cards";
import { FeatureChip } from "@/components/vault/badges";
import { PortfolioCard } from "@/components/vault/portfolio-card";
import { RegionExpertCard } from "@/components/vault/region-expert-card";
import { NetworkSearchCard } from "@/components/vault/network-search-card";
import {
  getRegionBySlug,
  getPortfoliosByRegion,
  getExpertsForRegion,
  networkSearches,
} from "@/lib/mock/matching";
import { useSaved } from "@/lib/saved-store";
import { useRegionWatch } from "@/lib/region-watch-store";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import type { NotificationFrequency } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/regions/$slug")({
  component: RegionDetail,
});

const demandLabels = { high: "Yüksek", medium: "Orta", low: "Düşük" } as const;

function RegionDetail() {
  const { slug } = Route.useParams();
  const { isSaved, toggleSave } = useSaved();
  const { isWatching, toggleWatch, frequencyFor, setFrequency } = useRegionWatch();
  const region = getRegionBySlug(slug);


  if (!region) {
    return (
      <PageContainer>
        <EmptyStateCard
          icon={MapPin}
          title="Bölge bulunamadı"
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard/regions">Bölgelere dön</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const portfolios = getPortfoliosByRegion(region.name).filter((p) => p.status === "active");
  const experts = getExpertsForRegion(region);
  const searches = networkSearches.filter(
    (b) => b.region.toLocaleLowerCase("tr-TR") === region.name.toLocaleLowerCase("tr-TR"),
  );
  const watching = isWatching(region.slug);
  const freq = frequencyFor(region.slug) ?? "instant";
  const freqOptions: NotificationFrequency[] = ["instant", "daily", "weekly", "off"];


  return (
    <PageContainer className="space-y-7">
      {/* Region hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border shadow-elegant">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 30%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 50%), linear-gradient(135deg, var(--surface-2), var(--surface-3))",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_60%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_60%,transparent)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />
        <span
          className="absolute size-4 rounded-full bg-gold ring-8 ring-gold/15"
          style={{ left: `${region.mapX}%`, top: `${region.mapY}%` }}
        />
        <div className="relative p-7 lg:p-10">
          <nav className="mb-2 text-xs text-muted-foreground">
            <Link to="/dashboard/regions" className="transition-colors hover:text-gold">
              Bölgeler
            </Link>
            <span className="mx-1">/</span>
            <span className="text-secondary-foreground">{region.name}</span>
          </nav>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
            {region.name}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 text-gold" /> {region.city}
          </p>
          <p className="mt-3 max-w-xl text-sm text-secondary-foreground">{region.blurb}</p>
          <Button
            onClick={() => toggleWatch(region.slug, region.name)}
            className={cn(
              "mt-5 gap-1.5",
              watching
                ? "border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                : "bg-gradient-gold text-primary-foreground hover:opacity-90",
            )}
          >
            {watching ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            {watching ? "Takip Ediliyor" : "Bölgeyi Takip Et"}
          </Button>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Aktif Portföy" value={String(region.activePortfolios)} icon={FolderLock} />
        <KpiCard label="Aktif Profesyonel" value={String(region.expertCount)} icon={Users} />
        <KpiCard label="Açık Arayış" value={String(region.buyerSearchCount)} icon={Search} />
        <KpiCard label="Talep Yoğunluğu" value={demandLabels[region.demandLevel]} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-7">
          {/* Active portfolios */}
          <div>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">Aktif Portföyler</h2>
            {portfolios.length === 0 ? (
              <EmptyStateCard icon={FolderLock} title="Bu bölgede aktif portföy yok" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {portfolios.map((p) => (
                  <PortfolioCard key={p.id} portfolio={p} saved={isSaved(p.id)} onToggleSave={toggleSave} />
                ))}
              </div>
            )}
          </div>

          {/* Buyer searches */}
          {searches.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-xl font-semibold text-foreground">Bu Bölgedeki Arayışlar</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {searches.map((s) => (
                  <NetworkSearchCard key={s.id} search={s} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          {/* Market context */}
          <SurfaceCard className="border-gold/30 bg-gold/[0.05] p-0">
            <div className="flex items-center gap-1.5 border-b border-gold/20 px-4 py-3">
              <TrendingUp className="size-4 text-gold" />
              <h3 className="text-sm font-semibold text-foreground">Piyasa İçgörüsü</h3>
              <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                Tahmini
              </span>
            </div>
            <div className="space-y-2 px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ortalama aralık</span>
                <span className="font-semibold text-gold">{region.priceRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Talep</span>
                <span className="font-semibold text-foreground">{demandLabels[region.demandLevel]}</span>
              </div>
            </div>
          </SurfaceCard>

          {/* Top features */}
          <InfoPanel title="En Çok Aranan Özellikler">
            <div className="flex flex-wrap gap-1.5">
              {region.topFeatures.map((f) => (
                <FeatureChip key={f} label={f} />
              ))}
            </div>
          </InfoPanel>

          {/* Experts */}
          <div>
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-lg font-semibold text-foreground">
              <Sparkles className="size-4 text-gold" /> Bölge Uzmanları
            </h3>
            <div className="space-y-3">
              {experts.map((e) => (
                <RegionExpertCard key={e.id} professional={e} regionName={region.name} />
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <InfoPanel title="Son Aktiviteler">
            <ul className="space-y-3 text-sm">
              {[
                `${region.name} bölgesinde yeni portföy eklendi`,
                `${region.buyerSearchCount} aktif arayış eşleşme bekliyor`,
                "Bölge fiyat aralığı güncellendi",
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <Activity className="mt-0.5 size-3.5 shrink-0 text-gold" />
                  <span className="text-secondary-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </InfoPanel>

          {/* Region watch settings */}
          <InfoPanel title="Bölge Takibi">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-secondary-foreground">
                {watching
                  ? "Bu bölgede yeni portföy ve arayışlarda bildirim alıyorsunuz."
                  : "Yeni portföy ve arayışlardan haberdar olmak için takip edin."}
              </p>
              <Button
                size="sm"
                variant={watching ? "outline" : "default"}
                onClick={() => toggleWatch(region.slug, region.name)}
                className={cn("shrink-0 gap-1.5", watching && "border-gold/40 text-gold")}
              >
                {watching ? "Takipte" : "Takip Et"}
              </Button>
            </div>
            {watching && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Bildirim sıklığı
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {freqOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(region.slug, f)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                        freq === f
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {notificationFrequencyLabels[f]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </InfoPanel>
        </div>
      </div>
    </PageContainer>
  );
}
