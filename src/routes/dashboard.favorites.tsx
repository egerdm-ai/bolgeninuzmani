import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { featureFlags } from "@/lib/feature-flags";
import { Bookmark, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { PortfolioCard } from "@/components/vault/portfolio-card";
import { EmptyStateCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/vault/cards";
import { portfolios, savedSearches } from "@/lib/mock/data";
import { useSaved } from "@/lib/saved-store";

export const Route = createFileRoute("/dashboard/favorites")({
  beforeLoad: () => {
    if (!featureFlags.follow) throw redirect({ to: "/dashboard" });
  },
  component: Favorites,
});

function Favorites() {
  const { savedPortfolios, isSaved, toggleSave } = useSaved();
  const saved = portfolios.filter((p) => savedPortfolios.includes(p.id));

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="Kaydettiklerim" subtitle="Kaydettiğiniz portföyler ve aramalar." />

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Kayıtlı Portföyler</h2>
        {saved.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((p) => (
              <PortfolioCard
                key={p.id}
                portfolio={p}
                saved={isSaved(p.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            icon={Bookmark}
            title="Henüz kayıtlı portföy yok"
            description="Beğendiğiniz portföyleri kaydedin, burada toplanır."
            action={
              <Button asChild className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Link to="/dashboard/search">Portföy Ara</Link>
              </Button>
            }
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Kayıtlı Aramalar</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {savedSearches.map((s) => (
            <SurfaceCard key={s.id} hover className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-foreground">{s.label}</h3>
                <span className="flex size-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Search className="size-4" />
                </span>
              </div>
              <p className="text-xs text-muted-foreground">"{s.query}"</p>
              <div className="flex flex-wrap gap-1.5">
                {s.filters.map((f) => (
                  <span
                    key={f}
                    className="rounded-md bg-surface-3 px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gold">{s.resultCount} sonuç</span>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-gold hover:text-gold-light"
                >
                  <Link to="/dashboard/search">Aramayı Aç</Link>
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
