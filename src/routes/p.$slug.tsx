import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft, Phone, MessageCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { s } from "@/lib/styles";
import {
  getPublicPortfolio,
  publicTeaserImageUrl,
  publicTeaserThumbUrl,
  type PublicPortfolio,
} from "@/lib/data/public-portfolio";
import { formatPortfolioPrice, CATEGORY_LABELS, documentKindLabel } from "@/lib/portfolio-labels";
import { publicUrl } from "@/lib/public-origin";
import { LockedRevealList } from "@/components/portfolio/portfolio-badges";
import {
  DetailGallery,
  DetailHeader,
  QuickInfoStrip,
  AttributesSection,
  ApproxLocationBox,
  AgentPanelCard,
  type DetailImage,
  type DetailAgent,
} from "@/components/portfolio/detail-parts";

export const Route = createFileRoute("/p/$slug")({
  // SSR loader → dynamic OG. Teaser-only (get_public_portfolio allow-list); exact/malik/
  // private never reach here. Single fetch (component reads useLoaderData, no useEffect).
  loader: async ({ params }) => ({ data: await getPublicPortfolio(params.slug).catch(() => null) }),
  head: ({ loaderData }) => {
    const d = loaderData?.data;
    if (!d) return { meta: [{ title: "Portföy — Bölgenin Uzmanı" }] };
    const coverPath = d.images.find((i) => i.is_cover)?.path ?? d.images[0]?.path;
    const image = coverPath ? publicTeaserImageUrl(coverPath) : undefined;
    const region = [d.district, d.city].filter(Boolean).join(", ");
    const description = [
      formatPortfolioPrice(d.price, d.currency),
      region,
      CATEGORY_LABELS[d.category],
    ]
      .filter(Boolean)
      .join(" · ");
    const url = publicUrl(`/p/${d.slug}`);
    return {
      meta: [
        { title: `${d.title} — Bölgenin Uzmanı` },
        { property: "og:title", content: d.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: d.title },
        { name: "twitter:description", content: description },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
      ],
    };
  },
  component: PublicPortfolioPage,
});

function PublicPortfolioPage() {
  const { user } = useAuth();
  const { data } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-bu-bg">
      <header className="sticky top-0 z-30 border-b border-bu-border bg-bu-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-bu-md bg-gradient-gold text-bu-text-inv">
              <ShieldCheck className="size-5" />
            </span>
            <span className="font-display text-base font-bold uppercase tracking-tight text-bu-text sm:text-xl sm:tracking-[0.18em]">
              Bölgenin Uzmanı
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* session-aware (post-mount): logged-in agents get a panel link, not a
                misleading "Üye Girişi" that loops them back to the dashboard. */}
            <Button asChild className="bg-gradient-gold text-bu-text-inv hover:opacity-90">
              {user ? <Link to="/dashboard">Panele Dön</Link> : <Link to="/login">Üye Girişi</Link>}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
        {!data ? (
          <div className={cn(s.card, "px-6 py-20 text-center")}>
            <p className="text-sm text-bu-text-2">Portföy bulunamadı veya yayında değil.</p>
            <Button asChild variant="outline" className="mt-4 gap-1.5">
              <Link to="/">
                <ArrowLeft className="size-4" /> Ana sayfa
              </Link>
            </Button>
          </div>
        ) : (
          <Teaser data={data} />
        )}
      </main>
    </div>
  );
}

function Teaser({ data }: { data: PublicPortfolio }) {
  const { user } = useAuth();
  const callOnly = data.mode === "call_only";
  const images: DetailImage[] = data.images.map((i) => ({
    url: publicTeaserImageUrl(i.path),
    thumbUrl: publicTeaserThumbUrl(i.path),
  }));
  const agent: DetailAgent | null = data.agent;
  const wa = data.agent?.contact_whatsapp?.replace(/\D/g, "");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
      {/* Main column */}
      <div className="min-w-0 space-y-10">
        <DetailGallery images={images} title={data.title} category={data.category} />
        <DetailHeader
          title={data.title}
          refNo={data.ref_no}
          mode={data.mode}
          category={data.category}
          subcategory={data.subcategory}
          transactionType={data.transaction_type}
          neighborhood={data.neighborhood}
          district={data.district}
          city={data.city}
          price={data.price}
          currency={data.currency}
        />
        <div className="border-t border-bu-border pt-6">
          <QuickInfoStrip
            roomCount={data.room_count}
            grossM2={data.gross_m2}
            netM2={data.net_m2}
            landM2={data.land_m2}
            attributes={data.attributes}
          />
        </div>
        {data.public_description && (
          <section className="border-t border-bu-border pt-8">
            <h2 className={s.sectionTitle}>Açıklama</h2>
            <p className="mt-3 leading-relaxed text-bu-text-2">{data.public_description}</p>
          </section>
        )}
        <AttributesSection
          category={data.category}
          features={data.features}
          attributes={data.attributes}
        />
        <ApproxLocationBox
          neighborhood={data.neighborhood}
          district={data.district}
          city={data.city}
          slug={data.slug}
          approxLat={data.approx_lat}
          approxLng={data.approx_lng}
        />
      </div>

      {/* Right sticky panel */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className={cn(s.card, s.cardPadding)}>
          <p className="text-xs uppercase tracking-wider text-bu-text-2">Fiyat</p>
          <p className="mt-1 font-display text-3xl font-bold text-bu-gold">
            {formatPortfolioPrice(data.price, data.currency)}
          </p>
        </div>

        {callOnly ? (
          // call_only = normal info card (NOT the dark lock panel) — light-friendly.
          <div className={cn(s.card, "space-y-3 p-6 text-center")}>
            <Phone className="mx-auto size-6 text-bu-gold" />
            <p className="text-sm font-semibold text-bu-text">Kapalı Portföy</p>
            <p className="text-xs text-bu-text-2">
              Bu portföyün detayları paylaşılmıyor. Tüm bilgiler için emlakçıyı arayın.
            </p>
            {data.agent?.contact_phone && (
              <a
                href={`tel:${data.agent.contact_phone}`}
                className={cn(s.btnGold, "w-full justify-center")}
              >
                <Phone className="size-4" /> {data.agent.contact_phone}
              </a>
            )}
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className={cn(s.btnSecondary, "w-full justify-center")}
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            )}
          </div>
        ) : (
          // controlled: gold-accented lock panel (theme-adaptive → readable in both modes).
          <div className="overflow-hidden rounded-bu-xl border border-bu-gold-border bg-bu-bg-subtle shadow-bu-lock">
            <div className="h-0.5 bg-gradient-to-r from-bu-gold/0 via-bu-gold to-bu-gold/0" />
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-bu-md border border-bu-gold-border bg-bu-gold-muted">
                  <Lock className="size-4 text-bu-gold" />
                </span>
                <h3 className="text-sm font-semibold text-bu-text">Kilitli Bilgiler</h3>
              </div>
              <LockedRevealList photoCount={data.locked_photo_count} />
              {/* 2.4: belge TİPİ teaser'da görünür ("Kilitli: Kat Planı"); içerik talep+onayla açılır. */}
              {data.locked_document_kinds && data.locked_document_kinds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.locked_document_kinds.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 rounded-bu-md border border-bu-gold-border bg-bu-gold-muted px-2 py-1 text-xs font-medium text-bu-gold"
                    >
                      <Lock className="size-3" /> Kilitli: {documentKindLabel(k)}
                    </span>
                  ))}
                </div>
              )}
              {/* logged-in → in-app detail where the Detay Talebi flow works; anon → login */}
              <Button asChild className="w-full bg-gradient-gold text-bu-text-inv hover:opacity-90">
                {user ? (
                  <Link to="/dashboard/portfolios/$id" params={{ id: data.id }}>
                    Detay Talebi (Panelde)
                  </Link>
                ) : (
                  <Link to="/login">Detay Talebi için Üye Girişi</Link>
                )}
              </Button>
            </div>
          </div>
        )}

        {agent && (
          <AgentPanelCard
            agent={agent}
            refNo={data.ref_no}
            neighborhood={data.neighborhood}
            district={data.district}
            city={data.city}
          />
        )}
      </aside>
    </div>
  );
}
