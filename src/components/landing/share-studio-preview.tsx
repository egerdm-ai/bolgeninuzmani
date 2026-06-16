import {
  MessageCircle,
  FileText,
  Link2,
  Mail,
  Send,
  Lock,
  Eye,
  Download,
  KeyRound,
  Check,
  MapPin,
  BedDouble,
  Ruler,
  QrCode,
  ChevronRight,
} from "lucide-react";
import { propertyImages } from "@/lib/mock/data";
import { GlassCard } from "./primitives";

/**
 * ShareStudioPreview — premium sharing workstation.
 * Three panels: WhatsApp teaser preview (left) · message composer & channels
 * (center) · share link, analytics & controlled-access rules (right).
 */
export function ShareStudioPreview() {
  return (
    <GlassCard className="overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
          <FileText className="size-4" />
        </span>
        <span className="text-sm font-medium text-foreground">Share Studio</span>
        <span className="ml-3 hidden text-[11px] text-muted-foreground sm:inline">
          Yalıkavak Deniz Manzaralı Villa
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
          <Lock className="size-2.5" /> Kontrollü Paylaşım
        </span>
      </div>

      <div className="grid gap-3 p-4 lg:grid-cols-3">
        {/* LEFT — WhatsApp teaser preview */}
        <div className="flex flex-col rounded-xl border border-border/60 bg-surface-2/40 p-3">
          <div className="flex items-center gap-2 text-success">
            <MessageCircle className="size-4" />
            <span className="text-[11px] font-medium">WhatsApp Önizleme</span>
          </div>
          <div className="mt-2.5 space-y-2 rounded-lg bg-background/50 p-2">
            {/* rich link card */}
            <div className="overflow-hidden rounded-lg border border-border/60 bg-surface">
              <div className="relative h-20">
                <img
                  src={propertyImages.villa1}
                  alt="Villa"
                  className="size-full object-cover"
                />
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded border border-gold/30 bg-background/80 px-1.5 py-0.5 text-[8.5px] font-medium text-gold backdrop-blur">
                  <Lock className="size-2" /> Kapalı İlan
                </span>
              </div>
              <div className="space-y-1 p-2">
                <p className="font-display text-[11px] font-semibold leading-tight text-foreground">
                  Yalıkavak Deniz Manzaralı Villa
                </p>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="size-2.5 text-gold" /> Yalıkavak
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <BedDouble className="size-2.5 text-gold" /> 5+1
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <Ruler className="size-2.5 text-gold" /> 450m²
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-gold">₺145.000.000</p>
                <p className="truncate text-[8.5px] text-success">vault.app/p/yalikavak-villa</p>
              </div>
            </div>
            <p className="rounded-lg rounded-bl-sm bg-success/10 px-2.5 py-1.5 text-[10px] leading-relaxed text-foreground">
              🏛️ Kapalı portföyümüzdeki bu özel villayı dikkatinize sunarım. Detaylar için talep
              oluşturabilirsiniz.
            </p>
          </div>
        </div>

        {/* CENTER — message composer + channels */}
        <div className="flex flex-col rounded-xl border border-border/60 bg-surface-2/40 p-3">
          <span className="text-[11px] font-medium text-foreground">Paylaşım Mesajı</span>
          <div className="mt-2.5 flex-1 rounded-lg border border-border/60 bg-background/50 p-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
            Merhaba, kapalı portföyümüzdeki bu özel villayı dikkatinize sunarım. Detaylı bilgi için
            talep oluşturabilirsiniz.
            <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-gold align-middle" />
          </div>
          <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Paylaşım Kanalı
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {[
              { icon: MessageCircle, label: "WhatsApp", active: true },
              { icon: Link2, label: "Link kopyala", active: true },
              { icon: FileText, label: "PDF dışa aktar" },
              { icon: Mail, label: "E-mail" },
            ].map((c) => (
              <span
                key={c.label}
                className={`inline-flex items-center justify-between gap-1.5 rounded-lg border px-2 py-1.5 text-[10.5px] font-medium ${
                  c.active
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border/60 bg-background/50 text-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <c.icon className="size-3" /> {c.label}
                </span>
                {c.active && <Check className="size-3" />}
              </span>
            ))}
          </div>
          <button className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-gold py-2 text-[11px] font-semibold text-primary-foreground">
            <Send className="size-3" /> Paylaşımı Oluştur
          </button>
        </div>

        {/* RIGHT — link preview, analytics & status */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/40 p-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Link2 className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-medium text-foreground">Paylaşım linki</p>
              <p className="truncate text-[9.5px] text-muted-foreground">
                vault.app/p/yalikavak-villa
              </p>
            </div>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/50 text-gold">
              <QrCode className="size-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { icon: Eye, label: "Görüntülenme", value: "342" },
              { icon: Download, label: "PDF indirme", value: "58" },
              { icon: KeyRound, label: "Detay talebi", value: "12" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/60 bg-surface-2/40 p-2 text-center"
              >
                <s.icon className="mx-auto size-3.5 text-gold" />
                <p className="mt-1 font-display text-base font-semibold leading-none text-foreground">
                  {s.value}
                </p>
                <p className="mt-1 text-[8.5px] leading-tight text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 rounded-xl border border-gold/25 bg-gold/5 p-2.5">
            <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-gold">
              <Lock className="size-3" /> Kontrollü Erişim
            </p>
            <div className="mt-2 space-y-1.5">
              {[
                "Teaser bilgiler herkese açık",
                "Tam adres talep sonrası açılır",
                "Belgeler onayla görünür",
              ].map((t) => (
                <p
                  key={t}
                  className="flex items-start gap-1.5 text-[10px] leading-snug text-muted-foreground"
                >
                  <Check className="mt-0.5 size-2.5 shrink-0 text-gold" /> {t}
                </p>
              ))}
            </div>
            <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-2 py-1.5 text-[10px] text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <KeyRound className="size-3 text-gold" /> 3 bekleyen talep
              </span>
              <ChevronRight className="size-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
