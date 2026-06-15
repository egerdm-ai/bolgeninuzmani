import { useMemo, useState } from "react";
import {
  MapPin,
  ShieldCheck,
  FolderLock,
  Users,
  Compass,
  Sparkles,
  ArrowRight,
  Eye,
  Search as SearchIcon,
} from "lucide-react";
import type { Portfolio, Professional } from "@/lib/mock/types";
import { formatNumber } from "@/lib/format";
import { getPortfoliosByProfessional, professionals } from "@/lib/mock/data";
import { getBuyerSearchesByProfessional } from "@/lib/mock/matching";
import { BrokerAvatar } from "./broker-avatar";
import { MembershipBadge, RegionExpertBadge } from "./badges";
import { FollowButton } from "./follow-button";
import { ShareProfileButton } from "./share-profile-button";
import { SurfaceCard } from "./cards";
import { DetailRequestModal } from "./detail-request-modal";
import {
  ProfessionalProfileTabs,
  type ProfileTab,
} from "./professional-profile-tabs";
import { ProfessionalPortfolioCatalog } from "./professional-portfolio-catalog";
import { ProfessionalSearchCard } from "./professional-search-card";
import { ProfessionalAboutSection } from "./professional-about-section";
import { ProfessionalExpertiseRegions } from "./professional-expertise-regions";
import { ProfessionalLinksSection } from "./professional-links-section";
import { SimilarProfessionals } from "./similar-professionals";
import { ProfessionalQuickActions } from "./professional-quick-actions";
import { LockedContactCard } from "./locked-contact-card";
import { useFollow } from "@/lib/follow-store";

export function ProfessionalProfile({ professional }: { professional: Professional }) {
  const { followerCount } = useFollow();
  const followers = followerCount(professional.id, professional.followerCount);

  const allPortfolios = useMemo(
    () => getPortfoliosByProfessional(professional.id, { activeOnly: true }),
    [professional.id],
  );
  const searches = useMemo(
    () => getBuyerSearchesByProfessional(professional),
    [professional],
  );

  const similar = useMemo(
    () =>
      professionals
        .filter(
          (x) =>
            x.id !== professional.id &&
            (x.expertiseTypes.some((t) => professional.expertiseTypes.includes(t)) ||
              x.expertiseRegions.some((r) => professional.expertiseRegions.includes(r))),
        )
        .slice(0, 3),
    [professional],
  );

  const [activeTab, setActiveTab] = useState<ProfileTab>("portfolios");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [requestTarget, setRequestTarget] = useState<Portfolio | null>(null);

  const scrollToContent = () =>
    document.getElementById("profile-content")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const showPortfolios = () => {
    setActiveTab("portfolios");
    scrollToContent();
  };

  const focusRegion = (region: string) => {
    setRegionFilter((prev) => (prev === region ? null : region));
    setActiveTab("portfolios");
    scrollToContent();
  };

  const openRequest = () => setRequestTarget(allPortfolios[0] ?? null);

  const stats = [
    { label: "Aktif Portföy", value: formatNumber(professional.activePortfolios), icon: FolderLock },
    { label: "Aktif Arayış", value: formatNumber(searches.length), icon: SearchIcon },
    { label: "Takipçi", value: formatNumber(followers), icon: Users },
    { label: "Uzmanlık Bölgesi", value: String(professional.expertiseRegions.length), icon: Compass },
    { label: "Eşleşme Sayısı", value: formatNumber(professional.matchCount), icon: Sparkles },
  ];

  const topRegions = [...professional.regionExpertise]
    .sort((a, b) => b.portfolioCount - a.portfolioCount)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* A. Compact hero */}
      <SurfaceCard className="overflow-hidden p-0">
        <div className="relative h-24 sm:h-28">
          <img src={professional.coverImage} alt="" className="size-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 85% 15%, oklch(0.78 0.12 85 / 0.18), transparent 45%)",
            }}
          />
        </div>
        <div className="px-5 pb-5 sm:px-7 sm:pb-6">
          <div className="relative z-10 -mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <BrokerAvatar
                name={professional.fullName}
                src={professional.avatarUrl || undefined}
                size="xl"
                className="size-20 text-2xl ring-4 ring-surface"
              />
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {professional.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold ring-1 ring-inset ring-gold/30">
                    <ShieldCheck className="size-3.5" /> Doğrulanmış Profesyonel
                  </span>
                  <MembershipBadge tier={professional.membershipTier} label={professional.membershipBadge} />
                  <RegionExpertBadge region={professional.expertBadge} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {professional.title} · <span className="text-gold">{professional.companyName}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 text-gold" /> {professional.location}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pb-1">
              <FollowButton id={professional.id} name={professional.fullName} />
              <ShareProfileButton username={professional.username} />
              <HeroPortfolioCta onClick={showPortfolios} />
            </div>
          </div>

          {/* Hero stats */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <s.icon className="size-3.5 text-gold" /> {s.label}
                </span>
                <span className="mt-0.5 block font-display text-xl font-semibold text-foreground">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>

      {/* B. Tabs + content + sidebar */}
      <div id="profile-content" className="scroll-mt-20 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <ProfessionalProfileTabs
            active={activeTab}
            onChange={setActiveTab}
            counts={{
              portfolios: allPortfolios.length,
              searches: searches.length,
              regions: professional.regionExpertise.length,
              similar: similar.length,
            }}
          />

          {activeTab === "portfolios" && (
            <ProfessionalPortfolioCatalog
              professional={professional}
              portfolios={allPortfolios}
              regionFilter={regionFilter}
              onRegionChange={setRegionFilter}
              onRequestDetail={setRequestTarget}
            />
          )}

          {activeTab === "searches" && (
            <section>
              <div className="mb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">Arayışları</h2>
                <p className="text-sm text-muted-foreground">
                  Bu profesyonelin aktif olarak takip ettiği alıcı arayışları.
                </p>
              </div>
              {searches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center text-sm text-muted-foreground">
                  Bu profesyonelin paylaşılan aktif arayışı bulunmuyor.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {searches.map((s) => (
                    <ProfessionalSearchCard
                      key={s.id}
                      search={s}
                      hasMatchingPortfolio={s.status === "matched"}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "about" && <ProfessionalAboutSection professional={professional} />}

          {activeTab === "regions" && (
            <ProfessionalExpertiseRegions
              professional={professional}
              activeRegion={regionFilter}
              onFocusRegion={focusRegion}
            />
          )}

          {activeTab === "links" && <ProfessionalLinksSection professional={professional} />}

          {activeTab === "similar" && <SimilarProfessionals professionals={similar} />}
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
          <LockedContactCard />
          <ProfessionalQuickActions
            professional={professional}
            onShowPortfolios={showPortfolios}
            onRequestDetail={openRequest}
          />

          {/* Region summary */}
          <SurfaceCard>
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-gold" />
              <h3 className="text-sm font-semibold text-foreground">Bölge Özeti</h3>
            </div>
            <p className="mt-2 text-sm text-secondary-foreground">
              <span className="font-semibold text-gold">{professional.regionListCount} bölge listesinde</span>{" "}
              yer alıyor
            </p>
            <div className="mt-3 space-y-1.5">
              {topRegions.map((r) => (
                <button
                  key={r.region}
                  onClick={() => focusRegion(r.region)}
                  className="flex w-full items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-left transition-colors hover:bg-surface-3"
                >
                  <span className="flex items-center gap-1.5 text-sm text-secondary-foreground">
                    <MapPin className="size-3.5 text-gold" /> {r.region}
                  </span>
                  <span className="text-xs font-semibold text-foreground">{r.portfolioCount} portföy</span>
                </button>
              ))}
            </div>
          </SurfaceCard>

          {/* Mini analytics */}
          <SurfaceCard>
            <h3 className="text-sm font-semibold text-foreground">Mini Analitik</h3>
            <div className="mt-3 space-y-2">
              <AnalyticsRow icon={Eye} label="Son 30 Gün Görüntülenme" value={formatNumber(professional.views30d)} />
              <AnalyticsRow icon={Sparkles} label="Eşleşme Sayısı" value={formatNumber(professional.matchCount)} />
              <AnalyticsRow icon={FolderLock} label="Aktif Portföy" value={formatNumber(professional.activePortfolios)} />
            </div>
          </SurfaceCard>
        </aside>
      </div>

      <DetailRequestModal
        portfolio={requestTarget}
        open={!!requestTarget}
        onOpenChange={(o) => !o && setRequestTarget(null)}
      />
    </div>
  );
}

function AnalyticsRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5 text-gold" /> {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

/** Primary hero CTA — jumps to the Portföyleri tab. */
function HeroPortfolioCta({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md bg-gradient-gold px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
    >
      Portföylerini Gör <ArrowRight className="size-4" />
    </button>
  );
}
