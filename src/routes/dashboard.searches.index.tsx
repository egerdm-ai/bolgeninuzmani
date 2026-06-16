import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Compass, Sparkles, Flame, FolderLock, Award } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, EmptyStateCard } from "@/components/vault/cards";
import { NetworkSearchCard } from "@/components/vault/network-search-card";
import { networkSearches, getMyMatchesForBuyerSearch } from "@/lib/mock/matching";
import { cn } from "@/lib/utils";
import type { BuyerSearch } from "@/lib/mock/types";

type SearchParams = { region?: string };

export const Route = createFileRoute("/dashboard/searches/")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    region: typeof s.region === "string" ? s.region : undefined,
  }),
  component: Searches,
});

type ChipKey =
  | "all"
  | "mine"
  | "bodrum"
  | "istanbul"
  | "villa"
  | "arsa"
  | "ticari"
  | "high_budget"
  | "urgent"
  | "experts";

const chips: { key: ChipKey; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "mine", label: "Portföylerimle Eşleşenler" },
  { key: "bodrum", label: "Bodrum" },
  { key: "istanbul", label: "İstanbul" },
  { key: "villa", label: "Villa" },
  { key: "arsa", label: "Arsa" },
  { key: "ticari", label: "Ticari" },
  { key: "high_budget", label: "Yüksek Bütçe" },
  { key: "urgent", label: "Acil" },
  { key: "experts", label: "Bölge Uzmanlarından" },
];

type SortKey = "newest" | "match" | "budget" | "urgency";
const sorts: { key: SortKey; label: string }[] = [
  { key: "newest", label: "En Yeni" },
  { key: "match", label: "En Yüksek Eşleşme" },
  { key: "budget", label: "Bütçe" },
  { key: "urgency", label: "Aciliyet" },
];

const urgencyRank = { high: 3, medium: 2, low: 1 } as const;

const lc = (s: string) => s.toLocaleLowerCase("tr-TR");
const bodrumRegions = ["bodrum", "yalıkavak", "türkbükü", "göcek", "gümüşlük"];

function matchesChip(b: BuyerSearch, chip: ChipKey): boolean {
  switch (chip) {
    case "all":
      return true;
    case "mine":
      return getMyMatchesForBuyerSearch(b).length > 0;
    case "bodrum":
      return bodrumRegions.includes(lc(b.region)) || lc(b.city) === "muğla";
    case "istanbul":
      return lc(b.city) === "i̇stanbul" || lc(b.city) === "istanbul";
    case "villa":
      return b.type === "villa";
    case "arsa":
      return b.type === "land";
    case "ticari":
      return b.type === "commercial" || b.type === "office";
    case "high_budget":
      return b.budgetMax >= 80_000_000;
    case "urgent":
      return b.urgency === "high";
    case "experts":
      return b.owner.expertiseRegions.some((r) => lc(r) === lc(b.region));
    default:
      return true;
  }
}

function Searches() {
  const { region } = Route.useSearch();
  const [query, setQuery] = useState(region ?? "");
  const [chip, setChip] = useState<ChipKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const list = useMemo(() => {
    const q = lc(query.trim());
    let arr = networkSearches.filter((b) => matchesChip(b, chip));
    if (q) {
      arr = arr.filter((b) =>
        lc(`${b.title} ${b.region} ${b.city} ${b.owner.fullName} ${b.owner.companyName}`).includes(q),
      );
    }
    const sorted = [...arr];
    if (sort === "match") sorted.sort((a, b) => b.matchCount - a.matchCount);
    else if (sort === "budget") sorted.sort((a, b) => b.budgetMax - a.budgetMax);
    else if (sort === "urgency") sorted.sort((a, b) => urgencyRank[b.urgency] - urgencyRank[a.urgency]);
    return sorted;
  }, [query, chip, sort]);

  const mineCount = networkSearches.filter((b) => getMyMatchesForBuyerSearch(b).length > 0).length;
  const urgentCount = networkSearches.filter((b) => b.urgency === "high").length;
  const expertCount = networkSearches.filter((b) =>
    b.owner.expertiseRegions.some((r) => lc(r) === lc(b.region)),
  ).length;

  return (
    <PageContainer className="space-y-7">
      <PageHeader
        title="Arayışlar"
        subtitle="VAULT ağı içindeki aktif alıcı arayışlarını keşfedin; portföylerinizle eşleşen talepleri bulun."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Aktif Ağ Arayışı" value={String(networkSearches.length)} icon={Compass} />
        <KpiCard label="Portföyümle Eşleşen" value={String(mineCount)} icon={FolderLock} />
        <KpiCard label="Acil Arayış" value={String(urgentCount)} icon={Flame} />
        <KpiCard label="Bölge Uzmanından" value={String(expertCount)} icon={Award} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bölge, portföy tipi veya profesyonel ara..."
          className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
        />
      </div>

      {/* Filter chips */}
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

      {/* Sort */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sırala</span>
        {sorts.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={cn(
              "rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
              sort === s.key
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-border bg-surface-3 text-secondary-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyStateCard
          icon={Sparkles}
          title="Bu filtrelerle arayış bulunamadı"
          description="Farklı bir bölge, tip veya filtre deneyin."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((s) => (
            <NetworkSearchCard key={s.id} search={s} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
