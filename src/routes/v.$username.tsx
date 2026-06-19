import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Loader2,
  FolderLock,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MembershipBadge } from "@/components/vault/badges";
import { PortfolioTeaserCard, type TeaserCardData } from "@/components/portfolio/teaser-card";
import { cn } from "@/lib/utils";
import { s } from "@/lib/styles";
import {
  getPublicProfile,
  getPublicAgentPortfolios,
  publicTeaserImageUrl,
  publicTeaserThumbUrl,
  type PublicProfile,
  type PublicAgentPortfolioCard,
} from "@/lib/data/public-portfolio";

export const Route = createFileRoute("/v/$username")({
  head: () => ({
    meta: [
      { title: "Profesyonel — Bölgenin Uzmanı" },
      { property: "og:title", content: "Bölgenin Uzmanı — Doğrulanmış Emlak Profesyoneli" },
      { property: "og:type", content: "profile" },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { username } = Route.useParams();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [portfolios, setPortfolios] = useState<PublicAgentPortfolioCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"portfolios" | "about">("portfolios");

  useEffect(() => {
    let active = true;
    Promise.all([getPublicProfile(username), getPublicAgentPortfolios(username).catch(() => [])])
      .then(([profile, ports]) => {
        if (!active) return;
        setData(profile);
        setPortfolios(ports);
        setLoading(false);
        if (profile) document.title = `${profile.full_name} — Bölgenin Uzmanı`;
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [username]);

  const wa = data?.contact_whatsapp?.replace(/\D/g, "");
  const cards: TeaserCardData[] = portfolios.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    currency: p.currency,
    transaction_type: p.transaction_type,
    category: p.category,
    mode: p.mode,
    ref_no: p.ref_no,
    city: p.city,
    district: p.district,
    neighborhood: p.neighborhood,
    coverThumb: p.cover_path ? publicTeaserThumbUrl(p.cover_path) : null,
    coverFull: p.cover_path ? publicTeaserImageUrl(p.cover_path) : null,
  }));

  return (
    <div className="min-h-screen bg-bu-bg">
      <header className="sticky top-0 z-30 border-b border-bu-border bg-bu-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 lg:px-8">
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

      <main className="mx-auto max-w-[1100px] px-4 pb-12 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-bu-gold" />
          </div>
        ) : !data ? (
          <div className={cn(s.card, "mt-8 px-6 py-20 text-center")}>
            <p className="text-sm text-bu-text-2">Profesyonel bulunamadı.</p>
            <Button asChild variant="outline" className="mt-4 gap-1.5">
              <Link to="/">
                <ArrowLeft className="size-4" /> Ana sayfa
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Banner — gold-washed gradient empty-state (premium in both themes) */}
            <div className="relative mt-6 h-40 overflow-hidden rounded-bu-xl bg-gradient-surface ring-1 ring-bu-border">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-bu-gold/[0.04] to-bu-gold/10" />
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-bu-gold/0 via-bu-gold to-bu-gold/0" />
            </div>

            {/* Identity — avatar overlaps banner; name sits BELOW (no overlap) */}
            <div className="px-2 sm:px-6">
              <div className="-mt-14">
                {data.avatar_url ? (
                  <img
                    src={data.avatar_url}
                    alt={data.full_name}
                    className="size-28 rounded-bu-xl bg-bu-card-raised object-cover shadow-bu-raised ring-4 ring-bu-bg"
                  />
                ) : (
                  <span className="flex size-28 items-center justify-center rounded-bu-xl bg-bu-card-raised text-4xl font-bold text-bu-gold shadow-bu-raised ring-4 ring-bu-bg">
                    {data.full_name.slice(0, 1)}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-bold text-bu-text">{data.full_name}</h1>
                  <span className={s.verified}>
                    <ShieldCheck className="size-3" /> Doğrulanmış
                  </span>
                  <MembershipBadge tier={data.membership_tier} />
                </div>
                <p className="mt-1 text-sm text-bu-text-2">
                  {[data.title, data.company_name].filter(Boolean).join(" · ") || "Emlak Uzmanı"}
                </p>
                {data.location && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-bu-gold">
                    <MapPin className="size-3.5" /> {data.location}
                  </p>
                )}
              </div>

              {/* Stat cards */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
                <StatCard icon={FolderLock} value={portfolios.length} label="Aktif Portföy" />
                <StatCard
                  icon={Compass}
                  value={data.expertise_regions.length}
                  label="Uzmanlık Bölgesi"
                />
              </div>
            </div>

            {/* Body: tabs + contact rail */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
              <div className="min-w-0">
                <div className="flex gap-1 border-b border-bu-border">
                  <TabBtn active={tab === "portfolios"} onClick={() => setTab("portfolios")}>
                    Portföyleri
                  </TabBtn>
                  <TabBtn active={tab === "about"} onClick={() => setTab("about")}>
                    Hakkında
                  </TabBtn>
                </div>

                {tab === "portfolios" ? (
                  <div className="mt-6">
                    {cards.length === 0 ? (
                      <div className="rounded-bu-lg border border-dashed border-bu-border bg-bu-card/50 px-6 py-16 text-center text-sm text-bu-text-2">
                        Şu an yayında portföy yok.
                      </div>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2">
                        {cards.map((p) => (
                          <PortfolioTeaserCard key={p.id} p={p} context="public" />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {data.bio ? (
                      <p className="leading-relaxed text-bu-text-2">{data.bio}</p>
                    ) : (
                      <p className="text-sm text-bu-text-3">Henüz bir biyografi eklenmemiş.</p>
                    )}
                    {(data.expertise_regions.length > 0 || data.expertise_types.length > 0) && (
                      <div>
                        <h3 className={s.sectionTitle}>Uzmanlık</h3>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {[...data.expertise_regions, ...data.expertise_types].map((x) => (
                            <span key={x} className={s.chipGold}>
                              {x}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contact rail */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className={cn(s.card, "space-y-3 p-5")}>
                  <h2 className="text-sm font-semibold text-bu-text">İletişim Bilgileri</h2>
                  {wa && (
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(s.btnGold, "w-full justify-center")}
                    >
                      <MessageCircle className="size-4" /> WhatsApp
                    </a>
                  )}
                  {data.contact_phone && (
                    <a
                      href={`tel:${data.contact_phone}`}
                      className={cn(s.btnSecondary, "w-full justify-center")}
                    >
                      <Phone className="size-4" /> {data.contact_phone}
                    </a>
                  )}
                  {data.contact_email && (
                    <a
                      href={`mailto:${data.contact_email}`}
                      className={cn(s.btnSecondary, "w-full justify-center")}
                    >
                      <Mail className="size-4" /> E-posta
                    </a>
                  )}
                  {!wa && !data.contact_phone && !data.contact_email && (
                    <p className="text-xs text-bu-text-2">İletişim bilgisi paylaşılmamış.</p>
                  )}
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof FolderLock;
  value: number;
  label: string;
}) {
  return (
    <div className={cn(s.card, "p-4")}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-bu-text-2">{label}</span>
        <Icon className="size-4 text-bu-gold" />
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-bu-text">{value}</div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-bu-gold text-bu-text"
          : "border-transparent text-bu-text-2 hover:text-bu-text",
      )}
    >
      {children}
    </button>
  );
}
