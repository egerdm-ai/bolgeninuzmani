import { MessageCircle, FileText, Link2, QrCode, Lock, Eye, Download, KeyRound } from "lucide-react";
import { propertyImages } from "@/lib/mock/data";
import { GlassCard } from "./primitives";

/**
 * ShareStudioPreview — WhatsApp message, PDF cover, public link, QR placeholder,
 * locked-info warning and share analytics mini stats.
 */
export function ShareStudioPreview() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
          <FileText className="size-4" />
        </span>
        <span className="text-sm font-medium text-foreground">Share Studio</span>
        <span className="ml-auto text-[10.5px] text-muted-foreground">Yalıkavak Deniz Villa</span>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {/* WhatsApp preview */}
        <div className="rounded-xl border border-border/60 bg-surface-2/50 p-3">
          <div className="flex items-center gap-2 text-success">
            <MessageCircle className="size-4" />
            <span className="text-[11px] font-medium">WhatsApp mesajı</span>
          </div>
          <p className="mt-2 rounded-lg rounded-bl-sm bg-success/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-foreground">
            🏛️ Yalıkavak deniz manzaralı private villa · 5+1 · Havuzlu · 450m². Teaser:
            vault.app/p/yalikavak-villa
          </p>
        </div>

        {/* PDF cover */}
        <div className="rounded-xl border border-border/60 bg-surface-2/50 p-3">
          <div className="flex items-center gap-2 text-info">
            <FileText className="size-4" />
            <span className="text-[11px] font-medium">Teaser PDF kapağı</span>
          </div>
          <div className="relative mt-2 h-20 overflow-hidden rounded-lg">
            <img src={propertyImages.villa1} alt="PDF kapak" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            <span className="absolute bottom-1.5 left-2 font-display text-[11px] font-semibold text-foreground">
              VAULT · Private Portfolio
            </span>
          </div>
        </div>

        {/* public link */}
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/50 p-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <Link2 className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-foreground">Paylaşım linki</p>
            <p className="truncate text-[10px] text-muted-foreground">vault.app/p/yalikavak-villa</p>
          </div>
        </div>

        {/* QR */}
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/50 p-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <QrCode className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-foreground">QR kod</p>
            <p className="text-[10px] text-muted-foreground">Etkinlik & sunum için</p>
          </div>
        </div>
      </div>

      {/* locked warning */}
      <div className="mx-4 flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/5 p-2.5">
        <Lock className="size-4 shrink-0 text-gold" />
        <p className="text-[10.5px] leading-snug text-foreground">
          Teaser bilgiler açık kalır; tam adres, telefon ve belgeler{" "}
          <span className="font-medium text-gold">detay talebi sonrası</span> görünür.
        </p>
      </div>

      {/* analytics */}
      <div className="grid grid-cols-3 gap-2 p-4">
        {[
          { icon: Eye, label: "Link görüntülenme", value: "342" },
          { icon: Download, label: "PDF indirme", value: "58" },
          { icon: KeyRound, label: "Detay talebi", value: "12" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-surface-2/40 p-2.5 text-center">
            <s.icon className="mx-auto size-4 text-gold" />
            <p className="mt-1 font-display text-lg font-semibold text-foreground">{s.value}</p>
            <p className="text-[9.5px] leading-tight text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
