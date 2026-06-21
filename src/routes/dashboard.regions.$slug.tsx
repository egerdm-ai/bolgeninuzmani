import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Search as SearchIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/vault/cards";
import { PortfolioTeaserCard, type TeaserCardData } from "@/components/portfolio/teaser-card";
import { PortfolioMap, type MapPoint } from "@/components/portfolio/portfolio-map";
import { RegionExperts } from "@/components/profile/region-experts";
import { featureFlags } from "@/lib/feature-flags";
import { useAuth } from "@/lib/auth/auth-context";
import { listNetworkPortfolios, type PortfolioWithCover } from "@/lib/data/portfolios";

export const Route = createFileRoute("/dashboard/regions/$slug")({
  beforeLoad: () => {
    if (!featureFlags.regions) throw redirect({ to: "/dashboard" });
  },
  component: RegionDetail,
});

const toCard = (p: PortfolioWithCover): TeaserCardData => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  price: p.price,
  currency: p.currency,
  transaction_type: p.transaction_type,
  category: p.category,
  mode: p.mode,
  ref_no: p.ref_no,
  city: p.city,
  district: p.district,
  neighborhood: p.neighborhood,
  coverThumb: p.cover_url,
  coverFull: p.cover_url_full,
  roomCount: p.room_count,
  grossM2: p.gross_m2,
  features: p.features,
});

function RegionDetail() {
  const { slug } = Route.useParams();
  const district = decodeURIComponent(slug);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PortfolioWithCover[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    listNetworkPortfolios(user.id, { district }, 0, 60)
      .then((r) => active && setItems(r.items))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [user, district]);

  const points = useMemo<MapPoint[]>(
    () =>
      (items ?? [])
        .filter((p) => p.approx_lat != null && p.approx_lng != null)
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          lat: p.approx_lat as number,
          lng: p.approx_lng as number,
          title: p.title,
        })),
    [items],
  );

  return (
    <PageContainer className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
        <Link to="/dashboard/regions">
          <ArrowLeft className="size-4" /> Bölgeler
        </Link>
      </Button>

      <PageHeader
        title={district}
        subtitle={`Bu bölgedeki yayında portföyler${items ? ` · ${items.length}` : ""}.`}
        actions={
          <Button asChild variant="outline" className="gap-1.5">
            <Link to="/dashboard/search" search={{ q: district }}>
              <SearchIcon className="size-4" /> Keşfet'te Filtrele
            </Link>
          </Button>
        }
      />

      {items === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : items.length === 0 ? (
        <EmptyStateCard
          icon={SearchIcon}
          title="Bu bölgede portföy yok"
          description="Şu an bu bölgede yayında portföy bulunmuyor."
        />
      ) : (
        <div
          className={
            featureFlags.harita ? "grid gap-6 lg:grid-cols-[1fr_minmax(0,400px)]" : undefined
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((p) => (
              <PortfolioTeaserCard key={p.id} context="app" p={toCard(p)} />
            ))}
          </div>
          {featureFlags.harita && points.length > 0 && (
            <aside className="hidden lg:block">
              <PortfolioMap
                className="sticky top-20 h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-border"
                points={points}
                onSelect={(pt) =>
                  navigate({ to: "/dashboard/portfolios/$id", params: { id: pt.id } })
                }
              />
            </aside>
          )}
        </div>
      )}

      {featureFlags.regionExperts && items && items.length > 0 && (
        <RegionExperts city={items[0].city} district={district} />
      )}
    </PageContainer>
  );
}
