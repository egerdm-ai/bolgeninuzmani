import * as React from "react";
import { Lock, KeyRound, Sparkles, Bell, MapPin } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared glass surface                                               */
/* ------------------------------------------------------------------ */

export function GlassCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-border-strong bg-surface/80 shadow-elegant backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section header                                                     */
/* ------------------------------------------------------------------ */

export function SectionHeader({
  eyebrow,
  title,
  desc,
  className = "",
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {desc && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{desc}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Map price pin                                                      */
/* ------------------------------------------------------------------ */

export function MapPin2({
  className = "",
  label,
  active = false,
}: {
  className?: string;
  label: string;
  active?: boolean;
}) {
  return (
    <span
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur ${
        active
          ? "border-gold bg-gradient-gold text-primary-foreground shadow-gold"
          : "border-border-strong bg-background/85 text-foreground"
      } ${className}`}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Mini reusable product cards                                        */
/* ------------------------------------------------------------------ */

export function LockedPortfolioMiniCard({
  image,
  title = "Yalıkavak Deniz Villa",
  className = "",
}: {
  image: string;
  title?: string;
  className?: string;
}) {
  return (
    <GlassCard className={`w-[230px] overflow-hidden ${className}`}>
      <div className="relative h-24">
        <img src={image} alt={title} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md border border-gold/30 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-gold backdrop-blur">
          <Lock className="size-3" /> Detay Talebi Gerekli
        </span>
      </div>
      <div className="space-y-2 p-3">
        <p className="font-display text-base font-semibold leading-tight text-foreground">{title}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Tam adres</span>
            <span className="inline-flex items-center gap-1 text-gold/80">
              <Lock className="size-3" /> Kilitli
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Tapu & belgeler</span>
            <span className="inline-flex items-center gap-1 text-gold/80">
              <Lock className="size-3" /> Kilitli
            </span>
          </div>
        </div>
        <button className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-gold py-1.5 text-[11px] font-semibold text-primary-foreground">
          <KeyRound className="size-3" /> Detay Talebi Gönder
        </button>
      </div>
    </GlassCard>
  );
}

export function MatchScoreMiniCard({
  score = 92,
  title = "Yalıkavak Deniz Manzaralı Villa",
  className = "",
}: {
  score?: number;
  title?: string;
  className?: string;
}) {
  return (
    <GlassCard className={`w-[244px] p-3.5 ${className}`}>
      <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-gold/15 text-gold">
          <Sparkles className="size-3.5" />
        </span>
        <span className="text-xs font-medium text-foreground">AI Eşleşme</span>
        <span className="ml-auto rounded-md bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
          %{score} Uyum
        </span>
      </div>
      <p className="mt-2.5 text-[12px] font-medium leading-tight text-foreground">{title}</p>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${score}%` }} />
      </div>
      <div className="mt-2.5 space-y-1 text-[10.5px] text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success" /> Bölge, bütçe ve oda sayısı uyumlu
        </p>
        <p className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-warning" /> Havuz tercihi kısmen uyumlu
        </p>
      </div>
    </GlassCard>
  );
}

export function NotificationMiniCard({
  text = "Bebek arayışınıza yüksek uyumlu yeni bir portföy eklendi.",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <GlassCard className={`flex w-[252px] items-start gap-2.5 p-3 ${className}`}>
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
        <Bell className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-foreground">Yeni eşleşme</p>
        <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">{text}</p>
      </div>
    </GlassCard>
  );
}

export function RegionExpertMiniCard({
  name = "Taylan Hersek",
  region = "Yalıkavak Bölge Uzmanı",
  avatar,
  className = "",
}: {
  name?: string;
  region?: string;
  avatar: string;
  className?: string;
}) {
  return (
    <GlassCard className={`flex w-[238px] items-center gap-2.5 p-3 ${className}`}>
      <img src={avatar} alt={name} className="size-10 shrink-0 rounded-full object-cover" />
      <div className="min-w-0">
        <p className="truncate text-[12px] font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] text-gold">
          <MapPin className="size-3" /> {region}
        </p>
      </div>
    </GlassCard>
  );
}
