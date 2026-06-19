import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, ArrowLeft, Phone, MessageCircle, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { s } from "@/lib/styles";
import {
  getPublicPortfolio,
  publicTeaserImageUrl,
  publicTeaserThumbUrl,
  type PublicPortfolio,
} from "@/lib/data/public-portfolio";
import { formatPortfolioPrice } from "@/lib/portfolio-labels";
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
  head: () => ({
    meta: [
      { title: "Portföy — Bölgenin Uzmanı" },
      { property: "og:title", content: "Bölgenin Uzmanı — Özel Portföy" },
      { property: "og:description", content: "Doğrulanmış emlak profesyonelinin özel portföyü." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PublicPortfolioPage,
});

function PublicPortfolioPage() {
  const { slug } = Route.useParams();
  const [data, setData] = useState<PublicPortfolio | null>(null);
  const [loading, setLoading] = useState(true);

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
            <Button asChild className="bg-gradient-gold text-bu-text-inv hover:opacity-90">
              <Link to="/login">Üye Girişi</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-bu-gold" />
          </div>
        ) : !data ? (
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
        <DetailGallery images={images} title={data.title} />
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
              <Button asChild className="w-full bg-gradient-gold text-bu-text-inv hover:opacity-90">
                <Link to="/login">Detay Talebi için Üye Girişi</Link>
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
