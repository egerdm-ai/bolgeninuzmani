import { useState } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  ImageOff,
  Expand,
  Lock,
  Bed,
  Square,
  Layers,
  Bath,
  Car,
  Thermometer,
  Compass,
  Building2,
  Wallet,
  ArrowUpDown,
  Sofa,
  Home,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { s } from "@/lib/styles";
import { ImageLightbox } from "@/components/portfolio/image-lightbox";
import { ThumbImage } from "@/components/portfolio/thumb-image";
import { ClosedModeBadge, RefNoText } from "@/components/portfolio/portfolio-badges";
import { CATEGORY_LABELS, TRANSACTION_LABELS, formatPortfolioPrice } from "@/lib/portfolio-labels";
import { attributesForCategory, attributeDef } from "@/lib/portfolio-attributes";
import type { Database } from "@/lib/database.types";

type Category = Database["public"]["Enums"]["portfolio_category"];
type Txn = Database["public"]["Enums"]["transaction_type"];
type Mode = Database["public"]["Enums"]["portfolio_mode"];
type Currency = Database["public"]["Enums"]["currency"];

export type DetailImage = { url: string; thumbUrl: string; locked?: boolean };

export type DetailAgent = {
  full_name: string;
  username: string;
  avatar_url: string | null;
  title?: string | null;
  company_name: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  expertise_regions?: string[];
  expertise_types?: string[];
};

const fmtLocation = (n?: string | null, d?: string | null, c?: string | null) =>
  [n, d, c].filter(Boolean).join(", ") || "Konum belirtilmemiş";

/* ── 1. HERO GALLERY (§2.2) ── */
export function DetailGallery({ images, title }: { images: DetailImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const hero = images[active];

  return (
    <div className="space-y-3">
      <div className="group relative h-[360px] overflow-hidden rounded-bu-xl bg-bu-card md:h-[520px]">
        {hero ? (
          <img
            src={hero.url}
            alt={title}
            className="size-full cursor-zoom-in object-cover"
            onClick={() => setLightbox(active)}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-bu-text-3">
            <ImageOff className="size-10" />
          </div>
        )}
        {images.length > 0 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <span className="rounded-bu-full border border-bu-border bg-bu-lock-bg/80 px-3 py-1.5 text-sm font-medium text-bu-text backdrop-blur-md">
              {active + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(active)}
              className="inline-flex items-center gap-1.5 rounded-bu-full bg-bu-gold/90 px-3 py-1.5 text-sm font-semibold text-bu-text-inv transition-colors duration-200 hover:bg-bu-gold"
            >
              <Expand className="size-3.5" /> Tümünü Gör
            </button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-[64px] w-[96px] shrink-0 overflow-hidden rounded-bu-md border-2 transition-all duration-200",
                i === active ? "border-bu-gold" : "border-transparent hover:border-bu-border",
              )}
            >
              <ThumbImage thumb={img.thumbUrl} full={img.url} className="size-full object-cover" />
              {img.locked && (
                <span className="absolute right-1 top-1 rounded bg-bu-lock-bg/80 p-0.5 text-bu-gold backdrop-blur-sm">
                  <Lock className="size-3" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {lightbox !== null && (
        <ImageLightbox
          images={images.map((i) => i.url)}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

/* ── 2. CATEGORY CHIPS + TITLE + PRICE (§2.3) ── */
export function DetailHeader({
  title,
  refNo,
  mode,
  category,
  subcategory,
  transactionType,
  neighborhood,
  district,
  city,
  price,
  currency,
  statusSlot,
}: {
  title: string;
  refNo: string;
  mode: Mode;
  category: Category;
  subcategory: string | null;
  transactionType: Txn;
  neighborhood: string | null;
  district: string | null;
  city: string | null;
  price: number | null;
  currency: Currency;
  statusSlot?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={s.chipGold}>{TRANSACTION_LABELS[transactionType]}</span>
        <span className={s.chip}>{CATEGORY_LABELS[category]}</span>
        {subcategory && <span className={s.chip}>{subcategory}</span>}
        <ClosedModeBadge mode={mode} />
        {statusSlot}
      </div>
      <h1 className="font-display text-3xl font-bold leading-tight text-bu-text md:text-4xl-bu">
        {title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="flex items-center gap-1.5 text-sm text-bu-text-2">
          <MapPin className="size-4 shrink-0 text-bu-gold" />~
          {fmtLocation(neighborhood, district, city)}
        </p>
        <RefNoText value={refNo} />
      </div>
      <div className="mt-5">
        <p className="mb-1 text-xs uppercase tracking-wider text-bu-text-2">Fiyat</p>
        <p className="font-display text-price font-bold leading-none text-bu-gold">
          {formatPortfolioPrice(price, currency)}
        </p>
      </div>
    </div>
  );
}

/* ── 3. QUICK INFO STRIP (§2.4) ── */
function ChipInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-bu-lg border border-bu-border bg-bu-card px-4 py-2.5">
      <Icon className="size-4 shrink-0 text-bu-gold" />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase leading-none tracking-wider text-bu-text-3">
          {label}
        </span>
        <span className="mt-0.5 text-sm font-semibold text-bu-text">{value}</span>
      </div>
    </div>
  );
}

export function QuickInfoStrip({
  roomCount,
  grossM2,
  netM2,
  landM2,
  attributes,
}: {
  roomCount: string | null;
  grossM2: number | null;
  netM2: number | null;
  landM2: number | null;
  attributes: Record<string, unknown>;
}) {
  const a = attributes ?? {};
  const items: { icon: LucideIcon; label: string; value: string }[] = [];
  if (roomCount) items.push({ icon: Bed, label: "Oda", value: roomCount });
  if (grossM2 != null) items.push({ icon: Square, label: "Brüt", value: `${grossM2} m²` });
  if (netM2 != null) items.push({ icon: Square, label: "Net", value: `${netM2} m²` });
  if (landM2 != null) items.push({ icon: Square, label: "Arsa", value: `${landM2} m²` });
  if (a.kat) items.push({ icon: Layers, label: "Kat", value: String(a.kat) });
  if (a.banyo_sayisi != null)
    items.push({ icon: Bath, label: "Banyo", value: String(a.banyo_sayisi) });
  if (a.otopark) {
    const def = attributeDef("otopark");
    const v = def?.options?.find((o) => o.value === a.otopark)?.label ?? String(a.otopark);
    items.push({ icon: Car, label: "Otopark", value: v });
  }
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it, i) => (
        <ChipInfo key={i} {...it} />
      ))}
    </div>
  );
}

/* ── 4. DESCRIPTION + PUBLIC ATTRIBUTES (§2.5) ── */
const ATTR_ICON: Record<string, LucideIcon> = {
  isitma: Thermometer,
  cephe: Compass,
  bina_yasi: Building2,
  bina_kat_sayisi: Layers,
  kat: Layers,
  banyo_sayisi: Bath,
  otopark: Car,
  asansor: ArrowUpDown,
  aidat: Wallet,
  esyali: Sofa,
};

function fmtAttrValue(key: string, v: unknown): string {
  const def = attributeDef(key);
  if (!def) return String(v);
  if (def.type === "boolean") return v ? "Evet" : "Hayır";
  if (def.type === "select") return def.options?.find((o) => o.value === v)?.label ?? String(v);
  if (def.type === "multiselect" && typeof v === "string")
    return v
      .split(",")
      .map((x) => def.options?.find((o) => o.value === x)?.label ?? x)
      .join(", ");
  return String(v);
}

export function AttributesSection({
  category,
  features,
  attributes,
}: {
  category: Category;
  features: string[];
  attributes: Record<string, unknown>;
}) {
  const a = attributes ?? {};
  const publicDefs = attributesForCategory(category).filter(
    (d) =>
      d.visibility === "public" && a[d.key] !== undefined && a[d.key] !== "" && a[d.key] !== null,
  );
  if (features.length === 0 && publicDefs.length === 0) return null;
  return (
    <section className="border-t border-bu-border pt-8">
      <h2 className={s.sectionTitle}>Özellikler</h2>
      {features.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {features.map((f) => (
            <span key={f} className={s.chip}>
              {f}
            </span>
          ))}
        </div>
      )}
      {publicDefs.length > 0 && (
        <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-bu-lg border border-bu-border sm:grid-cols-2">
          {publicDefs.map((d, i) => {
            const Icon = ATTR_ICON[d.key] ?? Home;
            return (
              <div
                key={d.key}
                className={cn(
                  "flex items-center gap-3 border-b border-bu-border px-4 py-3 last:border-b-0",
                  i % 2 === 0 ? "sm:border-r" : "",
                )}
              >
                <Icon className="size-4 shrink-0 text-bu-text-2" />
                <span className="flex-1 text-sm text-bu-text-2">{d.label}</span>
                <span className="text-sm font-semibold text-bu-text">
                  {fmtAttrValue(d.key, a[d.key])}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ── 5. APPROX LOCATION (§2.5) — exact NEVER shown ── */
export function ApproxLocationBox({
  neighborhood,
  district,
  city,
}: {
  neighborhood: string | null;
  district: string | null;
  city: string | null;
}) {
  return (
    <section className="border-t border-bu-border pt-8">
      <h2 className={s.sectionTitle}>Konum</h2>
      <p className="mt-1 text-xs text-bu-text-3">
        Yaklaşık konum gösterilmektedir. Tam adres, detay talebi onaylandıktan sonra paylaşılır.
      </p>
      <div className="mt-4 flex h-48 items-center justify-center rounded-bu-lg border border-bu-border bg-bu-card">
        <div className="text-center">
          <MapPin className="mx-auto mb-2 size-8 text-bu-gold" />
          <p className="text-sm text-bu-text-2">~{fmtLocation(neighborhood, district, city)}</p>
          <p className="mt-1 text-xs text-bu-text-3">Harita yakında</p>
        </div>
      </div>
    </section>
  );
}

/* ── 6. AGENT CARD (§2.6) ── */
export function AgentContactCard({ agent }: { agent: DetailAgent }) {
  const wa = agent.contact_whatsapp?.replace(/\D/g, "");
  const expertise = [...(agent.expertise_regions ?? []), ...(agent.expertise_types ?? [])];
  return (
    <section className="border-t border-bu-border pt-8">
      <h2 className={s.sectionTitle}>Portföyü Paylaşan</h2>
      <div className={cn(s.card, "mt-4 flex items-start gap-4 p-5")}>
        {agent.avatar_url ? (
          <img
            src={agent.avatar_url}
            alt={agent.full_name}
            className="size-14 shrink-0 rounded-full border-2 border-bu-gold/30 object-cover"
          />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-bu-gold/30 bg-bu-card-raised text-xl font-semibold text-bu-gold">
            {agent.full_name.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-bu-text">{agent.full_name}</span>
            <span className={s.verified}>
              <ShieldCheck className="size-3" /> Doğrulanmış
            </span>
          </div>
          {(agent.title || agent.company_name) && (
            <p className="mt-0.5 text-sm text-bu-text-2">
              {[agent.title, agent.company_name].filter(Boolean).join(" · ")}
            </p>
          )}
          {expertise.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {expertise.slice(0, 4).map((e) => (
                <span
                  key={e}
                  className="rounded-bu-full bg-bu-gold-muted px-2 py-0.5 text-[11px] font-medium text-bu-gold"
                >
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link
          to="/v/$username"
          params={{ username: agent.username }}
          className="shrink-0 text-xs text-bu-action transition-colors hover:text-bu-action-hover"
        >
          Profili Gör →
        </Link>
      </div>
      <div className="mt-3 flex gap-3">
        {agent.contact_phone && (
          <a
            href={`tel:${agent.contact_phone}`}
            className={cn(s.btnSecondary, "flex-1 justify-center")}
          >
            <Phone className="size-4" /> Ara
          </a>
        )}
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            className={cn(s.btnGold, "flex-1 justify-center")}
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}
