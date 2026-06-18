import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Sparkles, CheckCircle2, Clock, Bell } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { KpiCard, EmptyStateCard } from "@/components/vault/cards";
import { BuyerSearchCard } from "@/components/vault/buyer-search-card";
import { useMySearches } from "@/lib/my-searches-store";
import { cn } from "@/lib/utils";
import type { BuyerSearch } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/my-searches/")({
  component: MySearches,
});

type ChipKey = "all" | "active" | "matched" | "awaiting" | "closed" | "notify";
const chips: { key: ChipKey; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "active", label: "Aktif" },
  { key: "matched", label: "Yeni Eşleşme" },
  { key: "awaiting", label: "Yanıt Bekliyor" },
  { key: "closed", label: "Pasif" },
  { key: "notify", label: "Bildirim Açık" },
];

type SortKey = "lastMatch" | "newest" | "mostMatched" | "budget";
const sorts: { key: SortKey; label: string }[] = [
  { key: "lastMatch", label: "Son Eşleşme" },
  { key: "newest", label: "En Yeni" },
  { key: "mostMatched", label: "En Çok Eşleşen" },
  { key: "budget", label: "Bütçe" },
];

const lc = (s: string) => s.toLocaleLowerCase("tr-TR");

function matchesChip(b: BuyerSearch, chip: ChipKey): boolean {
  if (chip === "all") return true;
  if (chip === "notify") return (b.notify ?? "instant") !== "off";
  return b.status === chip;
}

function MySearches() {
  const { searches } = useMySearches();
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<ChipKey>("all");
  const [sort, setSort] = useState<SortKey>("lastMatch");

  const list = useMemo(() => {
    const q = lc(query.trim());
    let arr = searches.filter((b) => matchesChip(b, chip));
    if (q) {
      arr = arr.filter((b) =>
        lc(`${b.title} ${b.clientLabel ?? ""} ${b.region} ${b.notes ?? ""}`).includes(q),
      );
    }
    const sorted = [...arr];
    if (sort === "mostMatched") sorted.sort((a, b) => b.matchCount - a.matchCount);
    else if (sort === "budget") sorted.sort((a, b) => b.budgetMax - a.budgetMax);
    return sorted;
  }, [searches, query, chip, sort]);

  const matched = searches.filter((b) => b.status === "matched").length;
  const awaiting = searches.filter((b) => b.status === "awaiting").length;
  const totalMatches = searches.reduce((s, b) => s + b.matchCount, 0);
  const active = searches.filter((b) => b.status !== "closed").length;

  return (
    <PageContainer className="space-y-7">
      <PageHeader
        title="Arayışlarım"
        subtitle="Müşterileriniz için kaydettiğiniz arayışları takip edin; yeni portföyler eşleştiğinde bildirim alın."
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Aktif Arayış" value={String(active)} icon={Search} />
        <KpiCard label="Yeni Eşleşme" value={String(matched)} icon={CheckCircle2} />
        <KpiCard label="Yanıt Bekleyen" value={String(awaiting)} icon={Clock} />
        <KpiCard label="Toplam Eşleşme" value={String(totalMatches)} icon={Sparkles} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Arayış adı, müşteri notu veya bölge ara..."
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
              "inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              chip === c.key
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
            )}
          >
            {c.key === "notify" && <Bell className="size-3" />}
            {c.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sırala
        </span>
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
          icon={Search}
          title="Henüz arayış yok"
          description="Müşteriniz için bir arayış oluşturun; uygun portföyler eşleştiğinde bildirim alın."
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
            <BuyerSearchCard key={s.id} search={s} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
