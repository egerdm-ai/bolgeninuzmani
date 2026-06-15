import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, SlidersHorizontal, Map, List, BookmarkPlus, Sparkles, X, Check, RotateCcw } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapCanvasMock } from "@/components/vault/map-canvas-mock";
import { PortfolioPreviewCard } from "@/components/vault/portfolio-preview-card";
import { PortfolioCard } from "@/components/vault/portfolio-card";
import { DetailRequestModal } from "@/components/vault/detail-request-modal";
import { FilterSection, FilterField, FilterFieldGrid } from "@/components/vault/filter-section";
import { portfolios } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { useSaved } from "@/lib/saved-store";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import type { NotificationFrequency, Portfolio } from "@/lib/mock/types";
import {
  categories,
  categoryByKey,
  transactionTypes,
  currencies,
  roomCounts,
  dateAddedOptions,
  quickFilterChips,
  luxuryFeatures,
  residentialFields,
  landFields,
  commercialFields,
  privacyAccessFields,
  professionalFields,
  defaultFilterState,
  countActiveFilters,
  type CategoryKey,
  type FilterState,
  type FilterValue,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/dashboard/search")({
  component: SearchPage,
});

function SearchPage() {
  const { isSaved, toggleSave } = useSaved();
  const searchable = useMemo(() => portfolios.filter((p) => p.status === "active"), []);

  const [filters, setFilters] = useState<FilterState>({ ...defaultFilterState });
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedId, setSelectedId] = useState<string>(searchable[0]?.id ?? "");
  const [requestTarget, setRequestTarget] = useState<Portfolio | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchName, setSearchName] = useState("Yeni Arayış");
  const [notify, setNotify] = useState<NotificationFrequency>("instant");

  const category = (filters.category as CategoryKey) ?? "konut";

  const setFilter = (key: string, value: FilterValue) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () => {
    setFilters({ ...defaultFilterState });
    setActiveChips([]);
  };

  const toggleChip = (c: string) =>
    setActiveChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  // ---- Mock filtering ----
  const filtered = useMemo(() => {
    return searchable.filter((p) => {
      if (filters.category && p.category !== filters.category) return false;
      if (filters.region && !`${p.regionLabel} ${p.district} ${p.neighborhood ?? ""}`.toLocaleLowerCase("tr-TR").includes((filters.region as string).toLocaleLowerCase("tr-TR"))) return false;
      if (filters.city && !p.city.toLocaleLowerCase("tr-TR").includes((filters.city as string).toLocaleLowerCase("tr-TR"))) return false;
      if (filters.priceMin && p.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && p.price > Number(filters.priceMax)) return false;
      if (filters.grossM2 && (p.grossM2 ?? 0) < Number(filters.grossM2)) return false;
      if (filters.landM2 && (p.landM2 ?? 0) < Number(filters.landM2)) return false;
      if (filters.rooms && p.rooms !== filters.rooms) return false;
      if (filters.requestRequired && !p.requestRequired) return false;
      if (filters.savedOnly && !isSaved(p.id)) return false;
      const lux = Array.isArray(filters.luxuryFeatures) ? filters.luxuryFeatures : [];
      if (lux.length) {
        const labels = lux.map((v) => luxuryFeatures.find((f) => f.value === v)?.label ?? "");
        if (!labels.every((l) => p.features.includes(l))) return false;
      }
      if (activeChips.length) {
        const hay = `${p.features.join(" ")} ${p.tags.join(" ")} ${p.rooms ?? ""}`.toLocaleLowerCase("tr-TR");
        if (!activeChips.every((c) => hay.includes(c.toLocaleLowerCase("tr-TR")))) return false;
      }
      return true;
    });
  }, [searchable, filters, activeChips, isSaved]);

  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? searchable[0];
  const activeCount = countActiveFilters(filters) + activeChips.length;

  const confirmSave = () => {
    setSaved(true);
    setSaveOpen(false);
    toast.success("Arayış olarak kaydedildi", {
      description: `${searchName} · ${filtered.length} sonuç · Bildirim: ${notificationFrequencyLabels[notify]}`,
    });
  };

  const freqOptions: NotificationFrequency[] = ["instant", "daily", "weekly", "off"];

  const filterPanel = (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-4 text-gold" /> Filtreler
          {activeCount > 0 && <span className="rounded-full bg-gold/15 px-1.5 text-[10px] font-bold text-gold">{activeCount}</span>}
        </span>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" onClick={resetFilters}>
          <RotateCcw className="size-3" /> Sıfırla
        </Button>
      </div>

      <FilterSection label="Hızlı Filtreler" defaultOpen count={activeChips.length}>
        <div className="flex flex-wrap gap-1.5">
          {quickFilterChips.map((c) => (
            <button
              key={c}
              onClick={() => toggleChip(c)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                activeChips.includes(c)
                  ? "bg-gold/15 text-gold ring-gold/30"
                  : "bg-surface-3 text-secondary-foreground ring-border hover:ring-border-strong",
              )}
            >
              {c}
              {activeChips.includes(c) && <X className="size-3" />}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Lokasyon" defaultOpen>
        <div className="space-y-2.5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Şehir</Label>
            <Input className="h-9" placeholder="örn. Muğla" value={(filters.city as string) ?? ""} onChange={(e) => setFilter("city", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">İlçe / Bölge</Label>
              <Input className="h-9" placeholder="örn. Bodrum" value={(filters.region as string) ?? ""} onChange={(e) => setFilter("region", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mahalle</Label>
              <Input className="h-9" placeholder="örn. Yalıkavak" value={(filters.neighborhood as string) ?? ""} onChange={(e) => setFilter("neighborhood", e.target.value)} />
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection label="Portföy Tipi" defaultOpen>
        <div className="space-y-2.5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Kategori</Label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setFilter("category", c.value); setFilter("subcategory", undefined); }}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                    category === c.value ? "border-gold/40 bg-gold/10 text-gold" : "border-border bg-surface-3 text-secondary-foreground hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Alt Kategori</Label>
              <Select value={(filters.subcategory as string) ?? ""} onValueChange={(v) => setFilter("subcategory", v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>
                  {categoryByKey[category]?.subcategories.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">İşlem Tipi</Label>
              <Select value={(filters.transaction as string) ?? ""} onValueChange={(v) => setFilter("transaction", v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </FilterSection>

      <FilterSection label="Fiyat">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Min (₺)</Label>
            <Input className="h-9" type="number" inputMode="numeric" value={(filters.priceMin as number) ?? ""} onChange={(e) => setFilter("priceMin", e.target.value === "" ? undefined : Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max (₺)</Label>
            <Input className="h-9" type="number" inputMode="numeric" value={(filters.priceMax as number) ?? ""} onChange={(e) => setFilter("priceMax", e.target.value === "" ? undefined : Number(e.target.value))} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Para Birimi</Label>
            <Select value={(filters.currency as string) ?? "TRY"} onValueChange={(v) => setFilter("currency", v)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{currencies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </FilterSection>

      <FilterSection label="Alan / m²">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Brüt m² (min)</Label>
            <Input className="h-9" type="number" value={(filters.grossM2 as number) ?? ""} onChange={(e) => setFilter("grossM2", e.target.value === "" ? undefined : Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Net m² (min)</Label>
            <Input className="h-9" type="number" value={(filters.netM2 as number) ?? ""} onChange={(e) => setFilter("netM2", e.target.value === "" ? undefined : Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Arsa m² (min)</Label>
            <Input className="h-9" type="number" value={(filters.landM2 as number) ?? ""} onChange={(e) => setFilter("landM2", e.target.value === "" ? undefined : Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Oda Sayısı</Label>
            <Select value={(filters.rooms as string) ?? ""} onValueChange={(v) => setFilter("rooms", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Seçin" /></SelectTrigger>
              <SelectContent>{roomCounts.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </FilterSection>

      {category === "konut" && (
        <FilterSection label="Konut Detayları">
          <FilterFieldGrid fields={residentialFields} state={filters} onChange={setFilter} />
        </FilterSection>
      )}
      {category === "arsa" && (
        <FilterSection label="Arsa Detayları">
          <FilterFieldGrid fields={landFields} state={filters} onChange={setFilter} />
        </FilterSection>
      )}
      {(category === "ticari" || category === "endustriyel") && (
        <FilterSection label="Ticari Detaylar">
          <FilterFieldGrid fields={commercialFields} state={filters} onChange={setFilter} />
        </FilterSection>
      )}
      {(category === "konut" || category === "turizm") && (
        <FilterSection label="Luxury Özellikler">
          <FilterField
            field={{ key: "luxuryFeatures", label: "Luxury Özellikler", type: "multiselect", options: luxuryFeatures }}
            value={filters.luxuryFeatures}
            onChange={setFilter}
          />
        </FilterSection>
      )}

      <FilterSection label="Gizlilik & Erişim">
        <FilterFieldGrid fields={privacyAccessFields} state={filters} onChange={setFilter} />
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs text-muted-foreground">Eklenme Tarihi</Label>
          <Select value={(filters.dateAdded as string) ?? "any"} onValueChange={(v) => setFilter("dateAdded", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{dateAddedOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </FilterSection>

      <FilterSection label="Profesyonel / Bölge Uzmanı">
        <FilterFieldGrid fields={professionalFields} state={filters} onChange={setFilter} />
      </FilterSection>
    </div>
  );

  return (
    <PageContainer className="space-y-4">
      {/* Search bar row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Lokasyon, portföy başlığı veya ID ara..."
            className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-1.5 border-gold/40 text-gold hover:bg-gold/10">
            <Link to="/dashboard/assistant"><Sparkles className="size-4" /> VAULT Asistan</Link>
          </Button>
          <Button
            variant="outline"
            className={cn("gap-1.5", saved && "border-gold/40 text-gold")}
            onClick={() => (saved ? toast.info("Bu arayış zaten kaydedildi") : setSaveOpen(true))}
          >
            {saved ? <Check className="size-4" /> : <BookmarkPlus className="size-4" />}
            {saved ? "Arayış Kaydedildi" : "Arayış Olarak Kaydet"}
          </Button>
          <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
            <button
              onClick={() => setView("map")}
              className={cn("flex items-center gap-1 rounded-md px-3 py-1.5 text-sm", view === "map" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground")}
            >
              <Map className="size-4" /> Harita
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("flex items-center gap-1 rounded-md px-3 py-1.5 text-sm", view === "list" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground")}
            >
              <List className="size-4" /> Liste
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{filtered.length}</span> portföy bulundu
        {activeCount > 0 && <span className="text-gold"> · {activeCount} aktif filtre</span>}
      </p>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Filter panel */}
        <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          {filterPanel}
        </aside>

        {/* Map / list + preview */}
        {view === "map" ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <div className="h-[600px]">
              {filtered.length > 0 ? (
                <MapCanvasMock portfolios={filtered} selectedId={selected?.id} onSelect={(p) => setSelectedId(p.id)} className="h-full" />
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-2 text-sm text-muted-foreground">
                  Bu filtrelerle eşleşen portföy yok.
                </div>
              )}
            </div>
            <div className="xl:sticky xl:top-20 xl:self-start">
              {selected && (
                <PortfolioPreviewCard
                  portfolio={selected}
                  saved={isSaved(selected.id)}
                  onToggleSave={toggleSave}
                  onRequestDetail={setRequestTarget}
                />
              )}
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <PortfolioCard key={p.id} portfolio={p} saved={isSaved(p.id)} onToggleSave={toggleSave} showOwner />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-2 text-sm text-muted-foreground">
            Bu filtrelerle eşleşen portföy yok.
          </div>
        )}
      </div>

      <DetailRequestModal portfolio={requestTarget} open={!!requestTarget} onOpenChange={(o) => !o && setRequestTarget(null)} />

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arayış Olarak Kaydet</DialogTitle>
            <DialogDescription>
              Bu aramayı kaydedin; yeni eşleşen portföyler eklendiğinde bildirim alın.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Arayış adı</Label>
              <Input value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
              {activeCount} aktif filtre · {filtered.length} mevcut sonuç kaydedilecek.
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bildirim sıklığı</Label>
              <div className="grid grid-cols-2 gap-2">
                {freqOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => setNotify(f)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                      notify === f
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {notificationFrequencyLabels[f]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>İptal</Button>
            <Button onClick={confirmSave} className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
              <BookmarkPlus className="size-4" /> Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
