import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SearchCard } from "@/components/search/search-card";
import { featureFlags } from "@/lib/feature-flags";
import { getMySearch, type Search } from "@/lib/data/searches";

export const Route = createFileRoute("/dashboard/searches/$id")({
  beforeLoad: () => {
    if (!featureFlags.arayis) throw redirect({ to: "/dashboard" });
  },
  component: NetworkSearchDetail,
});

function NetworkSearchDetail() {
  const { id } = Route.useParams();
  const [search, setSearch] = useState<Search | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    // RLS allows verified members to read ACTIVE searches (or their own).
    getMySearch(id)
      .then((s) => active && setSearch(s))
      .catch(() => active && setSearch(null));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <PageContainer className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
        <Link to="/dashboard/searches">
          <ArrowLeft className="size-4" /> Ağ Arayışları
        </Link>
      </Button>

      {search === undefined ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : search === null ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-sm text-muted-foreground">
          Arayış bulunamadı veya aktif değil.
        </div>
      ) : (
        <>
          <PageHeader title={search.title} subtitle="Ağ arayışı detayı" />
          <div className="max-w-xl">
            <SearchCard search={search} context="network" />
          </div>
        </>
      )}
    </PageContainer>
  );
}
