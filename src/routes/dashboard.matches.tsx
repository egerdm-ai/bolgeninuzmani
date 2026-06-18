import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { featureFlags } from "@/lib/feature-flags";
import {
  Sparkles,
  GitCompareArrows,
  FolderLock,
  Users,
  ArrowRight,
  Compass,
  Bell,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard, SurfaceCard, EmptyStateCard, InfoPanel } from "@/components/vault/cards";
import { StatusBadge, FeatureChip } from "@/components/vault/badges";
import { Button } from "@/components/ui/button";
import { MatchExplanationCard } from "@/components/vault/match-explanation-card";
import { NetworkSearchCard } from "@/components/vault/network-search-card";
import { ProfessionalCard } from "@/components/vault/professional-card";
import { urgencyLabels, urgencyTones } from "@/components/vault/network-search-card";
import {
  networkSearches,
  getNetworkSearchById,
  getMatchesForSearch,
  getMatchingSearchesForPortfolio,
  getMyMatchesForBuyerSearch,
} from "@/lib/mock/matching";
import { useMySearches } from "@/lib/my-searches-store";
import { myPortfolios, professionals, currentUser } from "@/lib/mock/data";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { useSaved } from "@/lib/saved-store";
import { useDetailRequest } from "@/lib/detail-request-store";

type SearchParams = { searchId?: string; source?: "network"; portfolioId?: string };

export const Route = createFileRoute("/dashboard/matches")({
  beforeLoad: () => {
    if (!featureFlags.matches) throw redirect({ to: "/dashboard" });
  },
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    searchId: typeof s.searchId === "string" ? s.searchId : undefined,
    source: s.source === "network" ? "network" : undefined,
    portfolioId: typeof s.portfolioId === "string" ? s.portfolioId : undefined,
  }),
  component: Matches,
});

function Matches() {
  const { searchId, source } = Route.useSearch();
  const { searches: mySearches } = useMySearches();
  const { isSaved, toggleSave } = useSaved();
  const { open: openRequest } = useDetailRequest();

  // Focused network search (from "Portföyümle Eşleştir")
  const focused = source === "network" && searchId ? getNetworkSearchById(searchId) : undefined;
  const focusedMatches = focused ? getMyMatchesForBuyerSearch(focused) : [];

  // Tab 1 — best portfolio match per my saved search
  const searchMatches = mySearches
    .map((s) => {
      const top = getMatchesForSearch({
        region: s.region,
        city: s.city,
        type: s.type,
        budgetMin: s.budgetMin,
        budgetMax: s.budgetMax,
        rooms: s.rooms,
        mustHave: s.mustHave,
      })[0];
      return top ? { search: s, match: top } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Tab 2 — network buyer searches matching my own portfolios
  const portfolioMatches = myPortfolios
    .map((p) => ({ portfolio: p, searches: getMatchingSearchesForPortfolio(p) }))
    .filter((x) => x.searches.length > 0);

  // Tab 4 — recommended region experts (excluding me)
  const recommendedExperts = professionals.filter((p) => p.id !== currentUser.id);

  const totalPortfolioMatches = portfolioMatches.reduce((s, x) => s + x.searches.length, 0);

  return (
    <PageContainer className="space-y-7">
      <PageHeader
        title="Eşleşmeler"
        subtitle="Arayışlarınıza uyan portföyleri, portföylerinize uyan ağ arayışlarını ve önerilen bölge uzmanlarını tek ekranda görün."
      />

      {/* Focused network search (deep link) */}
      {focused && (
        <SurfaceCard className="border-gold/30 bg-gold/[0.05]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                Network Arayışı ile Eşleştirme
              </p>
              <Link
                to="/dashboard/searches/$id"
                params={{ id: focused.id }}
                className="font-display text-lg font-semibold text-foreground transition-colors hover:text-gold"
              >
                {focused.title}
              </Link>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {focused.owner.fullName} · {focused.region} · {portfolioTypeLabels[focused.type]}
              </p>
            </div>
            <StatusBadge
              tone={urgencyTones[focused.urgency]}
              label={urgencyLabels[focused.urgency]}
            />
          </div>
          <p className="mt-3 text-sm text-secondary-foreground">
            Portföylerinizden{" "}
            <span className="font-semibold text-gold">{focusedMatches.length} tanesi</span> bu
            arayışla eşleşiyor.
          </p>
          {focusedMatches.length > 0 && (
            <div className="mt-4 space-y-4">
              {focusedMatches.map((m) => (
                <MatchExplanationCard
                  key={m.portfolio.id}
                  match={m}
                  saved={isSaved(m.portfolio.id)}
                  onSave={toggleSave}
                  onRequestDetail={openRequest}
                />
              ))}
            </div>
          )}
        </SurfaceCard>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <KpiCard label="Arayışıma Uyan" value={String(searchMatches.length)} icon={Sparkles} />
        <KpiCard label="Portföyüme Uyan" value={String(totalPortfolioMatches)} icon={FolderLock} />
        <KpiCard label="Ağ Arayışı" value={String(networkSearches.length)} icon={Compass} />
        <KpiCard label="Önerilen Uzman" value={String(recommendedExperts.length)} icon={Users} />
      </div>

      <Tabs defaultValue={focused ? "portfolioSearches" : "searchPortfolios"} className="space-y-5">
        <TabsList className="flex-wrap bg-surface-2">
          <TabsTrigger value="searchPortfolios">Arayışlarıma Uyan Portföyler</TabsTrigger>
          <TabsTrigger value="portfolioSearches">Portföylerime Uyan Arayışlar</TabsTrigger>
          <TabsTrigger value="network">Network Arayışları</TabsTrigger>
          <TabsTrigger value="experts">Bölge Uzmanı Önerileri</TabsTrigger>
          <TabsTrigger value="recent">Yeni Eşleşmeler</TabsTrigger>
        </TabsList>

        {/* Tab 1 — my searches → matching portfolios */}
        <TabsContent value="searchPortfolios" className="space-y-4">
          {searchMatches.length === 0 ? (
            <EmptyStateCard icon={GitCompareArrows} title="Henüz eşleşme yok" />
          ) : (
            searchMatches.map(({ search, match }) => (
              <div key={search.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {search.title} · {search.clientLabel ?? search.clientType}
                  </p>
                  <Link
                    to="/dashboard/my-searches/$id"
                    params={{ id: search.id }}
                    className="text-xs text-gold transition-colors hover:underline"
                  >
                    Arayışı Gör
                  </Link>
                </div>
                <MatchExplanationCard
                  match={match}
                  saved={isSaved(match.portfolio.id)}
                  onSave={toggleSave}
                  onRequestDetail={openRequest}
                />
              </div>
            ))
          )}
        </TabsContent>

        {/* Tab 2 — my portfolios → matching network searches */}
        <TabsContent value="portfolioSearches" className="space-y-6">
          {portfolioMatches.length === 0 ? (
            <EmptyStateCard icon={FolderLock} title="Portföyleriniz henüz bir arayışla eşleşmedi" />
          ) : (
            portfolioMatches.map(({ portfolio, searches }) => (
              <div key={portfolio.id}>
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={portfolio.coverImage}
                    alt={portfolio.title}
                    className="size-12 rounded-xl border border-border object-cover"
                  />
                  <div className="min-w-0">
                    <Link
                      to="/dashboard/portfolios/$id"
                      params={{ id: portfolio.id }}
                      className="block truncate font-semibold text-foreground transition-colors hover:text-gold"
                    >
                      {portfolio.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-gold">
                        {searches.length} ağ arayışıyla
                      </span>{" "}
                      eşleşiyor
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {searches.map((s) => (
                    <SurfaceCard key={s.id} className="p-4" hover>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/dashboard/searches/$id"
                          params={{ id: s.id }}
                          className="font-semibold text-foreground transition-colors hover:text-gold"
                        >
                          {s.title}
                        </Link>
                        <StatusBadge
                          tone={urgencyTones[s.urgency]}
                          label={urgencyLabels[s.urgency]}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.owner.fullName} · {portfolioTypeLabels[s.type]}
                      </p>
                      <p className="mt-2 text-sm font-medium text-secondary-foreground">
                        {formatPrice(s.budgetMin, s.currency)} –{" "}
                        {formatPrice(s.budgetMax, s.currency)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s.mustHave.slice(0, 3).map((f) => (
                          <FeatureChip key={f} label={f} />
                        ))}
                      </div>
                      <Button asChild size="sm" variant="outline" className="mt-3 w-full gap-1.5">
                        <Link to="/dashboard/searches/$id" params={{ id: s.id }}>
                          Arayışı Gör <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </SurfaceCard>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Tab 3 — network searches */}
        <TabsContent value="network" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {networkSearches.map((s) => (
              <NetworkSearchCard key={s.id} search={s} />
            ))}
          </div>
        </TabsContent>

        {/* Tab 4 — experts */}
        <TabsContent value="experts" className="space-y-4">
          <InfoPanel title="Neden bu uzmanlar?">
            <p className="text-sm text-secondary-foreground">
              Arayışlarınızın yoğunlaştığı bölgelerde aktif portföyü ve yüksek onay oranı olan
              profesyoneller önerildi.
            </p>
          </InfoPanel>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recommendedExperts.map((e) => (
              <ProfessionalCard key={e.id} professional={e} compact />
            ))}
          </div>
        </TabsContent>

        {/* Tab 5 — recent highlights */}
        <TabsContent value="recent" className="space-y-3">
          {networkSearches.slice(0, 4).map((s) => {
            const mine = getMyMatchesForBuyerSearch(s);
            return (
              <Link
                key={s.id}
                to="/dashboard/searches/$id"
                params={{ id: s.id }}
                className="flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/[0.05] p-4 shadow-elegant transition-colors hover:border-gold/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Bell className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{s.title}</p>
                  <p className="mt-0.5 text-sm text-secondary-foreground">
                    {s.owner.fullName} · {s.region} — portföylerinizden {mine.length} tanesi uyumlu
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {s.lastMatchAt ?? s.createdAt}
                  </p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-gold" />
              </Link>
            );
          })}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
