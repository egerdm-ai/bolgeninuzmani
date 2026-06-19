import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ImageOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
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
import { CATEGORY_LABELS, TRANSACTION_LABELS, formatPortfolioPrice } from "@/lib/portfolio-labels";

export const Route = createFileRoute("/dashboard/search")({
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
  // Typed fields debounce; selects apply immediately.
  const [q, setQ] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [transaction, setTransaction] = useState<string>(ALL);
  const [rooms, setRooms] = useState<string>(ALL);
  const [showMore, setShowMore] = useState(false);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{ items: PortfolioWithCover[]; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dq = useDebounced(q, 300);
  const dMin = useDebounced(priceMin, 400);
  const dMax = useDebounced(priceMax, 400);

  const filters = useMemo<NetworkFilters>(
    () => ({
      q: dq.trim() || undefined,
      category: (category === ALL ? undefined : category) as NetworkFilters["category"],
      transaction_type: (transaction === ALL
        ? undefined
        : transaction) as NetworkFilters["transaction_type"],
      room_count: rooms === ALL ? undefined : rooms,
      priceMin: dMin ? Number(dMin) : undefined,
      priceMax: dMax ? Number(dMax) : undefined,
    }),
    [dq, category, transaction, rooms, dMin, dMax],
  );

  // Filters changed → back to page 0 (instant filter; no "Filtrele" button).
  useEffect(() => setPage(0), [filters]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setResult(null);
    setError(null);
    listNetworkPortfolios(user.id, filters, page, PAGE_SIZE)
      .then((r) => active && setResult(r))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)));
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((p) => (
              <TeaserCard key={p.id} p={p} />
            ))}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function TeaserCard({ p }: { p: PortfolioWithCover }) {
  return (
    <Link
      to="/dashboard/portfolios/$id"
      params={{ id: p.id }}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {p.cover_url ? (
          <img
            src={p.cover_url}
            alt={p.title}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-7" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{CATEGORY_LABELS[p.category]}</span>
          <span>·</span>
          <span>{TRANSACTION_LABELS[p.transaction_type]}</span>
        </div>
        <h3 className="mt-1 line-clamp-1 font-semibold text-foreground">{p.title}</h3>
        <p className="text-xs text-muted-foreground">
          {[p.neighborhood, p.district, p.city].filter(Boolean).join(", ") || "—"}
        </p>
        <p className="mt-2 font-display text-lg font-semibold text-gold">
          {formatPortfolioPrice(p.price, p.currency)}
        </p>
      </div>
    </Link>
  );
}
