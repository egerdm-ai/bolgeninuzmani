import * as React from "react";
import {
  Sparkles,
  Lock,
  MapPin,
  KeyRound,
  Share2,
  Search,
  MessageCircle,
  FileText,
  Check,
  QrCode,
  ChevronDown,
} from "lucide-react";
import { propertyImages } from "@/lib/mock/data";
import mapDark from "@/assets/map-dark.jpg";
import { GlassCard, MapPin2 } from "./primitives";

type Step = {
  id: number;
  icon: React.ElementType;
  title: string;
  desc: string;
  visual: React.ReactNode;
};

/* ---------------- Step visuals ---------------- */

function ImportVisual() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Sparkles className="size-4 text-gold" />
        <span className="text-sm font-medium text-foreground">AI Portföy Oluşturucu</span>
        <span className="ml-auto rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
          Veri skoru %78
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-success/5 p-3">
          <p className="text-[11px] font-semibold text-success">Yapıştırılan WhatsApp mesajı</p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
            "Yalıkavak'ta deniz manzaralı 5+1 villa, havuzlu, 450m², 145M TL, acil satılık. Detaylar için ara."
          </p>
        </div>
        <div className="space-y-1.5">
          {[
            ["Bölge", "Yalıkavak"],
            ["Tip", "Villa"],
            ["Oda", "5+1"],
            ["Fiyat", "₺145M"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-surface-2/60 px-2.5 py-1.5"
            >
              <span className="text-[11px] text-muted-foreground">{k}</span>
              <span className="text-[11px] font-medium text-foreground">{v}</span>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 px-2.5 py-1.5">
            <span className="text-[11px] text-warning">Tapu durumu</span>
            <span className="text-[11px] font-medium text-warning">Eksik</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function PrivacyVisual() {
  const rows = [
    ["Tam adres", "Kilitli"],
    ["PDF portföy", "Detay talebi sonrası"],
    ["Telefon", "Onay sonrası"],
    ["Tapu & belgeler", "Kilitli"],
  ];
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Lock className="size-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Gizlilik Seviyesi</span>
      </div>
      <div className="space-y-2 p-4">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-2/50 px-3 py-2.5"
          >
            <span className="text-[12px] text-foreground">{k}</span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10.5px] font-medium text-gold">
              <Lock className="size-3" /> {v}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/5 px-3 py-2.5">
          <span className="text-[12px] text-foreground">Teaser görseller</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-[10.5px] font-medium text-success">
            <Check className="size-3" /> Herkese açık
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

function MapVisual() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <MapPin className="size-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Haritada Keşfet</span>
        <span className="ml-auto text-[10.5px] text-muted-foreground">Yalıkavak · 18 portföy</span>
      </div>
      <div className="relative h-[260px]">
        <img src={mapDark} alt="Harita keşfi" className="size-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
        <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1.5">
          {["Villa", "₺50M+", "Havuzlu", "Deniz manzaralı"].map((c) => (
            <span
              key={c}
              className="rounded-full border border-border-strong bg-background/75 px-2 py-0.5 text-[10px] text-foreground backdrop-blur"
            >
              {c}
            </span>
          ))}
        </div>
        <MapPin2 className="left-[28%] top-[44%]" label="₺145M" active />
        <MapPin2 className="left-[60%] top-[34%]" label="₺92M" />
        <MapPin2 className="left-[46%] top-[64%]" label="₺210M" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-border-strong bg-background/85 p-2 backdrop-blur">
          <img src={propertyImages.villa1} alt="" className="size-10 rounded-lg object-cover" />
          <div>
            <p className="text-[11px] font-medium text-foreground">Yalıkavak Deniz Villa</p>
            <p className="text-[10px] text-muted-foreground">5+1 · Havuzlu · ₺145M</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function MatchVisual() {
  return (
    <GlassCard className="overflow-hidden p-4">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Sparkles className="size-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Eşleşme</span>
        <span className="ml-auto rounded-md bg-gradient-gold px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
          %92 Uyum
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full w-[92%] rounded-full bg-gradient-gold" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold text-success">Uyumlu kriterler</p>
          <ul className="mt-1.5 space-y-1">
            {["Bölge: Yalıkavak", "Bütçe: 100M altı", "Oda: 5+1", "Deniz manzaralı"].map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Check className="size-3 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-warning">Kısmi / eksik</p>
          <ul className="mt-1.5 space-y-1">
            {["Havuz: tercih", "Müstakil giriş"].map((t) => (
              <li key={t} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-warning" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-gold/25 bg-gold/5 p-2.5 text-[11px] leading-relaxed text-foreground">
        <span className="font-semibold text-gold">Neden uyumlu? </span>
        Bebek arayışınızdaki bütçe, oda sayısı ve bölge tercihleri bu portföyle birebir örtüşüyor.
      </div>
    </GlassCard>
  );
}

function ShareVisual() {
  return (
    <GlassCard className="overflow-hidden p-4">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Share2 className="size-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Share Studio</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-surface-2/50 p-3">
          <div className="flex items-center gap-2 text-success">
            <MessageCircle className="size-4" />
            <span className="text-[11px] font-medium">WhatsApp önizleme</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Yalıkavak deniz manzaralı private villa · 5+1 · Havuzlu. Detaylar için: vault.app/p/yalikavak-villa
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface-2/50 p-3">
          <div className="flex items-center gap-2 text-info">
            <FileText className="size-4" />
            <span className="text-[11px] font-medium">Teaser PDF</span>
          </div>
          <div className="mt-2 h-14 rounded-lg bg-gradient-to-br from-surface-3 to-background" />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/50 p-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <QrCode className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-foreground">QR & paylaşım linki</p>
            <p className="text-[10px] text-muted-foreground">vault.app/p/yalikavak-villa</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/5 p-3">
          <Lock className="size-4 shrink-0 text-gold" />
          <p className="text-[10.5px] leading-snug text-foreground">
            Kilitli bilgiler yalnızca detay talebi sonrası görünür.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

const steps: Step[] = [
  {
    id: 1,
    icon: Sparkles,
    title: "AI ile Portföy Oluştur",
    desc: "WhatsApp mesajı, PDF veya manuel bilgiden yapılandırılmış portföy taslağı çıkarın.",
    visual: <ImportVisual />,
  },
  {
    id: 2,
    icon: Lock,
    title: "Gizlilik Seviyesini Seç",
    desc: "Tam adres, telefon, PDF, tapu ve özel notların kimlere açılacağını kontrol edin.",
    visual: <PrivacyVisual />,
  },
  {
    id: 3,
    icon: MapPin,
    title: "Haritada ve Listede Keşfedil",
    desc: "Portföyünüz doğru bölgede, doğru filtrelerle ve yaklaşık konumla görünür.",
    visual: <MapVisual />,
  },
  {
    id: 4,
    icon: Search,
    title: "Arayışlarla Eşleş",
    desc: "Yeni portföyler, kayıtlı müşteri arayışları ve bölge uzmanlarıyla otomatik eşleşir.",
    visual: <MatchVisual />,
  },
  {
    id: 5,
    icon: Share2,
    title: "Detay Talebi ve Share Studio",
    desc: "Onaylı taleplerle bilgileri açın; WhatsApp mesajı, link ve PDF ile profesyonel paylaşım yapın.",
    visual: <ShareVisual />,
  },
];

/**
 * StepProcessShowcase
 * Desktop: 5-step progress bar + sticky changing visual (left) + step cards (right).
 * Mobile: vertical accordion where each step reveals its own visual.
 */
export function StepProcessShowcase() {
  const [active, setActive] = React.useState(1);
  const current = steps.find((s) => s.id === active)!;

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-10 hidden items-center gap-2 md:flex">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => setActive(s.id)}
              className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
                s.id === active
                  ? "border-gold bg-gradient-gold text-primary-foreground shadow-gold"
                  : s.id < active
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border-strong bg-surface/60 text-muted-foreground"
              }`}
            >
              {s.id < active ? <Check className="size-4" /> : s.id}
            </button>
            {i < steps.length - 1 && (
              <div
                className={`h-px flex-1 transition-colors ${
                  s.id < active ? "bg-gold/40" : "bg-border"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Desktop split */}
      <div className="hidden gap-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          {steps.map((s) => {
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                  isActive
                    ? "border-gold/50 bg-gradient-surface shadow-gold"
                    : "border-border bg-surface/40 hover:border-border-strong"
                }`}
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                    isActive ? "bg-gradient-gold text-primary-foreground" : "bg-gold/10 text-gold"
                  }`}
                >
                  <s.icon className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold text-gold/70">0{s.id}</span>
                    <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="sticky top-24 self-start">{current.visual}</div>
      </div>

      {/* Mobile accordion */}
      <div className="space-y-3 md:hidden">
        {steps.map((s) => {
          const isOpen = s.id === active;
          return (
            <div
              key={s.id}
              className={`overflow-hidden rounded-2xl border transition-all ${
                isOpen ? "border-gold/50 bg-gradient-surface" : "border-border bg-surface/40"
              }`}
            >
              <button
                onClick={() => setActive(isOpen ? 0 : s.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                    isOpen ? "bg-gradient-gold text-primary-foreground" : "bg-gold/10 text-gold"
                  }`}
                >
                  <s.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-display text-xs font-semibold text-gold/70">0{s.id}</span>
                  <h3 className="font-display text-base font-semibold leading-tight text-foreground">
                    {s.title}
                  </h3>
                </div>
                <ChevronDown
                  className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  {s.visual}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
