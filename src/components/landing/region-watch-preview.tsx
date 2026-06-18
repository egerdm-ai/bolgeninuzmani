import { MapPin, Bell, Check } from "lucide-react";
import mapDark from "@/assets/map-dark.jpg";
import { GlassCard } from "./primitives";

const regions = [
  { name: "Yalıkavak", portfolios: 18, searches: 12, experts: 6, demand: "Yüksek", watched: true },
  { name: "Bebek", portfolios: 9, searches: 21, experts: 4, demand: "Çok Yüksek", watched: true },
  { name: "Riva", portfolios: 14, searches: 7, experts: 3, demand: "Orta", watched: false },
  { name: "Çeşme", portfolios: 11, searches: 10, experts: 5, demand: "Yüksek", watched: false },
];

/**
 * RegionWatchPreview — dark map/card composition with region watch toggles,
 * notification card and region metrics.
 */
export function RegionWatchPreview() {
  return (
    <div className="space-y-4">
      {/* Notification banner */}
      <GlassCard className="flex items-start gap-3 p-3.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
          <Bell className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">Bebek bölge takibi</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
            Bebek villa arayışınızla yüksek uyumlu yeni bir portföy eklendi.
          </p>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {regions.map((r) => (
          <GlassCard key={r.name} className="overflow-hidden">
            <div className="relative h-20">
              <img
                src={mapDark}
                alt={`${r.name} haritası`}
                className="size-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <MapPin className="size-3.5 text-gold" /> {r.name}
              </span>
              <span
                className={`absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  r.watched
                    ? "border-gold/40 bg-gold/15 text-gold"
                    : "border-border-strong bg-background/70 text-muted-foreground"
                }`}
              >
                {r.watched && <Check className="size-2.5" />}
                {r.watched ? "Takip Ediliyor" : "Takip Et"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              {[
                ["Aktif Portföy", r.portfolios],
                ["Aktif Arayış", r.searches],
                ["Bölge Uzmanı", r.experts],
                ["Talep Yoğunluğu", r.demand],
              ].map(([k, v]) => (
                <div
                  key={k as string}
                  className="rounded-lg border border-border/60 bg-surface-2/40 px-2.5 py-1.5"
                >
                  <p className="text-[10px] text-muted-foreground">{k}</p>
                  <p className="mt-0.5 font-display text-base font-semibold text-foreground">{v}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
