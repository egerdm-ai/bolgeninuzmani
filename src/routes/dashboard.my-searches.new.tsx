import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { featureFlags } from "@/lib/feature-flags";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Search, Lock, Globe, Wand2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfoPanel, SurfaceCard } from "@/components/vault/cards";
import { MatchExplanationCard } from "@/components/vault/match-explanation-card";
import { RegionExpertCard } from "@/components/vault/region-expert-card";
import { FilterSection, FilterFieldGrid } from "@/components/vault/filter-section";
import { FilterModal } from "@/components/vault/filter-modal";
import { getMatchesForSearch, getExpertsForSearch } from "@/lib/mock/matching";
import { useSaved } from "@/lib/saved-store";
import { useDetailRequest } from "@/lib/detail-request-store";
import { useMySearches } from "@/lib/my-searches-store";
import { cn } from "@/lib/utils";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import type {
  MatchResult,
  NotificationFrequency,
  PortfolioType,
  Professional,
} from "@/lib/mock/types";
import {
  categories,
  categoryByKey,
  currencies,
  roomCounts,
  luxuryFeatures,
  residentialFields,
  landFields,
  commercialFields,
  parsePromptToFilters,
  type CategoryKey,
  type FilterState,
  type FilterValue,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/dashboard/my-searches/new")({
  beforeLoad: () => {
    if (!featureFlags.arayis) throw redirect({ to: "/dashboard" });
  },
  component: NewSearch,
});

const freqOptions: NotificationFrequency[] = ["instant", "daily", "weekly", "off"];

function toPortfolioType(cat: CategoryKey, sub?: string): PortfolioType {
  if (cat === "arsa") return "land";
  if (cat === "turizm") return "hotel";
  if (cat === "ticari") return sub === "ofis" ? "office" : "commercial";
  if (cat === "endustriyel") return "factory";
  if (sub === "daire" || sub === "rezidans") return "apartment";
  return "villa";
}

function NewSearch() {
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useSaved();
  const { open: openRequest } = useDetailRequest();
  const { create } = useMySearches();

  const [prompt, setPrompt] = useState(
    "Bodrum'da deniz manzaralı, 5+1, havuzlu, 100M TL altı villa arıyorum. Yalıkavak ve Türkbükü öncelikli.",
  );
  const [aiSummary, setAiSummary] = useState<string[]>([]);
  const [name, setName] = useState("Bodrum Deniz Manzaralı Villa");
  const [clientNote, setClientNote] = useState("A. Yılmaz (VIP)");
  const [filters, setFilters] = useState<FilterState>({
    category: "konut",
    subcategory: "villa",
    city: "Muğla",
    region: "Bodrum",
    currency: "TRY",
    rooms: "5+1",
  });
  const [mustHave, setMustHave] = useState<string[]>(["deniz_manzara", "havuz"]);
  const [niceToHave, setNiceToHave] = useState<string[]>(["akilli_ev"]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [notify, setNotify] = useState<NotificationFrequency>("instant");
  const [visibility, setVisibility] = useState<"private" | "network">("private");
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [experts, setExperts] = useState<Professional[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const category = (filters.category as CategoryKey) ?? "konut";
  const setFilter = (key: string, value: FilterValue) =>
    setFilters((p) => ({ ...p, [key]: value }));

  const labelFor = (v: string) => luxuryFeatures.find((f) => f.value === v)?.label ?? v;

  const runAi = () => {
    const parsed = parsePromptToFilters(prompt);
    setFilters((prev) => ({ ...prev, ...parsed.filters }));
    if (Array.isArray(parsed.filters.luxuryFeatures)) setMustHave(parsed.filters.luxuryFeatures);
    setAiSummary(parsed.summary);
    toast.success("AI filtreleri oluşturdu", { description: parsed.summary.join(" · ") });
  };

  const buildQuery = () => ({
    region: (filters.region as string) ?? "",
    city: (filters.city as string) ?? "",
    type: toPortfolioType(category, filters.subcategory as string),
    budgetMin: Number(filters.priceMin ?? 0),
    budgetMax: Number(filters.priceMax ?? 0) || Number.MAX_SAFE_INTEGER,
    rooms: (filters.rooms as string) ?? "",
    mustHave: mustHave.map(labelFor),
  });

  // Live preview match count as the user edits the form.
  const previewMatches = useMemo(
    () => getMatchesForSearch(buildQuery()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, mustHave],
  );

  const findMatches = () => {
    const q = buildQuery();
    const results = getMatchesForSearch(q);
    setMatches(results);
    setExperts(getExpertsForSearch(q));
    const id = create({
      title: name || "Yeni Arayış",
      clientLabel: clientNote || undefined,
      notes: clientNote || prompt,
      region: q.region,
      city: q.city,
      type: q.type,
      budgetMin: filters.priceMin ? Number(filters.priceMin) : undefined,
      budgetMax: filters.priceMax ? Number(filters.priceMax) : undefined,
      currency: (filters.currency as "TRY" | "USD" | "EUR") ?? "TRY",
      rooms: (filters.rooms as string) || undefined,
      mustHave: mustHave.map(labelFor),
      niceToHave: niceToHave.map(labelFor),
      notify,
      visibility,
      matchCount: results.length,
      status: results.length > 0 ? "matched" : "active",
    });
    toast.success("Arayış kaydedildi", {
      description: `${results.length} uygun portföy bulundu. Bildirim: ${notificationFrequencyLabels[notify]}.`,
    });
    navigate({ to: "/dashboard/my-searches/$id", params: { id } });
  };

  const detailFields = useMemo(() => {
    if (category === "konut") return residentialFields.filter((f) => f.important);
    if (category === "arsa") return landFields.filter((f) => f.important);
    if (category === "ticari" || category === "endustriyel")
      return commercialFields.filter((f) => f.important);
    return [];
  }, [category]);

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Yeni Arayış Oluştur"
        subtitle="Müşterinizin ihtiyacını tarif edin; Bölgenin Uzmanı uygun portföyleri ve bölge uzmanlarını eşleştirsin."
        breadcrumbs={[
          { label: "Arayışlarım", to: "/dashboard/my-searches" },
          { label: "Yeni Arayış" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Form */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          {/* Natural language box */}
          <SurfaceCard className="border-gold/30 bg-gold/[0.04]">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-gold" />
                <p className="text-sm font-semibold text-foreground">Müşteriniz ne arıyor?</p>
              </div>
              <Textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="örn. Bebek'te havuzlu, müstakil, 5+1 villa arıyorum. 8M USD üstüne çıkamam."
              />
              <Button
                onClick={runAi}
                className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <Wand2 className="size-4" /> AI ile Filtrelere Çevir
              </Button>
              {aiSummary.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {aiSummary.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-gold ring-1 ring-inset ring-gold/25"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </SurfaceCard>

          <InfoPanel title="Arayış Bilgileri">
            <div className="space-y-3">
              <Field label="Arayış adı">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="örn. Bodrum Deniz Manzaralı Villa"
                />
              </Field>
              <Field label="Müşteri notu">
                <Input
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  placeholder="Müşteri etiketi / takma ad"
                />
              </Field>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Detaylı Filtreler
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setFilterOpen(true)}
                >
                  <Sparkles className="size-3.5 text-gold" /> Tüm Filtreler
                </Button>
              </div>

              <FilterSection label="Lokasyon" defaultOpen>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Şehir</Label>
                    <Input
                      className="h-9"
                      value={(filters.city as string) ?? ""}
                      onChange={(e) => setFilter("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Bölge</Label>
                    <Input
                      className="h-9"
                      value={(filters.region as string) ?? ""}
                      onChange={(e) => setFilter("region", e.target.value)}
                    />
                  </div>
                </div>
              </FilterSection>

              <FilterSection label="Portföy Tipi" defaultOpen>
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          setFilter("category", c.value);
                          setFilter("subcategory", undefined);
                        }}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                          category === c.value
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : "border-border bg-surface-3 text-secondary-foreground hover:text-foreground",
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categoryByKey[category]?.subcategories.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setFilter("subcategory", s.value)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                          filters.subcategory === s.value
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : "border-border bg-surface-3 text-secondary-foreground hover:text-foreground",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </FilterSection>

              <FilterSection label="Fiyat & Alan" defaultOpen>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Bütçe min (₺)</Label>
                    <Input
                      className="h-9"
                      type="number"
                      value={(filters.priceMin as number) ?? ""}
                      onChange={(e) =>
                        setFilter(
                          "priceMin",
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Bütçe max (₺)</Label>
                    <Input
                      className="h-9"
                      type="number"
                      value={(filters.priceMax as number) ?? ""}
                      onChange={(e) =>
                        setFilter(
                          "priceMax",
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Para Birimi</Label>
                    <select
                      className="h-9 w-full rounded-md border border-border bg-surface-2 px-2 text-sm text-foreground"
                      value={(filters.currency as string) ?? "TRY"}
                      onChange={(e) => setFilter("currency", e.target.value)}
                    >
                      {currencies.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Oda</Label>
                    <select
                      className="h-9 w-full rounded-md border border-border bg-surface-2 px-2 text-sm text-foreground"
                      value={(filters.rooms as string) ?? ""}
                      onChange={(e) => setFilter("rooms", e.target.value)}
                    >
                      <option value="">Farketmez</option>
                      {roomCounts.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Min m²</Label>
                    <Input
                      className="h-9"
                      type="number"
                      value={(filters.grossM2 as number) ?? ""}
                      onChange={(e) =>
                        setFilter(
                          "grossM2",
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                </div>
              </FilterSection>

              {detailFields.length > 0 && (
                <FilterSection label={`${categoryByKey[category]?.label} Kriterleri`}>
                  <FilterFieldGrid fields={detailFields} state={filters} onChange={setFilter} />
                </FilterSection>
              )}

              <FilterSection label="Özellikler" defaultOpen>
                <FeatureGroup
                  title="Olmazsa olmaz"
                  tone="must"
                  selected={mustHave}
                  onToggle={(v) =>
                    setMustHave((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))
                  }
                />
                <FeatureGroup
                  title="Olursa iyi olur"
                  tone="nice"
                  selected={niceToHave}
                  onToggle={(v) =>
                    setNiceToHave((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))
                  }
                />
                <FeatureGroup
                  title="İstenmeyen"
                  tone="excluded"
                  selected={excluded}
                  onToggle={(v) =>
                    setExcluded((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))
                  }
                />
              </FilterSection>

              <Field label="Bildirim sıklığı">
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
              </Field>
              <Field label="Görünürlük">
                <div className="grid grid-cols-2 gap-2">
                  <VisBtn
                    active={visibility === "private"}
                    onClick={() => setVisibility("private")}
                    icon={Lock}
                    label="Sadece Ben"
                  />
                  <VisBtn
                    active={visibility === "network"}
                    onClick={() => setVisibility("network")}
                    icon={Globe}
                    label="Network'e Kısıtlı Açık"
                  />
                </div>
              </Field>
              <Button
                onClick={findMatches}
                className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="size-4" /> Eşleşmeleri Bul ve Kaydet
              </Button>
            </div>
          </InfoPanel>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {matches === null ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/50 p-8 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <Search className="size-7" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                Şu an {previewMatches.length} portföy eşleşiyor
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Doğal dil ile yazın, AI ile filtrelere çevirin veya kriterleri elle doldurun.
                Ardından “Eşleşmeleri Bul ve Kaydet” butonuna basın; arayış Arayışlarım'a
                kaydedilir.
              </p>
            </div>
          ) : (
            <>
              <SurfaceCard className="border-gold/30 bg-gold/[0.05]">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-5 shrink-0 text-gold" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Asistan Özeti</p>
                    <p className="mt-1 text-sm text-secondary-foreground">
                      Bu arayış için{" "}
                      <span className="font-semibold text-gold">
                        {matches.length} uygun portföy
                      </span>{" "}
                      ve{" "}
                      <span className="font-semibold text-gold">{experts.length} bölge uzmanı</span>{" "}
                      bulundu. Yeni eşleşmelerde{" "}
                      <span className="font-semibold text-gold">
                        {notificationFrequencyLabels[notify].toLocaleLowerCase("tr-TR")}
                      </span>{" "}
                      bildirim alacaksınız.
                    </p>
                  </div>
                </div>
              </SurfaceCard>

              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
                  Eşleşen Portföyler
                </h2>
                <div className="space-y-4">
                  {matches.map((m) => (
                    <MatchExplanationCard
                      key={m.portfolio.id}
                      match={m}
                      saved={isSaved(m.portfolio.id)}
                      onSave={toggleSave}
                      onRequestDetail={openRequest}
                    />
                  ))}
                </div>
              </div>

              {experts.length > 0 && (
                <div>
                  <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
                    Önerilen Bölge Uzmanları
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {experts.map((e) => (
                      <RegionExpertCard
                        key={e.id}
                        professional={e}
                        regionName={(filters.region as string) ?? ""}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => navigate({ to: "/dashboard/my-searches" })}
                variant="outline"
                className="w-full"
              >
                Arayışlarım'a dön
              </Button>
            </>
          )}
        </div>
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        setFilter={setFilter}
        resultCount={matches?.length ?? 0}
        onClear={() => setFilters({ category: "konut", subcategory: "villa", currency: "TRY" })}
      />
    </PageContainer>
  );
}

function FeatureGroup({
  title,
  tone,
  selected,
  onToggle,
}: {
  title: string;
  tone: "must" | "nice" | "excluded";
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const toneStyle = {
    must: "border-gold/40 bg-gold/10 text-gold",
    nice: "border-success/40 bg-success/10 text-success",
    excluded: "border-destructive/40 bg-destructive/10 text-destructive",
  }[tone];
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{title}</Label>
      <div className="flex flex-wrap gap-1.5">
        {luxuryFeatures.map((f) => (
          <button
            key={f.value}
            onClick={() => onToggle(f.value)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
              selected.includes(f.value)
                ? toneStyle
                : "border-border bg-surface-3 text-secondary-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
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

function VisBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Lock;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
        active
          ? "border-gold/40 bg-gold/10 text-gold"
          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );
}
