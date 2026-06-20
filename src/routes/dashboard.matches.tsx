import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, MapPin, Loader2, Target } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, SurfaceCard, EmptyStateCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { featureFlags } from "@/lib/feature-flags";
import { useAuth } from "@/lib/auth/auth-context";
import { listMySearches, type Search } from "@/lib/data/searches";
import { matchSearch } from "@/lib/data/matches";

export const Route = createFileRoute("/dashboard/matches")({
  beforeLoad: () => {
    if (!featureFlags.matches) throw redirect({ to: "/dashboard" });
  },
  component: Matches,
});

type Row = { search: Search; count: number };

function Matches() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const searches = (await listMySearches(user.id).catch(() => [])).filter(
        (s) => s.status === "active",
      );
      const counts = await Promise.all(
        searches.map((s) =>
          matchSearch(s.id)
            .then((m) => m.length)
            .catch(() => 0),
        ),
      );
      if (active) setRows(searches.map((s, i) => ({ search: s, count: counts[i] })));
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const totalMatches = rows?.reduce((n, r) => n + r.count, 0) ?? 0;
  const region = (s: Search) =>
    [s.neighborhood, s.district, s.city].filter(Boolean).join(", ") || "Bölge belirtilmemiş";

  return (
    <PageContainer className="space-y-7">
      <PageHeader
        title="Eşleşmeler"
        subtitle="Aktif arayışlarınıza uyan ağ portföyleri. Bir arayışı açarak eşleşen portföyleri görün."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Aktif Arayış" value={String(rows?.length ?? 0)} icon={Target} />
        <KpiCard label="Toplam Eşleşme" value={String(totalMatches)} icon={Sparkles} />
      </div>

      {rows === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyStateCard
          icon={Target}
          title="Aktif arayış yok"
          description="Eşleşme görebilmek için müşteriniz adına aktif bir arayış oluşturun."
          action={
            <Button
              asChild
              className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <Link to="/dashboard/my-searches/new">Yeni Arayış Oluştur</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map(({ search, count }) => (
            <SurfaceCard key={search.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Link
                  to="/dashboard/my-searches/$id"
                  params={{ id: search.id }}
                  className="font-display text-base font-semibold text-foreground transition-colors hover:text-gold"
                >
                  {search.title}
                </Link>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3 text-gold" /> {region(search)}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold ring-1 ring-inset ring-gold/30">
                  <Sparkles className="size-3" /> {count} eşleşme
                </span>
              </div>
              <Button asChild size="sm" variant="outline" className="shrink-0 gap-1.5">
                <Link to="/dashboard/my-searches/$id" params={{ id: search.id }}>
                  Gör <ArrowRight className="size-4" />
                </Link>
              </Button>
            </SurfaceCard>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
