import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, SlidersHorizontal, BookmarkPlus, Sparkles, X, Check } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { SearchResultCard } from "@/components/vault/search-result-card";
import { MapCanvasMock } from "@/components/vault/map-canvas-mock";
import { DetailRequestModal } from "@/components/vault/detail-request-modal";
import { FilterModal } from "@/components/vault/filter-modal";
import { SaveSearchModal, type SaveSearchPayload } from "@/components/vault/save-search-modal";
import { portfolios } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { useSaved } from "@/lib/saved-store";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import type { Portfolio } from "@/lib/mock/types";
import {
  searchQuickChips,
  modalCategories,
  modalTransactionTypes,
  luxuryFeatures,
  livingSpaceCounters,
  recommendedFilters,
  privacyAccessFields,
  professionalFields,
  matchSearchFields,
  konutDetailFields,
  landFields,
  commercialFields,
  defaultFilterState,
  type FilterState,
  type FilterValue,
  type CategoryKey,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/dashboard/search")({
  validateSearch: (s: Record<string, unknown>): { region?: string } => ({
    region: typeof s.region === "string" ? s.region : undefined,
  }),
  component: SearchPage,
});

// label lookup for active-filter chips
const boolLabels: Record<string, string> = {};
[
  ...recommendedFilters.map((r) => ({ key: r.key, label: r.label })),
  ...searchQuickChips.filter((c) => c.kind === "toggle").map((c) => ({ key: c.key!, label: c.label })),
  ...privacyAccessFields,
  ...professionalFields,
  ...matchSearchFields,
  ...konutDetailFields.filter((f) => f.type === "boolean"),
  ...landFields.filter((f) => f.type === "boolean"),
  ...commercialFields.filter((f) => f.type === "boolean"),
].forEach((f) => {
  boolLabels[f.key] = f.label;
});

function compactPrice(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
}

function SearchPage() {
  const { region } = Route.useSearch();
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useSaved();
  const { create } = useMySearches();
  const searchable = useMemo(() => portfolios.filter((p) => p.status === "active"), []);

  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilterState,
    modalCategory: "all",
    ...(region ? { region } : {}),
  });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(searchable[0]?.id ?? "");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [requestTarget, setRequestTarget] = useState<Portfolio | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const setFilter = (key: string, value: FilterValue) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () => setFilters({ ...defaultFilterState, modalCategory: "all" });

  // ---- Mock filtering ----
  const filtered = useMemo(() => {
    const cat: CategoryKey | undefined = modalCategories.find((c) => c.value === filters.modalCategory)?.category;
    const featureHas = (p: Portfolio, kw: string) =>
      p.features.some((f) => f.toLocaleLowerCase("tr-TR").includes(kw.toLocaleLowerCase("tr-TR")));
    const isRecent = (p: Portfolio) => {
      const created = new Date(p.createdAt).getTime();
      return Date.now() - created < 1000 * 60 * 60 * 24 * 14;
    };
    const isExpert = (p: Portfolio) =>
      p.owner.expertiseRegions.some(
        (r) => p.neighborhood === r || p.district === r || p.regionLabel.includes(r),
      );
    const hasPdf = (p: Portfolio) => p.documents.some((d) => d.type === "pdf");

    return searchable.filter((p) => {
      const q = query.trim().toLocaleLowerCase("tr-TR");
      if (q) {
        const hay = `${p.title} ${p.regionLabel} ${p.district} ${p.city} ${p.owner.fullName} ${p.owner.companyName}`.toLocaleLowerCase("tr-TR");
        if (!hay.includes(q)) return false;
      }
      if (filters.modalCategory && filters.modalCategory !== "all" && cat && p.category !== cat) return false;
      if (filters.city && !p.city.toLocaleLowerCase("tr-TR").includes((filters.city as string).toLocaleLowerCase("tr-TR"))) return false;
      if (filters.region && !`${p.regionLabel} ${p.district}`.toLocaleLowerCase("tr-TR").includes((filters.region as string).toLocaleLowerCase("tr-TR"))) return false;
      if (filters.neighborhood && !`${p.neighborhood ?? ""} ${p.regionLabel}`.toLocaleLowerCase("tr-TR").includes((filters.neighborhood as string).toLocaleLowerCase("tr-TR"))) return false;
      if (filters.priceMin && p.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && p.price > Number(filters.priceMax)) return false;
      if (filters.grossM2 && (p.grossM2 ?? 0) < Number(filters.grossM2)) return false;
      if (filters.netM2 && (p.netM2 ?? 0) < Number(filters.netM2)) return false;
      if (filters.landM2 && (p.landM2 ?? 0) < Number(filters.landM2)) return false;

      // bedroom counter (mock: parse "5+1" → 5)
      const beds = Number((p.rooms ?? "").split("+")[0]) || 0;
      if (filters.cntRoom && beds < Number(filters.cntRoom)) return false;
      if (filters.cntBedroom && beds < Number(filters.cntBedroom)) return false;
      if (filters.cntBath && (p.bathrooms ?? 0) < Number(filters.cntBath)) return false;
      if (filters.cntParking && (p.parkingCapacity ?? 0) < Number(filters.cntParking)) return false;

      // luxury features
      const lux = Array.isArray(filters.luxuryFeatures) ? filters.luxuryFeatures : [];
      if (lux.length) {
        const labels = lux.map((v) => luxuryFeatures.find((f) => f.value === v)?.label ?? "");
        if (!labels.every((l) => p.features.includes(l))) return false;
      }

      // recommended + quick toggles
      if ((filters.recDeniz || filters.qcDeniz) && !featureHas(p, "Deniz")) return false;
      if ((filters.recHavuz || filters.qcHavuz) && !featureHas(p, "Havuz")) return false;
      if ((filters.recPdf || filters.qcPdf) && !hasPdf(p)) return false;
      if ((filters.recUzman || filters.qcUzman || filters.regionExpertsOnly) && !isExpert(p)) return false;
      if ((filters.recYeni || filters.qcYeni) && !isRecent(p)) return false;
      if ((filters.recTalep || filters.qcTalep || filters.requestRequired) && !p.requestRequired) return false;
      if ((filters.recOtopark || filters.qcOtopark) && (p.parkingCapacity ?? 0) <= 0 && !featureHas(p, "Otopark")) return false;
      if (filters.qc5Oda && beds < 5) return false;
      if (filters.verifiedOnly && !isExpert(p) && p.owner.membershipTier === "standard") return false;

      return true;
    });
  }, [searchable, filters, query]);

  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0];

  // ---- Active filter chips ----
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    const remove = (k: string, v?: FilterValue) => () => setFilter(k, v);

    if (filters.modalCategory && filters.modalCategory !== "all") {
      const label = modalCategories.find((c) => c.value === filters.modalCategory)?.label ?? "";
      chips.push({ key: "modalCategory", label, onRemove: remove("modalCategory", "all") });
    }
    if (filters.transaction && filters.transaction !== "satilik") {
      const label = modalTransactionTypes.find((t) => t.value === filters.transaction)?.label ?? "";
      if (label) chips.push({ key: "transaction", label, onRemove: remove("transaction", "satilik") });
    }
    for (const k of ["city", "region", "neighborhood"]) {
      if (filters[k]) chips.push({ key: k, label: `${filters[k]}`, onRemove: remove(k, undefined) });
    }
    if (filters.priceMin || filters.priceMax) {
      const lo = filters.priceMin ? compactPrice(Number(filters.priceMin)) : "0";
      const hi = filters.priceMax ? compactPrice(Number(filters.priceMax)) : "∞";
      chips.push({ key: "price", label: `${lo} – ${hi} ${filters.currency ?? "TRY"}`, onRemove: () => { setFilter("priceMin", undefined); setFilter("priceMax", undefined); } });
    }
    for (const c of livingSpaceCounters) {
      if (filters[c.key]) chips.push({ key: c.key, label: `${c.label} ${filters[c.key]}+`, onRemove: remove(c.key, undefined) });
    }
    const lux = Array.isArray(filters.luxuryFeatures) ? filters.luxuryFeatures : [];
    for (const v of lux) {
      const label = luxuryFeatures.find((f) => f.value === v)?.label ?? v;
      chips.push({ key: `lux-${v}`, label, onRemove: () => setFilter("luxuryFeatures", lux.filter((x) => x !== v)) });
    }
    for (const [k, v] of Object.entries(filters)) {
      if (v === true && boolLabels[k]) {
        chips.push({ key: k, label: boolLabels[k], onRemove: remove(k, false) });
      }
    }
    return chips;
  }, [filters]);

  const activeCount = activeChips.length;

  const confirmSave = (payload: SaveSearchPayload) => {
    setSaved(true);
    setSaveOpen(false);
    toast.success("Arayış olarak kaydedildi", {
      description: `${payload.name} · ${filtered.length} sonuç · Bildirim: ${notificationFrequencyLabels[payload.frequency]}`,
    });
  };

  return (
    <PageContainer className="space-y-0">
      {/* Sticky top search/filter bar */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/85 px-4 pb-3 pt-4 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Portföy, bölge veya profesyonel ara..."
              className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="gap-1.5 border-gold/40 text-gold hover:bg-gold/10">
              <Link to="/dashboard/assistant"><Sparkles className="size-4" /> VAULT Asistan'a Sor</Link>
            </Button>
            <Button variant="outline" className={cn("gap-1.5", activeCount > 0 && "border-gold/40 text-gold")} onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal className="size-4" /> Filtreler
              {activeCount > 0 && <span className="rounded-full bg-gold/15 px-1.5 text-[10px] font-bold text-gold">{activeCount}</span>}
            </Button>
            <Button
              variant="outline"
              className={cn("gap-1.5", saved && "border-gold/40 text-gold")}
              onClick={() => (saved ? toast.info("Bu arayış zaten kaydedildi") : setSaveOpen(true))}
            >
              {saved ? <Check className="size-4" /> : <BookmarkPlus className="size-4" />}
              {saved ? "Arayış Kaydedildi" : "Arayış Olarak Kaydet"}
            </Button>
          </div>
        </div>

        {/* Quick filter chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-0.5">
          {searchQuickChips.map((c) => {
            const active = c.kind === "toggle" ? !!filters[c.key!] : false;
            return (
              <button
                key={c.id}
                onClick={() => (c.kind === "modal" ? setFilterOpen(true) : setFilter(c.key!, !active))}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors",
                  active
                    ? "bg-gold/15 text-gold ring-gold/40"
                    : "bg-surface-2 text-secondary-foreground ring-border hover:ring-border-strong",
                )}
              >
                {c.label}
                {active && <X className="size-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count + applied chips */}
      <div className="flex flex-wrap items-center gap-2 py-3">
        <p className="text-sm">
          <span className="font-display text-lg font-semibold text-foreground">{filtered.length}</span>
          <span className="text-muted-foreground"> portföy</span>
        </p>
        {activeChips.length > 0 && (
          <>
            <span className="text-border-strong">·</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-border transition-colors hover:text-foreground"
                >
                  {chip.label}
                  <X className="size-3" />
                </button>
              ))}
              <button onClick={resetFilters} className="px-2 text-xs font-medium text-gold underline-offset-2 hover:underline">
                Temizle
              </button>
            </div>
          </>
        )}
      </div>

      {/* Split layout: list (left) + map (right) */}
      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(380px,44%)]">
        {/* Results list */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <SearchResultCard
                key={p.id}
                portfolio={p}
                selected={selected?.id === p.id}
                saved={isSaved(p.id)}
                onSelect={(x) => setSelectedId(x.id)}
                onHover={(x) => setHoveredId(x?.id ?? null)}
                onToggleSave={toggleSave}
                onRequestDetail={setRequestTarget}
              />
            ))
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-2 text-sm text-muted-foreground">
              Bu filtrelerle eşleşen portföy yok.
            </div>
          )}
        </div>

        {/* Map */}
        <div className="hidden lg:block">
          <div className="sticky top-[8.5rem] h-[calc(100vh-10rem)]">
            <div className="relative size-full">
              <MapCanvasMock
                portfolios={filtered}
                selectedId={selected?.id}
                hoveredId={hoveredId}
                onSelect={(p) => setSelectedId(p.id)}
                onHover={(p) => setHoveredId(p?.id ?? null)}
                className="h-full"
              />
              {/* Floating selected card */}
              {selected && (
                <div className="absolute inset-x-3 bottom-10 z-10 mx-auto max-w-md">
                  <SearchResultCard
                    portfolio={selected}
                    selected
                    saved={isSaved(selected.id)}
                    onToggleSave={toggleSave}
                    onRequestDetail={setRequestTarget}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DetailRequestModal portfolio={requestTarget} open={!!requestTarget} onOpenChange={(o) => !o && setRequestTarget(null)} />

      <FilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        setFilter={setFilter}
        resultCount={filtered.length}
        onClear={resetFilters}
      />

      <SaveSearchModal
        open={saveOpen}
        onOpenChange={setSaveOpen}
        activeCount={activeCount}
        resultCount={filtered.length}
        onSave={confirmSave}
      />
    </PageContainer>
  );
}
