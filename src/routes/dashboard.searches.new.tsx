import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Search, Lock, Globe } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InfoPanel, SurfaceCard } from "@/components/vault/cards";
import { MatchExplanationCard } from "@/components/vault/match-explanation-card";
import { RegionExpertCard } from "@/components/vault/region-expert-card";
import { getMatchesForSearch, getExpertsForSearch } from "@/lib/mock/matching";
import { useSaved } from "@/lib/saved-store";
import { useDetailRequest } from "@/lib/detail-request-store";
import { cn } from "@/lib/utils";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import type {
  MatchResult,
  NotificationFrequency,
  PortfolioType,
  Professional,
} from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/searches/new")({
  component: NewSearch,
});

const typeOptions: { value: PortfolioType; label: string }[] = [
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Daire" },
  { value: "land", label: "Arsa" },
  { value: "office", label: "Ofis" },
  { value: "hotel", label: "Otel" },
  { value: "commercial", label: "Ticari" },
];

const freqOptions: NotificationFrequency[] = ["instant", "daily", "weekly", "off"];

function NewSearch() {
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useSaved();
  const { open: openRequest } = useDetailRequest();
  const [region, setRegion] = useState("Bodrum");
  const [city, setCity] = useState("Muğla");
  const [type, setType] = useState<PortfolioType>("villa");
  const [budgetMin, setBudgetMin] = useState("60");
  const [budgetMax, setBudgetMax] = useState("100");
  const [rooms, setRooms] = useState("5+1");
  const [mustHave, setMustHave] = useState("Deniz Manzarası, Havuz");
  const [visibility, setVisibility] = useState<"private" | "network">("network");
  const [notify, setNotify] = useState<NotificationFrequency>("instant");
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [experts, setExperts] = useState<Professional[]>([]);

  const findMatches = () => {
    const q = {
      region,
      city,
      type,
      budgetMin: Number(budgetMin) * 1_000_000,
      budgetMax: Number(budgetMax) * 1_000_000,
      rooms,
      mustHave: mustHave.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const results = getMatchesForSearch(q);
    setMatches(results);
    setExperts(getExpertsForSearch(q));
    toast.success("Arayış kaydedildi", {
      description: `${results.length} uygun portföy bulundu. Bildirim: ${notificationFrequencyLabels[notify]}.`,
    });
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Yeni Arayış Oluştur"
        subtitle="Müşterinizin kriterlerini girin, VAULT uygun portföyleri ve bölge uzmanlarını eşleştirsin."
        breadcrumbs={[
          { label: "Arayışlar", to: "/dashboard/searches" },
          { label: "Yeni Arayış" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Form */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <InfoPanel title="Arayış Bilgileri">
            <div className="space-y-4">
              <Field label="Arayış adı">
                <Input defaultValue="Bodrum Deniz Manzaralı Villa" placeholder="örn. Bodrum Deniz Manzaralı Villa" />
              </Field>
              <Field label="Müşteri notu">
                <Input defaultValue="A. Yılmaz (VIP)" placeholder="Müşteri etiketi / takma ad" />
              </Field>
              <Field label="Doğal dil arayış alanı">
                <Textarea
                  rows={3}
                  defaultValue="Bodrum'da deniz manzaralı, 5+1, havuzlu, 100M TL altı villa arıyorum. Yalıkavak ve Türkbükü öncelikli."
                  placeholder="Aradığınız portföyü kendi cümlelerinizle yazın..."
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Şehir">
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </Field>
                <Field label="Bölge">
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} />
                </Field>
              </div>
              <Field label="Portföy tipi">
                <div className="flex flex-wrap gap-1.5">
                  {typeOptions.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                        type === t.value
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bütçe min (M TL)">
                  <Input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} inputMode="numeric" />
                </Field>
                <Field label="Bütçe max (M TL)">
                  <Input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} inputMode="numeric" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Oda">
                  <Input value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="5+1" />
                </Field>
                <Field label="Min m²">
                  <Input defaultValue="350" inputMode="numeric" />
                </Field>
              </div>
              <Field label="Olmazsa olmaz özellikler">
                <Input value={mustHave} onChange={(e) => setMustHave(e.target.value)} placeholder="Deniz Manzarası, Havuz" />
              </Field>
              <Field label="Olursa iyi olur özellikler">
                <Input defaultValue="Akıllı Ev, Denize Sıfır" />
              </Field>
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
                  <VisBtn active={visibility === "private"} onClick={() => setVisibility("private")} icon={Lock} label="Private" />
                  <VisBtn active={visibility === "network"} onClick={() => setVisibility("network")} icon={Globe} label="Network'e Açık" />
                </div>
              </Field>
              <Button onClick={findMatches} className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
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
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Eşleşmeler burada görünecek</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Kriterleri doldurup “Eşleşmeleri Bul ve Kaydet” butonuna basın. VAULT uygun portföyleri ve bölge uzmanlarını listeler.
              </p>
            </div>
          ) : (
            <>
              <SurfaceCard className="border-gold/30 bg-gold/[0.05]">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-5 shrink-0 text-gold" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">VAULT Asistan Özeti</p>
                    <p className="mt-1 text-sm text-secondary-foreground">
                      Bu arayış için <span className="font-semibold text-gold">{matches.length} uygun portföy</span> ve{" "}
                      <span className="font-semibold text-gold">{experts.length} bölge uzmanı</span> bulundu. Yeni
                      eşleşmelerde <span className="font-semibold text-gold">{notificationFrequencyLabels[notify].toLocaleLowerCase("tr-TR")}</span> bildirim alacaksınız.
                    </p>
                  </div>
                </div>
              </SurfaceCard>

              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Eşleşen Portföyler</h2>
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
                  <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Önerilen Bölge Uzmanları</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {experts.map((e) => (
                      <RegionExpertCard key={e.id} professional={e} regionName={region} />
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={() => navigate({ to: "/dashboard/searches" })} variant="outline" className="w-full">
                Arayışlara dön
              </Button>
            </>
          )}
        </div>
      </div>
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
        active ? "border-gold/40 bg-gold/10 text-gold" : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );
}
