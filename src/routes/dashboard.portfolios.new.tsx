import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  MapPin,
  ImagePlus,
  UploadCloud,
  ShieldCheck,
  Eye,
  Rocket,
  AlertCircle,
  Layers,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AIButton } from "@/components/vault/ai-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurfaceCard } from "@/components/vault/cards";
import { ApproxLocationMap } from "@/components/vault/approx-location-map";
import { DataScoreRing } from "@/components/vault/data-score";
import { FilterFieldGrid } from "@/components/vault/filter-section";
import { formatPrice } from "@/lib/format";
import { propertyImages } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import {
  categories,
  categoryByKey,
  transactionTypes,
  currencies,
  getDetailGroupsForCategory,
  computeCompleteness,
  type CategoryKey,
  type FilterValue,
} from "@/lib/taxonomy";

export const Route = createFileRoute("/dashboard/portfolios/new")({
  component: NewPortfolioWizard,
});

const steps = [
  { label: "Temel Bilgiler", icon: ShieldCheck },
  { label: "Konum & Fiyat", icon: MapPin },
  { label: "Detaylar", icon: Layers },
  { label: "Medya", icon: ImagePlus },
  { label: "Gizlilik & Paylaşım", icon: ShieldCheck },
  { label: "Önizleme", icon: Eye },
];

const galleryImages = [
  propertyImages.villa1,
  propertyImages.interior1,
  propertyImages.villa2,
  propertyImages.apartment1,
];

type Values = Record<string, FilterValue>;

function NewPortfolioWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>({
    title: "Yalıkavak'ta Deniz Manzaralı Özel Tasarım Villa",
    shortDescription: "Sonsuzluk havuzu ve panoramik Ege manzarası ile özel tasarım lüks villa.",
    category: "konut",
    subcategory: "villa",
    transaction: "satilik",
    city: "Muğla",
    district: "Bodrum",
    neighborhood: "Yalıkavak",
    price: 64500000,
    currency: "TRY",
    priceVisibility: "visible",
    locationMode: "approximate",
    luxuryFeatures: ["deniz_manzara", "havuz"],
  });

  const category = (values.category as CategoryKey) ?? "konut";
  const detailGroups = useMemo(() => getDetailGroupsForCategory(category), [category]);
  const completeness = useMemo(() => computeCompleteness(values, category), [values, category]);
  const dataLevel = completeness.level;

  const set = (key: string, value: FilterValue) => setValues((p) => ({ ...p, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const region = `${values.neighborhood ?? values.district} / ${values.district}`;

  const publish = () => {
    toast.success("Portföy yayınlandı", { description: "Share Studio'ya yönlendiriliyorsunuz." });
    navigate({ to: "/dashboard/portfolios/$id/share", params: { id: "p_001" } });
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Yeni Portföy Ekle"
        breadcrumbs={[
          { label: "Portföylerim", to: "/dashboard/portfolios" },
          { label: "Yeni Portföy Ekle" },
        ]}
        actions={
          <>
            <AIButton />
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => toast.success("Taslak kaydedildi")}
            >
              <Save className="size-4" /> Taslak Kaydet
            </Button>
          </>
        }
      />

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-surface-2 p-2">
        {steps.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setStep(i)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
              i === step
                ? "bg-gradient-gold text-primary-foreground"
                : i < step
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                i === step ? "bg-primary-foreground/20" : i < step ? "bg-gold/15" : "bg-surface-3",
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="hidden whitespace-nowrap font-medium md:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Step content */}
        <SurfaceCard className="p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {steps[step].label}
          </h2>

          {/* Step 1 — Temel Bilgiler */}
          {step === 0 && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Kategori">
                  <Select
                    value={category}
                    onValueChange={(v) => {
                      set("category", v);
                      set("subcategory", undefined);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Alt Kategori">
                  <Select
                    value={(values.subcategory as string) ?? ""}
                    onValueChange={(v) => set("subcategory", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryByKey[category]?.subcategories.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="İşlem Tipi">
                <div className="flex flex-wrap gap-1.5">
                  {transactionTypes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => set("transaction", t.value)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                        values.transaction === t.value
                          ? "border-gold/50 bg-gold/10 text-gold"
                          : "border-border bg-surface-2 text-secondary-foreground",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Portföy Başlığı">
                <Input
                  value={(values.title as string) ?? ""}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <Field label="Kısa Açıklama">
                <Textarea
                  rows={3}
                  value={(values.shortDescription as string) ?? ""}
                  onChange={(e) => set("shortDescription", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* Step 2 — Konum & Fiyat */}
          {step === 1 && (
            <div className="mt-5 space-y-4">
              <Field label="Konum Tipi">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      key: "approximate",
                      label: "Yaklaşık Bölge",
                      desc: "Sadece bölge gösterilir",
                    },
                    { key: "exact", label: "Tam Konum", desc: "Erişim onayıyla açılır" },
                  ].map((o) => (
                    <button
                      key={o.key}
                      onClick={() => set("locationMode", o.key)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        values.locationMode === o.key
                          ? "border-gold/50 bg-gold/10"
                          : "border-border bg-surface-2",
                      )}
                    >
                      <p className="text-sm font-semibold text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </Field>
              <ApproxLocationMap label={region} x={58} y={42} />
              <div className="grid grid-cols-3 gap-4">
                <Field label="Şehir">
                  <Input
                    value={(values.city as string) ?? ""}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>
                <Field label="İlçe">
                  <Input
                    value={(values.district as string) ?? ""}
                    onChange={(e) => set("district", e.target.value)}
                  />
                </Field>
                <Field label="Mahalle">
                  <Input
                    value={(values.neighborhood as string) ?? ""}
                    onChange={(e) => set("neighborhood", e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Fiyat">
                  <Input
                    type="number"
                    value={(values.price as number) ?? ""}
                    onChange={(e) =>
                      set("price", e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Para Birimi">
                  <Select
                    value={(values.currency as string) ?? "TRY"}
                    onValueChange={(v) => set("currency", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Fiyat Görünürlüğü">
                  <Select
                    value={(values.priceVisibility as string) ?? "visible"}
                    onValueChange={(v) => set("priceVisibility", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visible">Herkese Açık</SelectItem>
                      <SelectItem value="on_request">Talep Üzerine</SelectItem>
                      <SelectItem value="hidden">Gizli</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {/* Step 3 — Dynamic details by category */}
          {step === 2 && (
            <div className="mt-5 space-y-5">
              <div className="rounded-xl border border-gold/25 bg-gold/[0.05] px-3.5 py-2.5 text-xs text-secondary-foreground">
                <span className="font-semibold text-gold">{categoryByKey[category]?.label}</span>{" "}
                kategorisi için detay alanları gösteriliyor.
              </div>
              {detailGroups.map((g) => (
                <div key={g.id} className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">{g.label}</p>
                  <FilterFieldGrid fields={g.fields} state={values} onChange={set} />
                </div>
              ))}
              <Field label="Açıklama">
                <Textarea
                  rows={4}
                  value={(values.description as string) ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Portföy hakkında detaylı açıklama..."
                />
              </Field>
            </div>
          )}

          {/* Step 4 — Media */}
          {step === 3 && (
            <div className="mt-5 space-y-4">
              <Field label="Fotoğraflar & Kapak Görseli">
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-6 py-8 text-center">
                  <UploadCloud className="size-7 text-gold" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    Fotoğrafları sürükleyin veya seçin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG · maks. 20 görsel · ilk görsel kapak olur
                  </p>
                </div>
              </Field>
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-lg border",
                      i === 0 ? "border-gold" : "border-border",
                    )}
                  >
                    <img src={img} alt="" className="size-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        Kapak
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <Field label="Belgeler (erişim onayına kadar kilitli)">
                <div className="grid grid-cols-2 gap-2">
                  {["PDF Portföy", "Tapu Belgesi", "İmar / Ruhsat", "Kat Planı", "Video Turu"].map(
                    (d) => (
                      <div
                        key={d}
                        className="flex items-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-2 px-3 py-2.5 text-xs text-muted-foreground"
                      >
                        <UploadCloud className="size-4 text-gold" /> {d}
                      </div>
                    ),
                  )}
                </div>
              </Field>
            </div>
          )}

          {/* Step 5 — Privacy */}
          {step === 4 && (
            <div className="mt-5 space-y-4">
              <Field label="Görünürlük Seviyesi">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      key: "verified",
                      label: "Platform Üyelerine Açık",
                      desc: "Tüm doğrulanmış üyeler görebilir",
                    },
                    {
                      key: "invite",
                      label: "Sadece Davetle",
                      desc: "Yalnızca paylaştığınız kişiler",
                    },
                  ].map((o) => (
                    <button
                      key={o.key}
                      onClick={() => set("visibility", o.key)}
                      className={cn(
                        "rounded-xl border p-3 text-left",
                        (values.visibility ?? "verified") === o.key
                          ? "border-gold/50 bg-gold/10"
                          : "border-border bg-surface-2",
                      )}
                    >
                      <p className="text-sm font-semibold text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </Field>
              <ToggleRow
                label="Detay talebi gerekli"
                desc="Kilitli bilgiler için onay isteyin"
                checked={(values.requestRequired as boolean) ?? true}
                onChange={(c) => set("requestRequired", c)}
              />
              <ToggleRow
                label="Tam adresi gizle"
                desc="Adres erişim sonrası açılır"
                checked={(values.hideAddress as boolean) ?? true}
                onChange={(c) => set("hideAddress", c)}
              />
              <ToggleRow
                label="Telefon numarasını gizle"
                desc="İletişim erişim sonrası açılır"
                checked={(values.hidePhone as boolean) ?? true}
                onChange={(c) => set("hidePhone", c)}
              />
              <ToggleRow
                label="PDF portföyü kilitle"
                desc="PDF yalnızca onaylı taleplere açılır"
                checked={(values.lockPdf as boolean) ?? true}
                onChange={(c) => set("lockPdf", c)}
              />
              <Field label="Erişim Geçerlilik Süresi">
                <Select
                  value={(values.accessValidity as string) ?? "30"}
                  onValueChange={(v) => set("accessValidity", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 gün</SelectItem>
                    <SelectItem value="30">30 gün</SelectItem>
                    <SelectItem value="90">90 gün</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {/* Step 6 — Preview & completeness */}
          {step === 5 && (
            <div className="mt-5 space-y-4">
              <div
                className={cn(
                  "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
                  completeness.missingImportant.length === 0
                    ? "border-success/25 bg-success/5 text-success"
                    : "border-warning/25 bg-warning/5 text-warning",
                )}
              >
                {completeness.missingImportant.length === 0 ? (
                  <Check className="mt-0.5 size-4" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4" />
                )}
                <div>
                  {completeness.missingImportant.length === 0
                    ? "Tüm zorunlu alanlar tamamlandı. Yayınlamaya hazır."
                    : `${completeness.missingImportant.length} önemli alan eksik: ${completeness.missingImportant.join(", ")}`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Zorunlu alanlar"
                  value={`${completeness.requiredDone}/${completeness.requiredTotal}`}
                />
                <StatBox
                  label="Opsiyonel alanlar"
                  value={`${completeness.optionalDone}/${completeness.optionalTotal}`}
                />
              </div>
              <SummaryRow
                label="Başlık"
                value={(values.title as string) ?? "—"}
                onEdit={() => setStep(0)}
              />
              <SummaryRow
                label="Kategori & Bölge"
                value={`${categoryByKey[category]?.label} · ${region}`}
                onEdit={() => setStep(1)}
              />
              <SummaryRow
                label="Fiyat"
                value={formatPrice(Number(values.price) || 0)}
                onEdit={() => setStep(1)}
              />
              <SummaryRow
                label="Gizlilik"
                value={`${(values.visibility ?? "verified") === "invite" ? "Sadece davetle" : "Platform üyelerine açık"} · ${values.requestRequired === false ? "Talep gerekmiyor" : "Detay talebi gerekli"}`}
                onEdit={() => setStep(4)}
              />
              <ApproxLocationMap label={region} x={58} y={42} />
            </div>
          )}

          {/* nav */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <Button variant="outline" onClick={prev} disabled={step === 0} className="gap-1.5">
              <ChevronLeft className="size-4" /> Geri
            </Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={next}
                className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                Devam Et <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={publish}
                className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <Rocket className="size-4" /> Yayınla
              </Button>
            )}
          </div>
        </SurfaceCard>

        {/* Live preview right rail */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <SurfaceCard className="p-0">
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Canlı Önizleme
              </p>
            </div>
            <div className="p-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <img src={propertyImages.villa1} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <h3 className="mt-3 line-clamp-2 font-semibold text-foreground">
                {(values.title as string) || "Portföy başlığı"}
              </h3>
              <p className="text-xs text-muted-foreground">~{region}</p>
              <p className="mt-1.5 font-display text-xl font-semibold text-gold">
                {formatPrice(Number(values.price) || 0)}
              </p>
            </div>
            <div className="border-t border-border px-4 py-3">
              <p className="mb-2 text-xs text-muted-foreground">Adım İlerlemesi</p>
              <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-gradient-gold transition-all"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gold">
                {Math.round(((step + 1) / steps.length) * 100)}% · Adım {step + 1}/{steps.length}
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-border px-4 py-3">
              <DataScoreRing score={completeness.score} level={dataLevel} size={48} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Veri Tamlık Skoru
                </p>
                <p className="mt-0.5 text-xs text-secondary-foreground">
                  {dataLevel === "high"
                    ? "Güçlü veri — yayına hazır"
                    : dataLevel === "medium"
                      ? "İyi, daha fazla detay ekleyin"
                      : "Daha fazla bilgi ekleyin"}
                </p>
              </div>
            </div>
            {completeness.missingImportant.length > 0 && (
              <div className="border-t border-border px-4 py-3">
                <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <AlertCircle className="size-3 text-warning" /> Eksik önemli alanlar
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {completeness.missingImportant.slice(0, 6).map((m) => (
                    <span
                      key={m}
                      className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-secondary-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-lg font-semibold text-gold">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-gold hover:text-gold-light"
        onClick={onEdit}
      >
        Düzenle
      </Button>
    </div>
  );
}
