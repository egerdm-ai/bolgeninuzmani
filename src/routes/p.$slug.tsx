import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Lock,
  ImageOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageLightbox } from "@/components/portfolio/image-lightbox";
import {
  getPublicPortfolio,
  publicTeaserImageUrl,
  publicTeaserThumbUrl,
  type PublicPortfolio,
} from "@/lib/data/public-portfolio";
import { ThumbImage } from "@/components/portfolio/thumb-image";
import { ClosedModeBadge, RefNoText } from "@/components/portfolio/portfolio-badges";
import { CATEGORY_LABELS, TRANSACTION_LABELS, formatPortfolioPrice } from "@/lib/portfolio-labels";
import { attributeDef } from "@/lib/portfolio-attributes";

export const Route = createFileRoute("/p/$slug")({
  // Static brand OG; the dynamic title is set client-side (data comes from the
  // anon RPC). Dynamic OG via an SSR loader is a follow-up.
  head: () => ({
    meta: [
      { title: "Portföy — Bölgenin Uzmanı" },
      { property: "og:title", content: "Bölgenin Uzmanı — Özel Portföy" },
      {
        property: "og:description",
        content: "Doğrulanmış emlak profesyonelinin özel portföyü.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PublicPortfolioPage,
});

function PublicPortfolioPage() {
  const { slug } = Route.useParams();
  const [data, setData] = useState<PublicPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getPublicPortfolio(slug)
      .then((d) => {
        if (!active) return;
        setData(d);
        setLoading(false);
        if (d) document.title = `${d.title} — Bölgenin Uzmanı`;
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 lg:px-7">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span className="font-display text-base font-bold uppercase tracking-tight text-foreground sm:text-xl sm:tracking-[0.18em]">
              Bölgenin Uzmanı
            </span>
          </Link>
          <Button asChild className="bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Link to="/login">Üye Girişi</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-6 lg:px-7">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        ) : !data ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-20 text-center">
            <p className="text-sm text-muted-foreground">Portföy bulunamadı veya yayında değil.</p>
            <Button asChild variant="outline" className="mt-4 gap-1.5">
              <Link to="/">
                <ArrowLeft className="size-4" /> Ana sayfa
              </Link>
            </Button>
          </div>
        ) : (
          <Teaser data={data} onOpenImage={setLightbox} />
        )}
      </main>

      {data && lightbox !== null && (
        <ImageLightbox
          images={data.images.map((i) => publicTeaserImageUrl(i.path))}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function Teaser({
  data,
  onOpenImage,
}: {
  data: PublicPortfolio;
  onOpenImage: (i: number) => void;
}) {
  const cover = data.images.find((i) => i.is_cover) ?? data.images[0];
  const coverIdx = Math.max(
    0,
    data.images.findIndex((i) => i.is_cover),
  );
  const wa = data.agent?.contact_whatsapp?.replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Merhaba, "${data.title}" portföyü hakkında bilgi almak istiyorum.`,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* Gallery (PUBLIC images only) */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
          <div className="relative aspect-[16/9]">
            {cover ? (
              <img
                src={publicTeaserImageUrl(cover.path)}
                alt={data.title}
                loading="lazy"
                decoding="async"
                onClick={() => onOpenImage(coverIdx)}
                className="size-full cursor-zoom-in object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <ImageOff className="size-8" />
              </div>
            )}
          </div>
          {data.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-2">
              {data.images.map((img, idx) => (
                <ThumbImage
                  key={img.path}
                  thumb={publicTeaserThumbUrl(img.path)}
                  full={publicTeaserImageUrl(img.path)}
                  onClick={() => onOpenImage(idx)}
                  className="h-16 w-24 shrink-0 cursor-zoom-in rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{CATEGORY_LABELS[data.category]}</span>
            {data.subcategory && (
              <>
                <span>·</span>
                <span>{data.subcategory}</span>
              </>
            )}
            <span>·</span>
            <span>{TRANSACTION_LABELS[data.transaction_type]}</span>
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            {data.title}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <RefNoText value={data.ref_no} />
            <ClosedModeBadge mode={data.mode} />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 text-gold" />~
            {[data.neighborhood, data.district, data.city].filter(Boolean).join(", ") ||
              "Konum belirtilmemiş"}
          </p>
          <p className="mt-3 font-display text-2xl font-semibold text-gold">
            {formatPortfolioPrice(data.price, data.currency)}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-secondary-foreground">
            {data.room_count && <Fact label="Oda" value={data.room_count} />}
            {data.gross_m2 != null && <Fact label="Brüt" value={`${data.gross_m2} m²`} />}
            {data.net_m2 != null && <Fact label="Net" value={`${data.net_m2} m²`} />}
            {data.land_m2 != null && <Fact label="Arsa" value={`${data.land_m2} m²`} />}
          </div>

          {data.features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.features.map((f) => (
                <span
                  key={f}
                  className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          <PublicAttrList data={data.attributes} />

          {data.public_description && (
            <p className="mt-4 text-sm leading-relaxed text-secondary-foreground">
              {data.public_description}
            </p>
          )}
        </div>
      </div>

      {/* Right rail — agent contact + locked teaser CTA */}
      <div className="space-y-5">
        {data.agent && (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              {data.agent.avatar_url ? (
                <img
                  src={data.agent.avatar_url}
                  alt=""
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 font-semibold text-gold">
                  {data.agent.full_name.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{data.agent.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[data.agent.title, data.agent.company_name].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {wa && (
                <Button
                  asChild
                  className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
                >
                  <a href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" /> WhatsApp ile İletişim
                  </a>
                </Button>
              )}
              {data.agent.contact_phone && (
                <Button asChild variant="outline" className="w-full gap-1.5">
                  <a href={`tel:${data.agent.contact_phone}`}>
                    <Phone className="size-4" /> {data.agent.contact_phone}
                  </a>
                </Button>
              )}
              {data.agent.contact_email && (
                <Button asChild variant="outline" className="w-full gap-1.5">
                  <a href={`mailto:${data.agent.contact_email}`}>
                    <Mail className="size-4" /> E-posta
                  </a>
                </Button>
              )}
            </div>
            <Link
              to="/v/$username"
              params={{ username: data.agent.username }}
              className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-gold hover:underline"
            >
              Uzmanın tüm portföyleri →
            </Link>
          </div>
        )}

        {/* Locked details → member-only (D5/D22). No values shown. */}
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-5 text-center">
          <Lock className="mx-auto size-6 text-gold" />
          <p className="mt-2 text-sm font-semibold text-foreground">Tam detaylar üyelere özel</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tam adres, tapu/belgeler ve özel bilgiler için doğrulanmış üye girişi gerekir.
          </p>
          <Button
            asChild
            className="mt-3 w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <Link to="/login">Detay Talebi için Giriş Yap</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-surface-2 px-2.5 py-1">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

function PublicAttrList({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data ?? {}).filter(
    ([k]) => attributeDef(k)?.visibility === "public",
  );
  if (entries.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {entries.map(([k, v]) => {
        const def = attributeDef(k)!;
        const val =
          def.type === "boolean"
            ? v
              ? "Evet"
              : "Hayır"
            : def.type === "select"
              ? (def.options?.find((o) => o.value === v)?.label ?? String(v))
              : String(v);
        return (
          <span
            key={k}
            className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {def.label}: {val}
          </span>
        );
      })}
    </div>
  );
}
