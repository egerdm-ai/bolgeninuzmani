import { Bot, Send, Lock, MapPin, Sparkles, Search, Bookmark, FileText, UserCheck } from "lucide-react";
import { propertyImages } from "@/lib/mock/data";
import { GlassCard } from "./primitives";

const EXPERT_AVATAR =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=160&h=160&q=80";

const tools = [
  { icon: Sparkles, label: "Portföy oluştur" },
  { icon: Search, label: "Portföy ara" },
  { icon: Bookmark, label: "Arayış kaydet" },
  { icon: Sparkles, label: "Eşleşme açıkla" },
  { icon: FileText, label: "PDF hazırla" },
  { icon: UserCheck, label: "Bölge uzmanı bul" },
];

/**
 * AIAssistantPreview — product-like chat mockup for "VAULT Asistan".
 */
export function AIAssistantPreview() {
  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <Bot className="size-4" />
          </span>
          <span className="text-sm font-medium text-foreground">VAULT Asistan</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-success">
            <span className="size-1.5 rounded-full bg-success" /> Çevrimiçi
          </span>
        </div>

        <div className="space-y-4 p-5">
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-gold/15 px-4 py-2.5 text-sm text-foreground">
            Bodrum'da deniz manzaralı, 5+1, havuzlu, 100M TL altı villa arıyorum.
          </p>

          <div className="w-fit max-w-[94%] rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
            Bu arayış için <span className="font-medium text-foreground">6 uygun portföy</span> ve{" "}
            <span className="font-medium text-foreground">4 bölge uzmanı</span> buldum. En güçlü
            eşleşmeler Yalıkavak ve Türkbükü bölgelerinde.
            <div className="mt-3 space-y-2">
              {/* matching portfolio */}
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-2">
                <img
                  src={propertyImages.villa1}
                  alt="Yalıkavak villa"
                  className="size-11 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    Yalıkavak Deniz Manzaralı Private Villa
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">5+1 · Havuzlu · ₺92M</p>
                </div>
                <span className="shrink-0 rounded-md bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  %92
                </span>
              </div>
              {/* region expert */}
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-2">
                <img src={EXPERT_AVATAR} alt="Taylan Hersek" className="size-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">Taylan Hersek</p>
                  <p className="inline-flex items-center gap-1 truncate text-[11px] text-gold">
                    <MapPin className="size-3" /> Bodrum Uzmanı
                  </p>
                </div>
                <UserCheck className="size-4 shrink-0 text-muted-foreground" />
              </div>
              {/* region insight */}
              <div className="rounded-xl border border-gold/25 bg-gold/5 p-2.5 text-[11.5px] text-foreground">
                <span className="font-semibold text-gold">Bölge içgörüsü: </span>
                Yalıkavak ve Türkbükü, bu arayışla güçlü eşleşiyor.
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Arayış Olarak Kaydet", "Detay Talebi Gönder", "Bölge Uzmanlarını Gör"].map((b, i) => (
                <span
                  key={b}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                    i === 0
                      ? "bg-gradient-gold text-primary-foreground"
                      : "border border-border-strong bg-background/60 text-foreground"
                  }`}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-background/60 px-3 py-2">
            <span className="flex-1 text-sm text-muted-foreground">Doğal dille bir talep yazın…</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground">
              <Send className="size-3.5" />
            </span>
          </div>
        </div>
      </GlassCard>

      {/* tools row */}
      <div className="flex flex-wrap gap-2">
        {tools.map((t) => (
          <span
            key={t.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground"
          >
            <t.icon className="size-3.5 text-gold" /> {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const lockRows = [
  ["Tam adres", "Detay talebi sonrası"],
  ["PDF portföy", "Onay sonrası"],
  ["Telefon", "Onay sonrası"],
];

export function LockedPreviewPanel() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Lock className="size-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Kontrollü Bilgiler</span>
      </div>
      <div className="space-y-2 p-4">
        {lockRows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-2/50 px-3 py-2.5"
          >
            <span className="text-[12px] text-foreground">{k}</span>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] text-gold">
              <Lock className="size-3" /> {v}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
