import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  listNetworkPortfolios,
  type NetworkFilters,
  type PortfolioWithCover,
} from "@/lib/data/portfolios";
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
import { useSavedPortfolios } from "@/lib/use-saved-portfolios";
import { featureFlags } from "@/lib/feature-flags";
import { RegionSelect, type RegionValue } from "@/components/geo/region-select";

// Lovable labels → DB feature values (seed uses the right-hand names).
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
// Options come straight from the DB enums (no wrong/missing values).
const CATEGORIES = Constants.public.Enums.portfolio_category;
const TRANSACTIONS = Constants.public.Enums.transaction_type;
const ROOM_OPTIONS = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1"];

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
  // Typed fields debounce; selects apply immediately.
  const [q, setQ] = useState(initialQ ?? "");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [transaction, setTransaction] = useState<string>(ALL);
  const [rooms, setRooms] = useState<string>(ALL);
  const [region, setRegion] = useState<RegionValue>({
    city: null,
    district: null,
    neighborhood: null,
  });
  const [quickMode, setQuickMode] = useState<"controlled" | "call_only" | null>(null);
  const [feature, setFeature] = useState<string | null>(null);
  const [rooms5plus, setRooms5plus] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{ items: PortfolioWithCover[]; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const dq = useDebounced(q, 300);
  const dMin = useDebounced(priceMin, 400);
  const dMax = useDebounced(priceMax, 400);

  const filters = useMemo<NetworkFilters>(
    () => ({
      q: dq.trim() || undefined,
      city: region.city ?? undefined,
      district: region.district ?? undefined,
      neighborhood: region.neighborhood ?? undefined,
      mode: quickMode ?? undefined,
      feature: feature ?? undefined,
      roomCounts: rooms5plus ? ["5+1", "6+1"] : undefined,
      category: (category === ALL ? undefined : category) as NetworkFilters["category"],
      transaction_type: (transaction === ALL
        ? undefined
        : transaction) as NetworkFilters["transaction_type"],
      room_count: rooms === ALL ? undefined : rooms,
      priceMin: dMin ? Number(dMin) : undefined,
      priceMax: dMax ? Number(dMax) : undefined,
    }),
    [dq, region, category, transaction, rooms, quickMode, feature, rooms5plus, dMin, dMax],
  );

  // Filters changed → back to page 0 (instant filter; no "Filtrele" button).
  useEffect(() => setPage(0), [filters]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    // Keep the previous results on screen during a refetch (thin loading bar
    // instead of a full spinner / blank flash on every filter keystroke).
    setFetching(true);
    setError(null);
    listNetworkPortfolios(user.id, filters, page, PAGE_SIZE)
      .then((r) => active && setResult(r))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => active && setFetching(false));
    return () => {
      active = false;
    };
  }, [user, filters, page]);

  const reset = () => {
    setQ("");
    setPriceMin("");
    setPriceMax("");
    setCategory(ALL);
    setTransaction(ALL);
    setRooms(ALL);
  };

  // Active-filter chips (each clears its own field).
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (q.trim()) chips.push({ key: "q", label: `“${q.trim()}”`, clear: () => setQ("") });
  if (category !== ALL)
    chips.push({
      key: "cat",
      label: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
      clear: () => setCategory(ALL),
    });
  if (transaction !== ALL)
    chips.push({
      key: "txn",
      label: TRANSACTION_LABELS[transaction as keyof typeof TRANSACTION_LABELS],
      clear: () => setTransaction(ALL),
    });
  if (rooms !== ALL)
    chips.push({ key: "rooms", label: `${rooms} oda`, clear: () => setRooms(ALL) });
  if (priceMin) chips.push({ key: "pmin", label: `≥ ${priceMin}`, clear: () => setPriceMin("") });
  if (priceMax) chips.push({ key: "pmax", label: `≤ ${priceMax}`, clear: () => setPriceMax("") });

  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Keşfet"
        subtitle="Ağdaki doğrulanmış emlakçıların yayındaki portföyleri (teaser)."
      />

      {/* Primary filter bar — one clean row */}
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Başlık, şehir, ilçe veya mahalle ara…"
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
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
          <Select value={transaction} onValueChange={setTransaction}>
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
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => setShowMore((s) => !s)}
            aria-expanded={showMore}
          >
            <SlidersHorizontal className="size-4" /> Daha fazla
          </Button>
        </div>

        {/* Region filter (canonical İl/İlçe/Mahalle → exact match) */}
        <div className="border-t border-border pt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bölge
            </span>
            {(region.city || region.district || region.neighborhood) && (
              <button
                type="button"
                onClick={() => setRegion({ city: null, district: null, neighborhood: null })}
                className="text-xs text-gold hover:underline"
              >
                Bölgeyi temizle
              </button>
            )}
          </div>
          <RegionSelect value={region} onChange={setRegion} />
        </div>

        {/* Lovable quick-chip row — instant, horizontal-scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-border pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_FEATURES.map((f) => (
            <QuickChip
              key={f.value}
              active={feature === f.value}
              onClick={() => setFeature(feature === f.value ? null : f.value)}
            >
              {f.label}
            </QuickChip>
          ))}
          <QuickChip active={rooms5plus} onClick={() => setRooms5plus((v) => !v)}>
            5+ Oda
          </QuickChip>
          <span className="mx-1 h-4 w-px shrink-0 bg-border" />
          <QuickChip
            active={quickMode === "controlled"}
            onClick={() => setQuickMode(quickMode === "controlled" ? null : "controlled")}
          >
            Detay Talebi Açık
          </QuickChip>
          <QuickChip
            active={quickMode === "call_only"}
            onClick={() => setQuickMode(quickMode === "call_only" ? null : "call_only")}
          >
            Kapalı Portföy
          </QuickChip>
        </div>

        {/* Secondary filters (collapsed by default → uncluttered) */}
        {showMore && (
          <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-3">
            <Field label="Oda sayısı">
              <Select value={rooms} onValueChange={setRooms}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tümü</SelectItem>
                  {ROOM_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Min. fiyat">
              <Input
                type="number"
                inputMode="numeric"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Maks. fiyat">
              <Input
                type="number"
                inputMode="numeric"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="∞"
              />
            </Field>
          </div>
        )}

        {/* Active chips + count + clear */}
        {(chips.length > 0 || result !== null) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {result !== null && (
              <span className="text-sm font-medium text-foreground">{total} portföy</span>
            )}
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={c.clear}
                className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold hover:bg-gold/20"
              >
                {c.label}
                <X className="size-3" />
              </button>
            ))}
            {chips.length > 0 && (
              <button
                onClick={reset}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
        )}
      </div>

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
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : result.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center text-sm text-muted-foreground">
          Filtrelerinize uygun yayında portföy bulunamadı.
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

function MapPreviewCard({
  p,
  onClose,
  onOpen,
}: {
  p: PortfolioWithCover;
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
            <Send className="size-3" /> Detay Talep Et
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
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
