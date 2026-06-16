import { MapPin, Lock, Check, Search, Star } from "lucide-react";
import { propertyImages } from "@/lib/mock/data";
import mapDark from "@/assets/map-dark.jpg";
import { GlassCard } from "./primitives";

const PORTRAIT =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=240&h=240&q=80";

/**
 * ProfessionalProfilePreview — broker profile showcase with cover, portrait,
 * region badge, portfolio catalog list, searches tab, locked contact & follow.
 */
export function ProfessionalProfilePreview() {
  return (
    <GlassCard className="overflow-hidden">
      {/* cover */}
      <div className="relative h-24">
        <img src={mapDark} alt="Kapak" className="size-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
      </div>

      <div className="px-4 pb-4">
        {/* portrait + identity */}
        <div className="-mt-8 flex items-end gap-3">
          <img
            src={PORTRAIT}
            alt="Taylan Hersek"
            className="size-16 shrink-0 rounded-2xl border-2 border-surface object-cover"
          />
          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-display text-lg font-semibold text-foreground">Taylan Hersek</h3>
              <span className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                <Star className="size-2.5" /> Bodrum Uzmanı
              </span>
            </div>
            <p className="truncate text-[11px] text-muted-foreground">Private Real Estate Advisor</p>
          </div>
          <button className="ml-auto shrink-0 rounded-lg bg-gradient-gold px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
            Takip Et
          </button>
        </div>

        {/* tabs */}
        <div className="mt-4 flex gap-1.5">
          {["Portföyler", "Arayışlar", "Hakkında"].map((t, i) => (
            <span
              key={t}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                i === 0
                  ? "bg-gold/15 text-gold"
                  : "border border-border/60 text-muted-foreground"
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* portfolio catalog list */}
        <div className="mt-3 space-y-2">
          {[
            { img: propertyImages.villa1, name: "Yalıkavak Deniz Villa", meta: "5+1 · ₺145M", locked: true },
            { img: propertyImages.villa2, name: "Türkbükü Panorama", meta: "5+1 · ₺210M", locked: true },
          ].map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-2/40 p-2"
            >
              <img src={p.img} alt={p.name} className="size-11 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-foreground">{p.name}</p>
                <p className="truncate text-[10.5px] text-muted-foreground">{p.meta}</p>
              </div>
              {p.locked && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gold/30 px-1.5 py-0.5 text-[10px] text-gold">
                  <Lock className="size-2.5" /> Kilitli
                </span>
              )}
            </div>
          ))}
        </div>

        {/* expertise regions + locked contact */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3">
            <p className="text-[10.5px] font-semibold text-muted-foreground">Uzmanlık Bölgeleri</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {["Bodrum", "Yalıkavak", "Türkbükü"].map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-0.5 rounded-md bg-background/60 px-1.5 py-0.5 text-[10px] text-foreground"
                >
                  <MapPin className="size-2.5 text-gold" /> {r}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gold/25 bg-gold/5 p-3">
            <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-gold">
              <Lock className="size-3" /> Kontrollü İletişim
            </p>
            <p className="mt-1.5 text-[10.5px] leading-snug text-muted-foreground">
              Telefon ve doğrudan iletişim onaylı talep sonrası görünür.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
