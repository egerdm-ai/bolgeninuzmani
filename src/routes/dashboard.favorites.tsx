import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Search, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/vault/cards";
import { PortfolioTeaserCard } from "@/components/portfolio/teaser-card";
import { featureFlags } from "@/lib/feature-flags";
import { useAuth } from "@/lib/auth/auth-context";
import { listSavedPortfolios } from "@/lib/data/saved";
import { useSavedPortfolios } from "@/lib/use-saved-portfolios";
import type { TeaserCardData } from "@/components/portfolio/teaser-card";

export const Route = createFileRoute("/dashboard/favorites")({
  beforeLoad: () => {
    if (!featureFlags.follow) throw redirect({ to: "/dashboard" });
  },
  component: Favorites,
});

function Favorites() {
  const { user } = useAuth();
  const savedState = useSavedPortfolios();
  const [cards, setCards] = useState<TeaserCardData[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    listSavedPortfolios(user.id)
      .then((c) => active && setCards(c))
      .catch(() => active && setCards([]));
    return () => {
      active = false;
    };
  }, [user]);

  // Reflect un-saves immediately (a card toggled off drops out of the list).
  const visible = (cards ?? []).filter((c) => savedState.isSaved(c.id));

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Kaydedilenler"
        subtitle="Daha sonra incelemek için kaydettiğiniz portföyler."
      />

      {cards === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyStateCard
          icon={Bookmark}
          title="Henüz kayıt yok"
          description="Keşfet'te beğendiğiniz portföyleri yer işaretiyle kaydedin; burada toplanır."
          action={
            <Button
              asChild
              className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <Link to="/dashboard/search">
                <Search className="size-4" /> Keşfet
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <PortfolioTeaserCard
              key={c.id}
              p={c}
              context="app"
              saved={savedState.isSaved(c.id)}
              onToggleSave={savedState.enabled ? savedState.toggle : undefined}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
