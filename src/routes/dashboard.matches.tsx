import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, GitCompareArrows, FolderLock, Users, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard, SurfaceCard, EmptyStateCard, InfoPanel } from "@/components/vault/cards";
import { StatusBadge, FeatureChip } from "@/components/vault/badges";
import { Button } from "@/components/ui/button";
import { MatchExplanationCard } from "@/components/vault/match-explanation-card";
import { ProfessionalCard } from "@/components/vault/professional-card";
import {
  buyerSearchStatusLabels,
  buyerSearchStatusTones,
} from "@/components/vault/buyer-search-card";
import {
  buyerSearches,
  getMatchesForSearch,
  getMatchingSearchesForPortfolio,
} from "@/lib/mock/matching";
import { myPortfolios, professionals, currentUser } from "@/lib/mock/data";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { useSaved } from "@/lib/saved-store";
import { useDetailRequest } from "@/lib/detail-request-store";

export const Route = createFileRoute("/dashboard/matches")({
  component: Matches,
});

function Matches() {
  const { isSaved, toggleSave } = useSaved();
  const { open: openRequest } = useDetailRequest();

  // Tab 1 — best portfolio match per saved search
  const searchMatches = buyerSearches
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

  // Tab 2 — buyer searches matching my own portfolios
  const portfolioMatches = myPortfolios
    .map((p) => ({ portfolio: p, searches: getMatchingSearchesForPortfolio(p) }))
    .filter((x) => x.searches.length > 0);

  // Tab 3 — recommended region experts (excluding me)
  const recommendedExperts = professionals.filter((p) => p.id !== currentUser.id);

  const totalPortfolioMatches = portfolioMatches.reduce(
    (s, x) => s + x.searches.length,
    0,
  );

  return (
    <PageContainer className="space-y-7">
      <PageHeader
        title="Eşleşmeler"
        subtitle="Arayışlarınızla eşleşen portföyleri, portföylerinizle eşleşen arayışları ve önerilen bölge uzmanlarını tek ekranda görün."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Arayış Eşleşmesi" value={String(searchMatches.length)} icon={Sparkles} />
        <KpiCard label="Portföy Eşleşmesi" value={String(totalPortfolioMatches)} icon={FolderLock} />
        <KpiCard label="Önerilen Uzman" value={String(recommendedExperts.length)} icon={Users} />
      </div>

      <Tabs defaultValue="searches" className="space-y-5">
        <TabsList className="bg-surface-2">
          <TabsTrigger value="searches">Arayışlarımla Eşleşenler</TabsTrigger>
          <TabsTrigger value="portfolios">Portföylerimle Eşleşen Arayışlar</TabsTrigger>
          <TabsTrigger value="experts">Önerilen Bölge Uzmanları</TabsTrigger>
        </TabsList>

        {/* Tab 1 */}
        <TabsContent value="searches" className="space-y-4">
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
                    to="/dashboard/searches/$id"
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

        {/* Tab 2 */}
        <TabsContent value="portfolios" className="space-y-6">
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
                      <span className="font-semibold text-gold">{searches.length} aktif arayışla</span> eşleşiyor
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
                          label={buyerSearchStatusLabels[s.status]}
                          tone={buyerSearchStatusTones[s.status]}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.clientLabel ?? s.clientType} · {portfolioTypeLabels[s.type]}
                      </p>
                      <p className="mt-2 text-sm font-medium text-secondary-foreground">
                        {formatPrice(s.budgetMin, s.currency)} – {formatPrice(s.budgetMax, s.currency)}
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

        {/* Tab 3 */}
        <TabsContent value="experts" className="space-y-4">
          <InfoPanel title="Neden bu uzmanlar?">
            <p className="text-sm text-secondary-foreground">
              Arayışlarınızın yoğunlaştığı bölgelerde aktif portföyü ve yüksek onay oranı olan profesyoneller önerildi.
            </p>
          </InfoPanel>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recommendedExperts.map((e) => (
              <ProfessionalCard key={e.id} professional={e} compact />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
