import { useMemo, useState } from "react";
import { Search, LayoutGrid, List, X, RotateCcw } from "lucide-react";
import type { Portfolio, Professional } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { SurfaceCard } from "./cards";
import { PortfolioCard } from "./portfolio-card";
import { ProfessionalPortfolioListItem } from "./professional-portfolio-list-item";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSaved } from "@/lib/saved-store";

type SortKey = "newest" | "price" | "requests" | "match";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "newest", label: "En Yeni" },
  { value: "price", label: "Fiyat" },
  { value: "requests", label: "En Çok Talep Alan" },
  { value: "match", label: "En Yüksek Eşleşme" },
];

const regionMatch = (p: Portfolio, name: string) =>
  p.neighborhood === name ||
  p.district === name ||
  p.city === name ||
  p.regionLabel.toLocaleLowerCase("tr").includes(name.toLocaleLowerCase("tr"));

const featureMatch = (p: Portfolio, kw: string) =>
  p.features.some((f) => f.toLocaleLowerCase("tr").includes(kw.toLocaleLowerCase("tr"))) ||
  p.tags.some((t) => t.toLocaleLowerCase("tr").includes(kw.toLocaleLowerCase("tr")));

/** Type / feature quick chips handled internally (region chips lift state up). */
const typeFeatureChips: { id: string; label: string; test: (p: Portfolio) => boolean }[] = [
  { id: "villa", label: "Villa", test: (p) => p.type === "villa" },
  { id: "yali", label: "Yalı", test: (p) => featureMatch(p, "yalı") || /yalı/i.test(p.title) },
  { id: "arsa", label: "Arsa", test: (p) => p.type === "land" },
  { id: "ticari", label: "Ticari", test: (p) => p.type === "commercial" || p.category === "ticari" },
  { id: "deniz", label: "Deniz Manzaralı", test: (p) => featureMatch(p, "deniz") },
  { id: "havuz", label: "Havuzlu", test: (p) => featureMatch(p, "havuz") },
];

const regionChips = ["Bodrum", "Yalıkavak", "Bebek"];

/**
 * WhatsApp-catalog style portfolio browser for a professional profile.
 * Search, quick chips, region pill, list/grid toggle and sort all run locally.
 */
export function ProfessionalPortfolioCatalog({
  portfolios,
  regionFilter,
  onRegionChange,
  onRequestDetail,
}: {
  portfolios: Portfolio[];
  regionFilter: string | null;
  onRegionChange: (region: string | null) => void;
  onRequestDetail: (p: Portfolio) => void;
}) {
  const { isSaved, toggleSave } = useSaved();
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "grid">("list");
  const [sort, setSort] = useState<SortKey>("newest");

  const toggleChip = (id: string) =>
    setChips((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const clearAll = () => {
    setSearch("");
    setChips([]);
    onRegionChange(null);
  };

  const filtersActive = search !== "" || chips.length > 0 || regionFilter != null;

  const filtered = useMemo(() => {
    let list = portfolios.filter((p) => {
      if (search) {
        const q = search.toLocaleLowerCase("tr");
        const hay = `${p.title} ${p.regionLabel} ${p.neighborhood ?? ""}`.toLocaleLowerCase("tr");
        if (!hay.includes(q)) return false;
      }
      if (regionFilter && !regionMatch(p, regionFilter)) return false;
      for (const id of chips) {
        const def = typeFeatureChips.find((c) => c.id === id);
        if (def && !def.test(p)) return false;
      }
      return true;
    });

    list = [...list];
    if (sort === "price") list.sort((a, b) => b.price - a.price);
    else if (sort === "requests") list.sort((a, b) => b.requestCount - a.requestCount);
    else if (sort === "match") list.sort((a, b) => b.viewCount - a.viewCount);
    return list;
  }, [portfolios, search, regionFilter, chips, sort]);

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Portföyleri</h2>
        <p className="text-sm text-muted-foreground">
          Bu profesyonelin paylaştığı kapalı portföyleri bölge, tip ve özelliklere göre inceleyin.
        </p>
      </div>

      {/* Controls */}
      <SurfaceCard className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Bu profesyonelin portföylerinde ara..."
                className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-10 w-40 bg-surface-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm",
                    view === "list" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  <List className="size-4" /> Liste
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm",
                    view === "grid" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  <LayoutGrid className="size-4" /> Grid
                </button>
              </div>
            </div>
          </div>

          {/* Quick filter chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={clearAll}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                !filtersActive
                  ? "bg-gold/15 text-gold ring-gold/30"
                  : "bg-surface-2 text-secondary-foreground ring-border hover:ring-border-strong",
              )}
            >
              Tümü
            </button>
            {typeFeatureChips.slice(0, 4).map((c) => (
              <ChipButton key={c.id} active={chips.includes(c.id)} onClick={() => toggleChip(c.id)}>
                {c.label}
              </ChipButton>
            ))}
            {regionChips.map((r) => (
              <ChipButton
                key={r}
                active={regionFilter === r}
                onClick={() => onRegionChange(regionFilter === r ? null : r)}
              >
                {r}
              </ChipButton>
            ))}
            {typeFeatureChips.slice(4).map((c) => (
              <ChipButton key={c.id} active={chips.includes(c.id)} onClick={() => toggleChip(c.id)}>
                {c.label}
              </ChipButton>
            ))}
          </div>
        </div>
      </SurfaceCard>

      {/* Active region pill + count */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span> portföy gösteriliyor
        </p>
        {regionFilter && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold ring-1 ring-inset ring-gold/30">
            Bölge: {regionFilter}
            <button onClick={() => onRegionChange(null)} aria-label="Bölge filtresini kaldır">
              <X className="size-3" />
            </button>
          </span>
        )}
        {filtersActive && (
          <Button variant="ghost" size="sm" className="ml-auto gap-1.5 text-muted-foreground" onClick={clearAll}>
            <RotateCcw className="size-3.5" /> Filtreleri Sıfırla
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">Seçilen filtrelere uygun portföy bulunamadı.</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={clearAll}>
            <RotateCcw className="size-3.5" /> Filtreleri Sıfırla
          </Button>
        </div>
      ) : view === "list" ? (
        <div className="mt-4 space-y-2.5">
          {filtered.map((p) => (
            <ProfessionalPortfolioListItem
              key={p.id}
              portfolio={p}
              saved={isSaved(p.id)}
              onToggleSave={toggleSave}
              onRequestDetail={onRequestDetail}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PortfolioCard
              key={p.id}
              portfolio={p}
              saved={isSaved(p.id)}
              onToggleSave={toggleSave}
              onRequestDetail={onRequestDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
        active
          ? "bg-gold/15 text-gold ring-gold/30"
          : "bg-surface-2 text-secondary-foreground ring-border hover:ring-border-strong",
      )}
    >
      {children}
    </button>
  );
}
