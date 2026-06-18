import { MapPin, Lock, Star, ShieldCheck, Folder, Users, Network } from "lucide-react";
import { propertyImages } from "@/lib/mock/data";
import profileCover from "@/assets/profile-cover.jpg";
import portrait from "@/assets/professional-portrait.jpg";
import { GlassCard } from "./primitives";

/**
 * ProfessionalProfilePreview — premium luxury-network professional card.
 *
 * Composition: cover banner + a fully-visible avatar that sits in its OWN
 * layer below the cover edge (z-10) so the face is never clipped or hidden
 * behind the cover. Identity, stats, expertise chips, portfolio rows + CTAs.
 */
export function ProfessionalProfilePreview() {
  return (
    <GlassCard className="overflow-hidden">
      {/* cover banner */}
      <div className="relative h-24">
        <img
          src={profileCover}
          alt="Kapak"
          width={1024}
          height={512}
          loading="lazy"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-gold/30 bg-background/70 px-2 py-0.5 text-[10px] font-medium text-gold backdrop-blur">
          <ShieldCheck className="size-3" /> Doğrulanmış
        </span>
      </div>

      <div className="px-5 pb-5">
        {/* identity — avatar overlaps cover in its own layer; text sits below */}
        <div className="relative z-10 -mt-12 inline-flex">
          <img
            src={portrait}
            alt="Taylan Hersek"
            width={1024}
            height={1024}
            loading="lazy"
            className="size-20 rounded-2xl border-4 border-surface object-cover object-top shadow-elegant ring-1 ring-gold/30"
          />
          <span className="absolute -bottom-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full border-2 border-surface bg-gradient-gold text-primary-foreground">
            <ShieldCheck className="size-3" />
          </span>
        </div>
        <div className="mt-3">
          <h3 className="truncate font-display text-xl font-semibold text-foreground">
            Taylan Hersek
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
            Private Real Estate Advisor ·{" "}
            <span className="font-medium text-gold">Hersek Estate</span>
          </p>
        </div>

        {/* badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10.5px] font-medium text-gold">
            <Star className="size-2.5" /> Bodrum Bölge Uzmanı
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-border-strong bg-surface-2/60 px-2 py-0.5 text-[10.5px] text-foreground">
            <MapPin className="size-2.5 text-gold" /> Yalıkavak
          </span>
        </div>

        {/* stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: Folder, value: "24", label: "Aktif portföy" },
            { icon: Users, value: "1.2K", label: "Takipçi" },
            { icon: Network, value: "5", label: "Bölge" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-surface-2/40 p-2.5 text-center"
            >
              <s.icon className="mx-auto size-3.5 text-gold" />
              <p className="mt-1 font-display text-lg font-semibold leading-none text-foreground">
                {s.value}
              </p>
              <p className="mt-1 text-[9.5px] leading-tight text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* expertise chips */}
        <div className="mt-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Uzmanlık Bölgeleri
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {["Bodrum", "Yalıkavak", "Türkbükü", "Göltürkbükü", "Gümüşlük"].map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 rounded-md bg-background/60 px-2 py-0.5 text-[10.5px] text-foreground"
              >
                <MapPin className="size-2.5 text-gold" /> {r}
              </span>
            ))}
          </div>
        </div>

        {/* portfolio catalog */}
        <div className="mt-4 space-y-2">
          {[
            { img: propertyImages.villa1, name: "Yalıkavak Deniz Villa", meta: "5+1 · ₺145M" },
            { img: propertyImages.villa2, name: "Türkbükü Panorama", meta: "5+1 · ₺210M" },
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
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gold/30 px-1.5 py-0.5 text-[10px] text-gold">
                <Lock className="size-2.5" /> Kilitli
              </span>
            </div>
          ))}
        </div>

        {/* CTA hierarchy */}
        <div className="mt-4 flex items-center gap-2">
          <button className="flex-1 rounded-lg bg-gradient-gold py-2 text-[12px] font-semibold text-primary-foreground">
            Portföylerini Gör
          </button>
          <button className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-[12px] font-medium text-foreground">
            Profili Gör
          </button>
          <button className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-[12px] font-medium text-foreground">
            Takip Et
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
