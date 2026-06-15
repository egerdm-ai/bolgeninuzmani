import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle,
  FileText,
  ImagePlus,
  Type,
  Sparkles,
  Check,
  AlertTriangle,
  ArrowRight,
  UploadCloud,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/ai-import")({
  component: AIImportHub,
});

const sources = [
  { key: "whatsapp", label: "WhatsApp Metni", icon: MessageCircle },
  { key: "pdf", label: "PDF / Katalog", icon: FileText },
  { key: "photos", label: "Fotoğraflar", icon: ImagePlus },
  { key: "manual", label: "Manuel Metin", icon: Type },
];

const sampleWhatsapp = `Yalıkavak'ta satılık müstakil villa 🌊
5+1, 480m2 kapalı alan, 900m2 arsa
Sonsuzluk havuzu, deniz manzaralı
Akıllı ev sistemi, 3 araçlık otopark
Fiyat: 64.500.000 TL
Detaylı bilgi ve fotoğraflar için DM`;

const extractedFields = [
  { label: "Portföy Tipi", value: "Villa", confidence: 98 },
  { label: "Oda Sayısı", value: "5+1", confidence: 95 },
  { label: "Kapalı Alan", value: "480 m²", confidence: 92 },
  { label: "Arsa Alanı", value: "900 m²", confidence: 90 },
  { label: "Fiyat", value: "64.500.000 TL", confidence: 96 },
  { label: "Bölge", value: "Yalıkavak / Bodrum", confidence: 88 },
  { label: "Özellikler", value: "Deniz Manzarası, Havuz, Akıllı Ev", confidence: 84 },
];

const missingFields = ["Tapu Durumu", "Net Alan", "Yapım Yılı", "Banyo Sayısı"];

function AIImportHub() {
  const navigate = useNavigate();
  const [source, setSource] = useState("whatsapp");
  const [text, setText] = useState(sampleWhatsapp);
  const [extracted, setExtracted] = useState(false);

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="AI Portföy İçe Aktarma"
        subtitle="WhatsApp mesajı, PDF veya metinden saniyeler içinde yapılandırılmış portföy taslağı oluşturun."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sources.map((s) => (
              <button
                key={s.key}
                onClick={() => setSource(s.key)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors",
                  source === s.key ? "border-gold/50 bg-gold/10 text-gold" : "border-border bg-surface-2 text-secondary-foreground hover:border-border-strong",
                )}
              >
                <s.icon className="size-5" />
                <span className="text-center text-[11px] font-medium leading-tight">{s.label}</span>
              </button>
            ))}
          </div>

          <SurfaceCard className="space-y-4">
            {source === "whatsapp" || source === "manual" ? (
              <>
                <h3 className="text-sm font-semibold text-foreground">{source === "whatsapp" ? "WhatsApp mesajını yapıştırın" : "Metni yazın veya yapıştırın"}</h3>
                <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="resize-none text-sm" />
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-foreground">{source === "pdf" ? "PDF / Katalog Yükle" : "Fotoğraf Yükle"}</h3>
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-6 py-12 text-center">
                  <UploadCloud className="size-8 text-gold" />
                  <p className="mt-2 text-sm font-medium text-foreground">Dosyaları sürükleyin veya seçin</p>
                  <p className="text-xs text-muted-foreground">{source === "pdf" ? "PDF · maks. 25MB" : "JPG, PNG · maks. 20 görsel"}</p>
                </div>
              </>
            )}
            <Button onClick={() => setExtracted(true)} className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Sparkles className="size-4" /> AI ile Taslak Oluştur
            </Button>
          </SurfaceCard>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {!extracted ? (
            <SurfaceCard className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gold/10 text-gold"><Sparkles className="size-7" /></span>
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">AI Taslak Önizleme</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">İçeriğinizi yapıştırın ve "AI ile Taslak Oluştur" butonuna basın. Çıkarılan alanlar burada görünecek.</p>
            </SurfaceCard>
          ) : (
            <>
              <SurfaceCard className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-success/15 text-success"><Check className="size-4" /></span>
                  <h3 className="text-sm font-semibold text-foreground">Çıkarılan Alanlar</h3>
                </div>
                <ul className="space-y-2">
                  {extractedFields.map((f) => (
                    <li key={f.label} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{f.label}</p>
                        <p className="truncate text-sm font-medium text-foreground">{f.value}</p>
                      </div>
                      <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-xs font-medium", f.confidence >= 90 ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
                        %{f.confidence}
                      </span>
                    </li>
                  ))}
                </ul>
              </SurfaceCard>

              <SurfaceCard className="space-y-3 border-warning/25 bg-warning/[0.04]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-warning" />
                  <h3 className="text-sm font-semibold text-foreground">Eksik Alanlar</h3>
                </div>
                <p className="text-xs text-muted-foreground">Aşağıdaki alanları taslakta tamamlamanız önerilir:</p>
                <div className="flex flex-wrap gap-1.5">
                  {missingFields.map((m) => (
                    <span key={m} className="rounded-md bg-warning/10 px-2 py-0.5 text-xs text-warning ring-1 ring-inset ring-warning/25">{m}</span>
                  ))}
                </div>
              </SurfaceCard>

              <Button onClick={() => navigate({ to: "/dashboard/portfolios/new" })} className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                Portföy Taslağına Dönüştür <ArrowRight className="size-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">AI yalnızca taslak oluşturur · Yayınlamadan önce siz onaylarsınız</p>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
