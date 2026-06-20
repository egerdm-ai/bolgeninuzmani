import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search as SearchIcon, FolderLock, PauseCircle, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { KpiCard, EmptyStateCard } from "@/components/vault/cards";
import { SearchCard } from "@/components/search/search-card";
import { cn } from "@/lib/utils";
import { featureFlags } from "@/lib/feature-flags";
import { useAuth } from "@/lib/auth/auth-context";
import {
  listMySearches,
  setSearchStatus,
  type Search,
  type SearchStatus,
} from "@/lib/data/searches";

export const Route = createFileRoute("/dashboard/my-searches/")({
  beforeLoad: () => {
    if (!featureFlags.arayis) throw redirect({ to: "/dashboard" });
  },
  component: MySearches,
});

type ChipKey = "all" | "active" | "closed";
const chips: { key: ChipKey; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "active", label: "Aktif" },
  { key: "closed", label: "Pasif" },
];
const lc = (s: string) => s.toLocaleLowerCase("tr-TR");

function MySearches() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<Search[] | null>(null);
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<ChipKey>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useMemo(
    () => async () => {
      if (!user) return;
      const rows = await listMySearches(user.id).catch(() => []);
      setSearches(rows);
    },
    [user],
  );
  useEffect(() => {
    load();
  }, [load]);

  async function onSetStatus(id: string, status: SearchStatus) {
    setBusyId(id);
    try {
      await setSearchStatus(id, status);
      await load();
      toast.success(status === "closed" ? "Arayış pasifleştirildi." : "Arayış aktifleştirildi.");
    } catch (e) {
      toast.error("İşlem başarısız", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusyId(null);
    }
  }

  const list = useMemo(() => {
    if (!searches) return [];
    const q = lc(query.trim());
    return searches.filter((s) => {
      if (chip !== "all" && s.status !== chip) return false;
      if (q && !lc(`${s.title} ${s.city ?? ""} ${s.district ?? ""} ${s.notes ?? ""}`).includes(q))
        return false;
      return true;
    });
  }, [searches, query, chip]);

  const activeCount = searches?.filter((s) => s.status === "active").length ?? 0;
  const closedCount = searches?.filter((s) => s.status === "closed").length ?? 0;

  return (
    <PageContainer className="space-y-7">
      <PageHeader
        title="Arayışlarım"
        subtitle="Müşterileriniz için oluşturduğunuz arayışları yönetin; ağda paylaşın."
        actions={
          <Button
            asChild
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <Link to="/dashboard/my-searches/new">
              <Plus className="size-4" /> Yeni Arayış Oluştur
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Aktif Arayış" value={String(activeCount)} icon={SearchIcon} />
        <KpiCard label="Pasif" value={String(closedCount)} icon={PauseCircle} />
        <KpiCard label="Toplam" value={String(searches?.length ?? 0)} icon={FolderLock} />
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Arayış adı, bölge veya not ara..."
          className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setChip(c.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              chip === c.key
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {searches === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : list.length === 0 ? (
        <EmptyStateCard
          icon={SearchIcon}
          title="Henüz arayış yok"
          description="Müşteriniz için bir arayış oluşturun; ağdaki emlakçılar uygun portföyleriyle ulaşabilsin."
          action={
            <Button
              asChild
              className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <Link to="/dashboard/my-searches/new">
                <Plus className="size-4" /> Yeni Arayış Oluştur
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((s) => (
            <SearchCard
              key={s.id}
              search={s}
              context="mine"
              onSetStatus={onSetStatus}
              busy={busyId === s.id}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
