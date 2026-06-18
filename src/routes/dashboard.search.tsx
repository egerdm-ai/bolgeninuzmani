import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ImageOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
const emptyDraft = {
  q: "",
  city: "",
  district: "",
  neighborhood: "",
  transaction_type: "",
  category: "",
  priceMin: "",
  priceMax: "",
  room_count: "",
};

function Kesfet() {
  const { user } = useAuth();
  const [draft, setDraft] = useState(emptyDraft);
  const [filters, setFilters] = useState<NetworkFilters>({});
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{ items: PortfolioWithCover[]; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const apply = () => {
    setFilters({
      q: draft.q.trim() || undefined,
      city: draft.city.trim() || undefined,
      district: draft.district.trim() || undefined,
      neighborhood: draft.neighborhood.trim() || undefined,
      transaction_type: (draft.transaction_type || undefined) as NetworkFilters["transaction_type"],
      category: (draft.category || undefined) as NetworkFilters["category"],
      priceMin: draft.priceMin ? Number(draft.priceMin) : undefined,
      priceMax: draft.priceMax ? Number(draft.priceMax) : undefined,
      room_count: draft.room_count.trim() || undefined,
    });
    setPage(0);
  };

  const reset = () => {
    setDraft(emptyDraft);
    setFilters({});
    setPage(0);
  };

  const sd = (k: keyof typeof draft) => (v: string) => setDraft((p) => ({ ...p, [k]: v }));
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Keşfet"
        subtitle="Ağdaki doğrulanmış emlakçıların yayındaki portföylerini keşfedin (teaser)."
      />

      {/* Search + filters */}
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draft.q}
              onChange={(e) => sd("q")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              placeholder="Başlık, şehir, ilçe, mahalle ara…"
              className="pl-9"
            />
          </div>
          <Button
            onClick={apply}
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <SlidersHorizontal className="size-4" /> Filtrele
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField label="Kategori">
            <Select value={draft.category} onValueChange={sd("category")}>
              <SelectTrigger>
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="İşlem">
            <Select value={draft.transaction_type} onValueChange={sd("transaction_type")}>
              <SelectTrigger>
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRANSACTION_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Şehir">
            <Input value={draft.city} onChange={(e) => sd("city")(e.target.value)} />
          </FilterField>
          <FilterField label="İlçe">
            <Input value={draft.district} onChange={(e) => sd("district")(e.target.value)} />
          </FilterField>
          <FilterField label="Mahalle">
            <Input
              value={draft.neighborhood}
              onChange={(e) => sd("neighborhood")(e.target.value)}
            />
          </FilterField>
          <FilterField label="Oda">
            <Input
              value={draft.room_count}
              onChange={(e) => sd("room_count")(e.target.value)}
              placeholder="5+1"
            />
          </FilterField>
          <FilterField label="Min Fiyat">
            <Input
              type="number"
              value={draft.priceMin}
              onChange={(e) => sd("priceMin")(e.target.value)}
            />
          </FilterField>
          <FilterField label="Maks Fiyat">
            <Input
              type="number"
              value={draft.priceMax}
              onChange={(e) => sd("priceMax")(e.target.value)}
            />
          </FilterField>
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
            Filtreleri temizle
          </Button>
        </div>
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
          <p className="text-xs text-muted-foreground">{total} portföy bulundu</p>
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

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
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
