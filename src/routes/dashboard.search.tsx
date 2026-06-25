import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Eye,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { Constants } from "@/lib/database.types";
import { listNetworkPortfolios, type PortfolioWithCover } from "@/lib/data/portfolios";
import {
  CATEGORY_LABELS,
  TRANSACTION_LABELS,
  formatPortfolioPrice,
  abbreviatePrice,
} from "@/lib/portfolio-labels";
import { SearchResultCard } from "@/components/vault/search-result-card";
import { ThumbImage } from "@/components/portfolio/thumb-image";
import { CoverPlaceholder } from "@/components/portfolio/cover-placeholder";
import { PortfolioMap, type MapPoint } from "@/components/portfolio/portfolio-map";
import { KesfetFilterPanel } from "@/components/portfolio/kesfet-filter-panel";
import {
  EMPTY_KESFET_FILTERS,
  kesfetFiltersToNetwork,
  deriveChips,
  countActiveFilters,
  type KesfetFilters,
} from "@/lib/kesfet-filters";
import { useSavedPortfolios } from "@/lib/use-saved-portfolios";
import { featureFlags } from "@/lib/feature-flags";

// Quick chips: fast toggles for the most-used features (write into features[]).
const QUICK_FEATURES = [
  { label: "Deniz Manzaralı", value: "Deniz Manzarası" },
  { label: "Havuzlu", value: "Havuz" },
  { label: "Otoparklı", value: "Otopark" },
];

export const Route = createFileRoute("/dashboard/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" && s.q.trim() ? s.q : undefined,
  }),
  component: Kesfet,
});

const PAGE_SIZE = 12;
const ALL = "all";
const CATEGORIES = Constants.public.Enums.portfolio_category;
const TRANSACTIONS = Constants.public.Enums.transaction_type;

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function Kesfet() {
  const { user } = useAuth();
  const savedState = useSavedPortfolios();
  const navigate = useNavigate();
  const { q: initialQ } = Route.useSearch();

  const [filters, setFilters] = useState<KesfetFilters>({
    ...EMPTY_KESFET_FILTERS,
    q: initialQ ?? "",
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{ items: PortfolioWithCover[]; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  // Typed fields (search/price/m²) debounce; the whole mapped filter set is debounced
  // together so a keystroke and a chip toggle share one cheap settle window.
  const networkFilters = useMemo(() => kesfetFiltersToNetwork(filters), [filters]);
  const debounced = useDebounced(networkFilters, 250);

  // Filters changed → back to page 0.
  useEffect(() => setPage(0), [debounced]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setFetching(true);
    setError(null);
    listNetworkPortfolios(user.id, debounced, page, PAGE_SIZE)
      .then((r) => active && setResult(r))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => active && setFetching(false));
    return () => {
      active = false;
    };
  }, [user, debounced, page]);

  const toggleFeature = (v: string) =>
    setFilters((f) => ({
      ...f,
      features: f.features.includes(v)
        ? f.features.filter((x) => x !== v)
        : [...f.features, v],
    }));

  const chips = deriveChips(filters);
  const activeCount = countActiveFilters(filters);
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Keşfet"
        subtitle="Ağdaki doğrulanmış emlakçıların yayındaki portföyleri (teaser)."
      />

      {/* Compact filter bar (Airbnb-style): search + a couple of quick selects + Filtreler */}
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="Başlık, şehir, ilçe veya mahalle ara…"
              className="pl-9"
            />
          </div>
          <Select
            value={filters.category ?? ALL}
            onValueChange={(c) =>
              setFilters((f) => ({
                ...f,
                category: c === ALL ? null : (c as KesfetFilters["category"]),
                subcategory: null,
                attrs: {},
              }))
            }
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tüm kategoriler</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.transaction ?? ALL}
            onValueChange={(t) =>
              setFilters((f) => ({
                ...f,
                transaction: t === ALL ? null : (t as KesfetFilters["transaction"]),
              }))
            }
          >
            <SelectTrigger className="sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tüm işlemler</SelectItem>
              {TRANSACTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {TRANSACTION_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-1.5" onClick={() => setPanelOpen(true)}>
            <SlidersHorizontal className="size-4" /> Filtreler
            {activeCount > 0 && (
              <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold ring-1 ring-inset ring-gold/40">
                {activeCount}
              </span>
            )}
          </Button>
        </div>

        {/* Quick feature chips — instant, horizontal-scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-border pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_FEATURES.map((f) => (
            <QuickChip
              key={f.value}
              active={filters.features.includes(f.value)}
              onClick={() => toggleFeature(f.value)}
            >
              {f.label}
            </QuickChip>
          ))}
          <span className="mx-1 h-4 w-px shrink-0 bg-border" />
          <QuickChip
            active={filters.mode === "controlled"}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                mode: f.mode === "controlled" ? null : "controlled",
              }))
            }
          >
            Detay Talebi Açık
          </QuickChip>
          <QuickChip
            active={filters.mode === "call_only"}
            onClick={() =>
              setFilters((f) => ({ ...f, mode: f.mode === "call_only" ? null : "call_only" }))
            }
          >
            Kapalı Portföy
          </QuickChip>
        </div>

        {/* Applied chips + count + clear */}
        {(chips.length > 0 || result !== null) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {result !== null && (
              <span className="text-sm font-medium text-foreground">{total} portföy</span>
            )}
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilters((f) => c.clear(f))}
                className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold hover:bg-gold/20"
              >
                {c.label}
                <X className="size-3" />
              </button>
            ))}
            {chips.length > 0 && (
              <button
                onClick={() => setFilters((f) => ({ ...EMPTY_KESFET_FILTERS, currency: f.currency }))}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
        )}
      </div>

      <KesfetFilterPanel
        value={filters}
        onChange={setFilters}
        onClear={() => setFilters((f) => ({ ...EMPTY_KESFET_FILTERS, currency: f.currency }))}
        count={total}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />

      {/* Thin loading bar on refetch (results stay on screen) */}
      <div className="h-0.5 overflow-hidden rounded-full bg-transparent">
        {fetching && result !== null && (
          <div className="h-full w-1/3 animate-pulse rounded-full bg-gold" />
        )}
      </div>

      {/* Results */}
      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-12 text-center text-sm text-destructive">
          Yüklenemedi: {error}
        </div>
      ) : result === null ? (
        <ResultsSkeleton />
      ) : result.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Eşleşen portföy bulunamadı.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Filtreleri gevşetmeyi deneyin{activeCount > 0 ? " veya temizleyin" : ""}.
          </p>
          {activeCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setFilters((f) => ({ ...EMPTY_KESFET_FILTERS, currency: f.currency }))}
            >
              Filtreleri temizle
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            className={
              featureFlags.harita
                ? "grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
                : undefined
            }
          >
            <div className="flex flex-col gap-4">
              {result.items.map((p) => (
                <div
                  key={p.id}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <SearchResultCard
                    p={p}
                    selected={p.id === selectedId}
                    saved={savedState.isSaved(p.id)}
                    isOwn={p.owner_id === user?.id}
                    onToggleSave={savedState.enabled ? savedState.toggle : undefined}
                  />
                </div>
              ))}
            </div>
            {featureFlags.harita &&
              (() => {
                // APPROX pins only (D30) — exact_lat/exact_lng never reach the map.
                const withGeo = result.items.filter(
                  (p) => p.approx_lat != null && p.approx_lng != null,
                );
                const pts: MapPoint[] = withGeo.map((p) => ({
                  id: p.id,
                  slug: p.slug,
                  lat: p.approx_lat as number,
                  lng: p.approx_lng as number,
                  title: p.title,
                  price: abbreviatePrice(p.price, p.currency),
                }));
                const selected = withGeo.find((p) => p.id === selectedId) ?? null;
                return pts.length === 0 ? null : (
                  <aside className="hidden lg:block">
                    <div className="sticky top-20 h-[calc(100vh-7rem)]">
                      <div className="relative size-full">
                        <PortfolioMap
                          className="size-full overflow-hidden rounded-2xl border border-border"
                          points={pts}
                          selectedId={selectedId}
                          hoveredId={hoveredId}
                          onSelect={(pt) => setSelectedId(pt.id)}
                          onHover={(pt) => setHoveredId(pt?.id ?? null)}
                        />
                        {selected && (
                          <MapPreviewCard
                            p={selected}
                            isOwn={selected.owner_id === user?.id}
                            onClose={() => setSelectedId(null)}
                            onOpen={() =>
                              navigate({
                                to: "/dashboard/portfolios/$id",
                                params: { id: selected.id },
                              })
                            }
                          />
                        )}
                      </div>
                    </div>
                  </aside>
                );
              })()}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((x) => Math.max(0, x - 1))}
                className="gap-1"
              >
                <ChevronLeft className="size-4" /> Önceki
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((x) => x + 1)}
                className="gap-1"
              >
                Sonraki <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
          aria-hidden
        >
          <div className="size-28 shrink-0 animate-pulse rounded-xl bg-surface-2" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
            <div className="mt-auto h-5 w-24 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MapPreviewCard({
  p,
  isOwn,
  onClose,
  onOpen,
}: {
  p: PortfolioWithCover;
  isOwn?: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const region = [p.neighborhood, p.district, p.city].filter(Boolean).join(", ") || "—";
  return (
    <div className="absolute inset-x-3 bottom-3 z-10">
      <div className="flex gap-3 rounded-xl border border-border bg-surface p-3 shadow-elegant">
        <button
          type="button"
          onClick={onOpen}
          className="size-20 shrink-0 overflow-hidden rounded-lg bg-surface-3"
          aria-label={p.title}
        >
          {p.cover_url ? (
            <ThumbImage
              thumb={p.cover_url}
              full={p.cover_url_full}
              alt={p.title}
              className="size-full object-cover"
            />
          ) : (
            <CoverPlaceholder category={p.category} size="sm" />
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-sm font-semibold text-foreground">{p.title}</p>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1 -mt-1 shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Kapat"
            >
              <X className="size-4" />
            </button>
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">~{region}</p>
          <p className="mt-0.5 font-display text-base font-bold text-gold">
            {formatPortfolioPrice(p.price, p.currency)}
          </p>
          <Button
            size="sm"
            onClick={onOpen}
            className="mt-1.5 h-7 gap-1 self-start bg-gradient-gold px-2.5 text-[11px] text-primary-foreground hover:opacity-90"
          >
            {isOwn ? (
              <>
                <Eye className="size-3" /> Önizle
              </>
            ) : (
              <>
                <Send className="size-3" /> Detay Talep Et
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuickChip({
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
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-gold/40 bg-gold/10 text-gold"
          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
