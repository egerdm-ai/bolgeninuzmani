import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Pencil, PauseCircle, PlayCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/vault/cards";
import { SearchCard } from "@/components/search/search-card";
import { SearchForm } from "@/components/search/search-form";
import { MatchResults } from "@/components/search/match-results";
import { RegionExperts } from "@/components/profile/region-experts";
import { featureFlags } from "@/lib/feature-flags";
import {
  getMySearch,
  updateSearch,
  setSearchStatus,
  type Search,
  type SearchInput,
} from "@/lib/data/searches";

type SearchParams = { mode?: "edit" };

export const Route = createFileRoute("/dashboard/my-searches/$id")({
  beforeLoad: () => {
    if (!featureFlags.arayis) throw redirect({ to: "/dashboard" });
  },
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    mode: s.mode === "edit" ? "edit" : undefined,
  }),
  component: MySearchDetail,
});

function MySearchDetail() {
  const { id } = Route.useParams();
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [search, setSearch] = useState<Search | null | undefined>(undefined);
  const [editing, setEditing] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getMySearch(id)
      .then((s) => active && setSearch(s))
      .catch(() => active && setSearch(null));
    return () => {
      active = false;
    };
  }, [id]);

  async function onSave(input: SearchInput) {
    setSubmitting(true);
    try {
      const updated = await updateSearch(id, input);
      setSearch(updated);
      setEditing(false);
      navigate({ to: "/dashboard/my-searches/$id", params: { id }, search: {} });
      toast.success("Arayış güncellendi.");
    } catch (e) {
      toast.error("Güncellenemedi", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus() {
    if (!search) return;
    const next = search.status === "closed" ? "active" : "closed";
    try {
      await setSearchStatus(id, next);
      setSearch({ ...search, status: next });
      toast.success(next === "closed" ? "Pasifleştirildi." : "Aktifleştirildi.");
    } catch (e) {
      toast.error("İşlem başarısız", { description: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <PageContainer className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
        <Link to="/dashboard/my-searches">
          <ArrowLeft className="size-4" /> Arayışlarım
        </Link>
      </Button>

      {search === undefined ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : search === null ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-sm text-muted-foreground">
          Arayış bulunamadı.
        </div>
      ) : editing ? (
        <>
          <PageHeader title="Arayışı Düzenle" subtitle={search.title} />
          <SurfaceCard>
            <SearchForm
              initial={search}
              submitting={submitting}
              submitLabel="Değişiklikleri Kaydet"
              onSubmit={onSave}
            />
          </SurfaceCard>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PageHeader title={search.title} subtitle="Arayış detayı" />
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-1.5" onClick={() => setEditing(true)}>
                <Pencil className="size-4" /> Düzenle
              </Button>
              <Button variant="outline" className="gap-1.5" onClick={toggleStatus}>
                {search.status === "closed" ? (
                  <PlayCircle className="size-4" />
                ) : (
                  <PauseCircle className="size-4" />
                )}
                {search.status === "closed" ? "Aktifleştir" : "Pasifleştir"}
              </Button>
            </div>
          </div>
          <div className="max-w-xl">
            <SearchCard search={search} context="mine" />
          </div>

          <MatchResults searchId={search.id} />

          {featureFlags.regionExperts && (
            <RegionExperts
              city={search.city}
              district={search.district}
              excludeOwner={search.owner_id}
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
