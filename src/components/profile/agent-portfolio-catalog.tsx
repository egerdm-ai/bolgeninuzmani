import { useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PortfolioTeaserCard, type TeaserCardData } from "@/components/portfolio/teaser-card";
import { CATEGORY_LABELS } from "@/lib/portfolio-labels";

type SortKey = "default" | "price_desc" | "price_asc";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "default", label: "En Yeni" },
  { value: "price_desc", label: "Fiyat (Yüksek)" },
  { value: "price_asc", label: "Fiyat (Düşük)" },
];

/**
 * Lovable-style portfolio catalog SHELL (search + region/category chips + sort +
 * count + grid) — but operating ONLY on teaser-safe TeaserCardData and rendering
 * the shared PortfolioTeaserCard (context "public"). No mock Portfolio, no locked
 * fields. Region/category chips are derived from the data, not hardcoded.
 */
export function AgentPortfolioCatalog({ portfolios }: { portfolios: TeaserCardData[] }) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("default");

  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const p of portfolios) {
      if (p.district) set.add(p.district);
      else if (p.city) set.add(p.city);
    }
    return [...set].slice(0, 6);
  }, [portfolios]);

  const categories = useMemo(() => [...new Set(portfolios.map((p) => p.category))], [portfolios]);

  const filtersActive = search !== "" || region != null || category != null;
  const clearAll = () => {
    setSearch("");
    setRegion(null);
    setCategory(null);
  };

  const filtered = useMemo(() => {
    let list = portfolios.filter((p) => {
      if (search) {
        const q = search.toLocaleLowerCase("tr");
        const hay =
          `${p.title} ${p.neighborhood ?? ""} ${p.district ?? ""} ${p.city ?? ""}`.toLocaleLowerCase(
            "tr",
          );
        if (!hay.includes(q)) return false;
      }
      if (region && p.district !== region && p.city !== region && p.neighborhood !== region)
        return false;
      if (category && p.category !== category) return false;
      return true;
    });
    list = [...list];
    if (sort === "price_desc") list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sort === "price_asc") list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    return list;
  }, [portfolios, search, region, category, sort]);

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Portföyleri</h2>
        <p className="text-sm text-muted-foreground">
          Bu profesyonelin paylaştığı portföyleri bölge ve kategoriye göre inceleyin.
        </p>
      </div>

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
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-10 sm:w-44">
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
          </div>

          {(regions.length > 0 || categories.length > 1) && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip active={!filtersActive} onClick={clearAll}>
                Tümü
              </Chip>
              {categories.map((c) => (
                <Chip
                  key={c}
                  active={category === c}
                  onClick={() => setCategory(category === c ? null : c)}
                >
                  {CATEGORY_LABELS[c]}
                </Chip>
              ))}
              {regions.map((r) => (
                <Chip
                  key={r}
                  active={region === r}
                  onClick={() => setRegion(region === r ? null : r)}
                >
                  {r}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </SurfaceCard>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span> portföy
          gösteriliyor
        </p>
        {filtersActive && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto gap-1.5 text-muted-foreground"
            onClick={clearAll}
          >
            <RotateCcw className="size-3.5" /> Filtreleri Sıfırla
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center text-sm text-muted-foreground">
          {portfolios.length === 0
            ? "Şu an yayında portföy yok."
            : "Seçilen filtrelere uygun portföy bulunamadı."}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PortfolioTeaserCard key={p.id} p={p} context="public" />
          ))}
        </div>
      )}
    </section>
  );
}

function Chip({
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
