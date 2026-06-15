import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { FeatureChip } from "@/components/vault/badges";
import { formatPrice } from "@/lib/format";
import { propertyImages } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/portfolios/new")({
  component: NewPortfolioWizard,
});

const steps = [
  { label: "Temel Bilgiler", icon: ShieldCheck },
  { label: "Konum & Fiyat", icon: MapPin },
  { label: "Detaylar", icon: Check },
  { label: "Medya", icon: ImagePlus },
  { label: "Gizlilik & Paylaşım", icon: ShieldCheck },
  { label: "Önizleme", icon: Eye },
];

const featureOptions = ["Deniz Manzarası", "Havuz", "Akıllı Ev", "Özel Bahçe", "Güvenlik", "Asansör", "Otopark", "Denize Sıfır"];
const galleryImages = [propertyImages.villa1, propertyImages.interior1, propertyImages.villa2, propertyImages.apartment1];

function NewPortfolioWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Yalıkavak'ta Deniz Manzaralı Özel Tasarım Villa");
  const [price, setPrice] = useState(64500000);
  const [type, setType] = useState("villa");
  const [region, setRegion] = useState("Yalıkavak / Bodrum");
  const [features, setFeatures] = useState<string[]>(["Deniz Manzarası", "Havuz"]);
  const [locationMode, setLocationMode] = useState<"approximate" | "exact">("approximate");

  const toggleFeature = (f: string) =>
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const publish = () => {
    toast.success("Portföy yayınlandı", { description: "Share Studio'ya yönlendiriliyorsunuz." });
    navigate({ to: "/dashboard/portfolios/$id/share", params: { id: "p_001" } });
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Yeni Portföy Ekle"
        breadcrumbs={[{ label: "Portföylerim", to: "/dashboard/portfolios" }, { label: "Yeni Portföy Ekle" }]}
        actions={
          <>
            <AIButton />
            <Button variant="outline" className="gap-1.5" onClick={() => toast.success("Taslak kaydedildi")}>
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
              i === step ? "bg-gradient-gold text-primary-foreground" : i < step ? "text-gold" : "text-muted-foreground hover:text-foreground",
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
          <h2 className="font-display text-xl font-semibold text-foreground">{steps[step].label}</h2>

          {step === 0 && (
            <div className="mt-5 space-y-4">
              <Field label="Portföy Tipi">
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="apartment">Daire</SelectItem>
                    <SelectItem value="land">Arsa</SelectItem>
                    <SelectItem value="hotel">Otel</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Portföy Başlığı">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Kısa Açıklama">
                <Textarea rows={3} defaultValue="Sonsuzluk havuzu ve panoramik Ege manzarası ile özel tasarım lüks villa." />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Kategori">
                  <Select defaultValue="konut">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="konut">Konut</SelectItem>
                      <SelectItem value="ticari">Ticari</SelectItem>
                      <SelectItem value="arsa">Arsa</SelectItem>
                      <SelectItem value="turizm">Turizm</SelectItem>
                      <SelectItem value="isletme">İşletme</SelectItem>
                      <SelectItem value="ozel_varlik">Özel Varlık</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Kullanım Amacı">
                  <Select defaultValue="satilik">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="satilik">Satılık</SelectItem>
                      <SelectItem value="kiralik">Kiralık</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mt-5 space-y-4">
              <Field label="Konum Tipi">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "approximate" as const, label: "Yaklaşık Bölge", desc: "Sadece bölge gösterilir" },
                    { key: "exact" as const, label: "Tam Konum", desc: "Erişim onayıyla açılır" },
                  ].map((o) => (
                    <button
                      key={o.key}
                      onClick={() => setLocationMode(o.key)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        locationMode === o.key ? "border-gold/50 bg-gold/10" : "border-border bg-surface-2",
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
                <Field label="Şehir"><Input defaultValue="Muğla" /></Field>
                <Field label="İlçe"><Input defaultValue="Bodrum" /></Field>
                <Field label="Mahalle"><Input defaultValue="Yalıkavak" /></Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Fiyat">
                  <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                </Field>
                <Field label="Para Birimi">
                  <Select defaultValue="TRY">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">TRY (₺)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Fiyat Tipi">
                  <Select defaultValue="fixed">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Sabit</SelectItem>
                      <SelectItem value="negotiable">Pazarlıklı</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Brüt Alan (m²)"><Input type="number" defaultValue={480} /></Field>
                <Field label="Net Alan (m²)"><Input type="number" defaultValue={410} /></Field>
                <Field label="Arsa Alanı (m²)"><Input type="number" defaultValue={900} /></Field>
                <Field label="Oda Sayısı"><Input defaultValue="5+1" /></Field>
                <Field label="Banyo Sayısı"><Input type="number" defaultValue={4} /></Field>
                <Field label="Otopark"><Input type="number" defaultValue={3} /></Field>
                <Field label="Yapım Yılı"><Input type="number" defaultValue={2022} /></Field>
                <Field label="Isıtma">
                  <Select defaultValue="floor">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="floor">Yerden Isıtma</SelectItem>
                      <SelectItem value="central">Merkezi</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Eşyalı">
                  <Select defaultValue="yes">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Evet</SelectItem>
                      <SelectItem value="no">Hayır</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Öne Çıkan Özellikler">
                <div className="flex flex-wrap gap-2">
                  {featureOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFeature(f)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                        features.includes(f) ? "border-gold/50 bg-gold/10 text-gold" : "border-border bg-surface-2 text-secondary-foreground",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Açıklama">
                <Textarea rows={4} defaultValue="Yalıkavak'ın en prestijli bölgesinde, korunaklı sitede yer alan villa..." />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="mt-5 space-y-4">
              <Field label="Fotoğraflar">
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-6 py-8 text-center">
                  <UploadCloud className="size-7 text-gold" />
                  <p className="mt-2 text-sm font-medium text-foreground">Fotoğrafları sürükleyin veya seçin</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG · maks. 20 görsel</p>
                </div>
              </Field>
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((img, i) => (
                  <div key={i} className={cn("relative aspect-[4/3] overflow-hidden rounded-lg border", i === 0 ? "border-gold" : "border-border")}>
                    <img src={img} alt="" className="size-full object-cover" />
                    {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">Kapak</span>}
                  </div>
                ))}
              </div>
              <Field label="Belgeler">
                <div className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-4 py-5 text-center text-sm text-muted-foreground">
                  PDF portföy, tapu ve ruhsat belgelerini yükleyin (erişim onayına kadar kilitli kalır)
                </div>
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="mt-5 space-y-4">
              <Field label="Görünürlük Seviyesi">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Platform Üyelerine Açık", desc: "Tüm doğrulanmış üyeler görebilir" },
                    { label: "Sadece Davetle", desc: "Yalnızca paylaştığınız kişiler" },
                  ].map((o, i) => (
                    <button key={o.label} className={cn("rounded-xl border p-3 text-left", i === 0 ? "border-gold/50 bg-gold/10" : "border-border bg-surface-2")}>
                      <p className="text-sm font-semibold text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </Field>
              <ToggleRow label="Erişim için talep gerekli" desc="Kilitli bilgiler için onay isteyin" defaultChecked />
              <ToggleRow label="İletişim bilgilerini gizle" desc="Telefon ve e-posta erişim sonrası açılır" defaultChecked />
              <Field label="Erişim Geçerlilik Süresi">
                <Select defaultValue="30">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 gün</SelectItem>
                    <SelectItem value="30">30 gün</SelectItem>
                    <SelectItem value="90">90 gün</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Paylaşım Notu (opsiyonel)">
                <Textarea rows={2} placeholder="Paylaşırken eklenecek özel not..." />
              </Field>
            </div>
          )}

          {step === 5 && (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-success/25 bg-success/5 px-4 py-3 text-sm text-success">
                <Check className="mr-1 inline size-4" /> Tüm zorunlu alanlar tamamlandı. Yayınlamaya hazır.
              </div>
              <SummaryRow label="Başlık" value={title} onEdit={() => setStep(0)} />
              <SummaryRow label="Tip & Bölge" value={`Villa · ${region}`} onEdit={() => setStep(1)} />
              <SummaryRow label="Fiyat" value={formatPrice(price)} onEdit={() => setStep(1)} />
              <SummaryRow label="Özellikler" value={features.join(", ")} onEdit={() => setStep(2)} />
              <SummaryRow label="Gizlilik" value="Platform üyelerine açık · Talep gerekli" onEdit={() => setStep(4)} />
              <ApproxLocationMap label={region} x={58} y={42} />
            </div>
          )}

          {/* nav */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <Button variant="outline" onClick={prev} disabled={step === 0} className="gap-1.5">
              <ChevronLeft className="size-4" /> Geri
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                Devam Et <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={publish} className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Rocket className="size-4" /> Yayınla
              </Button>
            )}
          </div>
        </SurfaceCard>

        {/* Live preview right rail */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <SurfaceCard className="p-0">
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Canlı Önizleme</p>
            </div>
            <div className="p-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <img src={propertyImages.villa1} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <h3 className="mt-3 line-clamp-2 font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">~{region}</p>
              <p className="mt-1.5 font-display text-xl font-semibold text-gold">{formatPrice(price)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {features.slice(0, 4).map((f) => <FeatureChip key={f} label={f} />)}
              </div>
            </div>
            <div className="border-t border-border px-4 py-3">
              <p className="mb-2 text-xs text-muted-foreground">Tamamlanma</p>
              <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-gradient-gold transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-gold">{Math.round(((step + 1) / steps.length) * 100)}% · Adım {step + 1}/{steps.length}</p>
            </div>
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

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function SummaryRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
      <Button variant="ghost" size="sm" className="text-gold hover:text-gold-light" onClick={onEdit}>Düzenle</Button>
    </div>
  );
}
