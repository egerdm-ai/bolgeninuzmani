import {
  MapPin,
  Lock,
  KeyRound,
  Bookmark,
  Share2,
  ShieldCheck,
  BedDouble,
  Ruler,
  Building2,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { propertyImages } from "@/lib/mock/data";
import listingHero from "@/assets/listing-hero.jpg";
import { GlassCard } from "./primitives";

/**
 * ClosedListingShowcase — premium "kapalı portföy" portfolio detail mockup.
 * Demonstrates controlled visibility: teaser info open to the network,
 * sensitive details locked behind an approved detail request.
 */
export function ClosedListingShowcase() {
  return (
    <GlassCard className="overflow-hidden">
      {/* hero */}
      <div className="relative aspect-[16/9]">
        <img
          src={listingHero}
          alt="Yalıkavak deniz manzaralı villa"
          width={1280}
          height={720}
          loading="lazy"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />

        {/* top badges */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-background/70 px-2 py-1 text-[10.5px] font-medium text-gold backdrop-blur">
            <Lock className="size-3" /> Kapalı Portföy
          </span>
          <div className="flex items-center gap-1.5">
            <button className="flex size-7 items-center justify-center rounded-lg border border-border-strong bg-background/70 text-foreground backdrop-blur">
              <Bookmark className="size-3.5" />
            </button>
            <button className="flex size-7 items-center justify-center rounded-lg border border-border-strong bg-background/70 text-foreground backdrop-blur">
              <Share2 className="size-3.5" />
            </button>
          </div>
        </div>

        {/* title overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <MapPin className="size-3 text-gold" /> Yalıkavak, Bodrum
            <span className="text-border-strong">·</span> Yaklaşık konum
          </div>
          <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-foreground">
            Yalıkavak Deniz Manzaralı Private Villa
          </h3>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="font-display text-lg font-semibold text-gold">₺145.000.000</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-border-strong bg-background/60 px-2 py-0.5 text-[10.5px] text-foreground backdrop-blur">
              <Building2 className="size-2.5 text-gold" /> Villa
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* key facts */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: BedDouble, value: "5+1", label: "Oda" },
            { icon: Ruler, value: "450 m²", label: "Net" },
            { icon: MapPin, value: "1.2 dnm", label: "Arsa" },
            { icon: Building2, value: "Müstakil", label: "Tip" },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-border/60 bg-surface-2/40 p-2 text-center"
            >
              <f.icon className="mx-auto size-3.5 text-gold" />
              <p className="mt-1 text-[11px] font-semibold leading-none text-foreground">
                {f.value}
              </p>
              <p className="mt-1 text-[9px] leading-tight text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </div>

        {/* teaser description */}
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Yalıkavak koyuna hâkim, infinity havuzlu ve özel iskeleye yürüme mesafesinde, çağdaş
          mimariye sahip denize sıfır villa. Teaser bilgiler ağ içinde açıktır.
        </p>

        {/* gallery + locked media */}
        <div className="grid grid-cols-4 gap-1.5">
          {[propertyImages.villa1, propertyImages.interior1, propertyImages.villa2].map(
            (img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg">
                <img src={img} alt="Galeri" className="size-full object-cover" />
              </div>
            ),
          )}
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-gold/25 bg-background/60">
            <div className="text-center text-gold">
              <ImageIcon className="mx-auto size-4" />
              <p className="mt-0.5 text-[9px] font-medium">+12</p>
              <p className="text-[8px] text-muted-foreground">Kilitli</p>
            </div>
          </div>
        </div>

        {/* feature chips */}
        <div className="flex flex-wrap gap-1.5">
          {["Deniz manzarası", "Infinity havuz", "Akıllı ev", "Özel iskele"].map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-md bg-background/60 px-2 py-0.5 text-[10px] text-foreground"
            >
              <Check className="size-2.5 text-gold" /> {c}
            </span>
          ))}
        </div>

        {/* controlled visibility */}
        <div className="rounded-xl border border-gold/25 bg-gold/5 p-3">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold">
            <Lock className="size-3" /> Kontrollü Erişim
          </p>
          <div className="mt-2 space-y-1.5">
            {["Tam adres", "Malik / sahip bilgisi", "Telefon", "Tapu & belgeler"].map((t) => (
              <div
                key={t}
                className="flex items-center justify-between text-[11px] text-muted-foreground"
              >
                <span>{t}</span>
                <span className="inline-flex items-center gap-1 text-gold/90">
                  <Lock className="size-2.5" /> Talep sonrası
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-gold py-2.5 text-[12px] font-semibold text-primary-foreground">
            <KeyRound className="size-3.5" /> Detay Talebi Gönder
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-[12px] font-medium text-foreground">
            <ShieldCheck className="size-3.5 text-gold" /> Profili Gör
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
