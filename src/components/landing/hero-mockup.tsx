import { MapPin, Search, Share2, MessageCircle, FileText } from "lucide-react";
import { propertyImages } from "@/lib/mock/data";
import mapDark from "@/assets/map-dark.jpg";
import {
  GlassCard,
  MapPin2,
  LockedPortfolioMiniCard,
  MatchScoreMiniCard,
  NotificationMiniCard,
  RegionExpertMiniCard,
} from "./primitives";

const EXPERT_AVATAR =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=160&h=160&q=80";

/**
 * LandingHeroProductMockup
 * Layered glass product showcase: map-first search base with floating
 * locked portfolio, AI match, region expert, share studio & notification cards.
 */
export function LandingHeroProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      {/* Base — map-first search */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="size-4 text-gold" /> Harita Araması
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-gold/70" />
          </div>
        </div>
        <div className="relative h-[320px]">
          <img src={mapDark} alt="VAULT harita araması" className="size-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent" />
          <div className="absolute inset-x-4 top-4 flex items-center gap-2 rounded-xl border border-border-strong bg-background/80 px-3 py-2 backdrop-blur-md">
            <Search className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Bodrum · Villa · Deniz manzaralı</span>
          </div>
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
          <MapPin2 className="left-[20%] top-[40%]" label="₺145M" />
          <MapPin2 className="left-[50%] top-[28%]" label="₺92M" active />
          <MapPin2 className="left-[72%] top-[56%]" label="₺210M" />
          <MapPin2 className="left-[36%] top-[66%]" label="₺64M" />
        </div>
      </GlassCard>

      {/* Floating — locked portfolio */}
      <LockedPortfolioMiniCard
        image={propertyImages.villa1}
        className="absolute -left-6 top-36 hidden sm:block"
      />

      {/* Floating — AI match score */}
      <MatchScoreMiniCard className="absolute -right-5 top-20 hidden md:block" />

      {/* Floating — region expert */}
      <RegionExpertMiniCard
        avatar={EXPERT_AVATAR}
        className="absolute -left-2 -bottom-6 hidden lg:flex"
      />

      {/* Floating — share studio mini */}
      <GlassCard className="absolute -right-4 bottom-24 hidden w-[228px] p-3 lg:block">
        <div className="flex items-center gap-2 border-b border-border/60 pb-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-gold/15 text-gold">
            <Share2 className="size-3.5" />
          </span>
          <span className="text-xs font-medium text-foreground">Share Studio</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-border/60 bg-surface-2/60 p-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-success/15 text-success">
            <MessageCircle className="size-3.5" />
          </span>
          <p className="truncate text-[11px] font-medium text-foreground">WhatsApp mesajı hazır</p>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-surface-2/60 p-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-info/15 text-info">
            <FileText className="size-3.5" />
          </span>
          <p className="truncate text-[11px] font-medium text-foreground">Profesyonel PDF · 6 sayfa</p>
        </div>
      </GlassCard>

      {/* Floating — notification */}
      <NotificationMiniCard className="absolute right-8 -top-6 hidden xl:flex" />
    </div>
  );
}
