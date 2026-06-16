import { MapPin, Search, Lock, KeyRound, Sparkles, ShieldCheck } from "lucide-react";
import { propertyImages } from "@/lib/mock/data";
import heroMap from "@/assets/hero-map-dark.jpg";
import { GlassCard, MapPin2 } from "./primitives";

const EXPERT_AVATAR =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=160&h=160&q=80";

/**
 * LandingHeroProductMockup
 * Clean layered composition: one main dark-luxury map panel + three
 * well-spaced floating panels (AI match · locked portfolio · verified expert).
 * No overlapping collisions — clear hierarchy.
 */
export function LandingHeroProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[600px] px-2 sm:px-6 lg:px-0">
      {/* Base — dark luxury map */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="size-4 text-gold" /> Harita Keşfi
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-gold/70" />
          </div>
        </div>
        <div className="relative h-[300px] sm:h-[360px]">
          <img
            src={heroMap}
            alt="VAULT dark luxury harita keşfi"
            width={1024}
            height={896}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/95 via-surface/10 to-surface/30" />

          {/* search bar */}
          <div className="absolute inset-x-4 top-4 flex items-center gap-2 rounded-xl border border-border-strong bg-background/85 px-3 py-2 backdrop-blur-md">
            <Search className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Bodrum · Villa · Deniz manzaralı</span>
          </div>

          {/* filter chips */}
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-1.5">
            {["Yalıkavak", "5+1", "Havuzlu", "Deniz manzaralı"].map((c) => (
              <span
                key={c}
                className="rounded-full border border-border-strong bg-background/70 px-2 py-0.5 text-[10px] text-foreground backdrop-blur"
              >
                {c}
              </span>
            ))}
          </div>

          {/* glowing price pins */}
          <MapPin2 className="left-[24%] top-[34%]" label="₺145M" />
          <MapPin2 className="left-[52%] top-[46%]" label="₺92M" active />
          <MapPin2 className="left-[40%] top-[70%]" label="₺64M" />
        </div>
      </GlassCard>

      {/* Floating — AI match (top-right) */}
      <GlassCard className="absolute -right-3 -top-5 hidden w-[230px] p-3.5 shadow-gold md:block lg:-right-8">
        <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
          <span className="flex size-6 items-center justify-center rounded-md bg-gold/15 text-gold">
            <Sparkles className="size-3.5" />
          </span>
          <span className="text-xs font-medium text-foreground">AI Eşleşme</span>
          <span className="ml-auto rounded-md bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            %92 Uyum
          </span>
        </div>
        <p className="mt-2.5 text-[12px] font-medium leading-tight text-foreground">
          Yalıkavak Deniz Manzaralı Villa
        </p>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full w-[92%] rounded-full bg-gradient-gold" />
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" /> Bölge, bütçe ve oda sayısı uyumlu
        </p>
      </GlassCard>

      {/* Floating — locked portfolio (bottom-left) */}
      <GlassCard className="absolute -bottom-6 -left-3 hidden w-[222px] overflow-hidden sm:block lg:-left-8">
        <div className="relative h-20">
          <img
            src={propertyImages.villa1}
            alt="Yalıkavak Deniz Villa"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md border border-gold/30 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-gold backdrop-blur">
            <Lock className="size-3" /> Detay Talebi Gerekli
          </span>
        </div>
        <div className="space-y-2 p-3">
          <p className="font-display text-base font-semibold leading-tight text-foreground">
            Yalıkavak Deniz Villa
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Tam adres · Belgeler</span>
            <span className="inline-flex items-center gap-1 text-gold/80">
              <Lock className="size-3" /> Kilitli
            </span>
          </div>
          <button className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-gold py-1.5 text-[11px] font-semibold text-primary-foreground">
            <KeyRound className="size-3" /> Detay Talebi Gönder
          </button>
        </div>
      </GlassCard>

      {/* Floating — verified expert (bottom-right) */}
      <GlassCard className="absolute -bottom-5 right-2 hidden items-center gap-2.5 p-2.5 lg:flex lg:-right-6">
        <img
          src={EXPERT_AVATAR}
          alt="Taylan Hersek"
          className="size-10 shrink-0 rounded-full object-cover ring-2 ring-gold/30"
        />
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1 text-[12px] font-semibold text-foreground">
            Taylan Hersek
            <ShieldCheck className="size-3 text-gold" />
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] text-gold">
            <MapPin className="size-3" /> Yalıkavak Bölge Uzmanı
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
