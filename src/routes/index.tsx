import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Sparkles,
  MapPin,
  Lock,
  Share2,
  ArrowRight,
  Search,
  MessageCircle,
  FileText,
  Bot,
  Check,
  Crown,
  UserCheck,
  Bookmark,
  Layers,
  KeyRound,
  Folder,
  AlertTriangle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyImages } from "@/lib/mock/data";
import mapDark from "@/assets/map-dark.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VAULT — Profesyoneller için Private Luxury Real Estate Network" },
      {
        name: "description",
        content:
          "VAULT, doğrulanmış emlak profesyonellerinin gizli portföylerini AI ile oluşturduğu, haritada keşfettiği ve yalnızca onaylı taleplerle paylaştığı private real estate network'tür.",
      },
      { property: "og:title", content: "VAULT — Private Luxury Real Estate Network" },
      {
        property: "og:description",
        content:
          "Kapalı luxury portföylerinizi doğru profesyonellerle paylaşın. Davetli ve doğrulanmış profesyoneller için.",
      },
    ],
  }),
  component: Landing,
});

const navLinks = [
  { label: "Nasıl Çalışır", href: "#nasil-calisir" },
  { label: "AI Concierge", href: "#concierge" },
  { label: "Özellikler", href: "#ozellikler" },
  { label: "Üyelik", href: "#uyelik" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackgroundGlow />
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeaturesSection />
      <ConciergeSection />
      <MembershipSection />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chrome                                                              */
/* ------------------------------------------------------------------ */

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px]" />
      <div className="absolute top-1/3 -right-40 size-[32rem] rounded-full bg-gold/[0.06] blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.18_0.02_254/0.6),transparent_60%)]" />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground shadow-gold">
        <ShieldCheck className="size-5" />
      </span>
      <span className="font-display text-2xl font-bold uppercase tracking-[0.28em] text-foreground">
        Vault
      </span>
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-6">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden text-secondary-foreground sm:inline-flex">
            <Link to="/dashboard">Giriş Yap</Link>
          </Button>
          <Button asChild className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Link to="/dashboard">
              Üyelik Başvurusu Yap <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative z-10">
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:pb-28 lg:pt-24">
        {/* Left — value prop */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            <Sparkles className="size-3.5" /> Davetli ve doğrulanmış profesyoneller için
          </span>
          <h1 className="mt-6 font-display text-[2.75rem] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Kapalı luxury portföylerinizi{" "}
            <span className="text-gold">doğru profesyonellerle</span> paylaşın.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            VAULT, emlak profesyonellerinin gizli portföylerini AI ile oluşturduğu, haritada
            keşfettiği ve detaylarını yalnızca onaylı taleplerle paylaştığı private real estate
            network'tür.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Link to="/dashboard">
                Üyelik Başvurusu Yap <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border-strong bg-surface/50 text-foreground hover:bg-surface"
            >
              <Link to="/dashboard/search">Portföyleri Keşfet</Link>
            </Button>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border/60 pt-7">
            {[
              { v: "%100", l: "Doğrulanmış üye" },
              { v: "Kontrollü", l: "Detay erişimi" },
              { v: "AI", l: "Portföy & Concierge" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-2xl font-semibold text-foreground">{s.v}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right — layered product mockup */}
        <HeroMockup />
      </div>
    </section>
  );
}

function GlassCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-border-strong bg-surface/80 shadow-elegant backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function HeroMockup() {
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
        <div className="relative h-[300px]">
          <img src={mapDark} alt="Harita" className="size-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent" />
          {/* search field */}
          <div className="absolute inset-x-4 top-4 flex items-center gap-2 rounded-xl border border-border-strong bg-background/80 px-3 py-2 backdrop-blur-md">
            <Search className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Bodrum · Villa · Deniz manzaralı</span>
          </div>
          {/* price pins */}
          <MapPin2 className="left-[22%] top-[42%]" label="₺145M" />
          <MapPin2 className="left-[52%] top-[30%]" label="₺92M" active />
          <MapPin2 className="left-[70%] top-[58%]" label="₺210M" />
          <MapPin2 className="left-[38%] top-[68%]" label="₺64M" />
        </div>
      </GlassCard>

      {/* Floating — locked portfolio detail */}
      <GlassCard className="absolute -left-6 top-32 hidden w-[230px] overflow-hidden sm:block">
        <div className="relative h-24">
          <img src={propertyImages.villa1} alt="Portföy" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md border border-gold/30 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-gold backdrop-blur">
            <Lock className="size-3" /> Kilitli
          </span>
        </div>
        <div className="space-y-2 p-3">
          <p className="font-display text-base font-semibold leading-tight text-foreground">
            Yalıkavak Deniz Villa
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Tam adres</span>
              <span className="inline-flex items-center gap-1 text-gold/80">
                <Lock className="size-3" /> Gizli
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Tapu & belgeler</span>
              <span className="inline-flex items-center gap-1 text-gold/80">
                <Lock className="size-3" /> Gizli
              </span>
            </div>
          </div>
          <button className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-gold py-1.5 text-[11px] font-semibold text-primary-foreground">
            <KeyRound className="size-3" /> Detay Talebi Gönder
          </button>
        </div>
      </GlassCard>

      {/* Floating — AI Concierge mini chat */}
      <GlassCard className="absolute -right-4 top-6 hidden w-[238px] p-3 md:block">
        <div className="flex items-center gap-2 border-b border-border/60 pb-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-gold/15 text-gold">
            <Bot className="size-3.5" />
          </span>
          <span className="text-xs font-medium text-foreground">AI Concierge</span>
        </div>
        <div className="mt-2.5 space-y-2">
          <p className="ml-auto w-fit max-w-[80%] rounded-lg rounded-br-sm bg-gold/15 px-2.5 py-1.5 text-[10.5px] text-foreground">
            Bodrum'da havuzlu 5+1 villa
          </p>
          <p className="w-fit max-w-[88%] rounded-lg rounded-bl-sm bg-surface-2 px-2.5 py-1.5 text-[10.5px] text-muted-foreground">
            4 eşleşen portföy ve 2 uzman profesyonel buldum.
          </p>
        </div>
      </GlassCard>

      {/* Floating — WhatsApp / PDF share preview */}
      <GlassCard className="absolute -bottom-8 right-6 hidden w-[250px] p-3 lg:block">
        <div className="flex items-center gap-2 border-b border-border/60 pb-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-gold/15 text-gold">
            <Share2 className="size-3.5" />
          </span>
          <span className="text-xs font-medium text-foreground">Share Studio</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-border/60 bg-surface-2/60 p-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-success/15 text-success">
            <MessageCircle className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-foreground">WhatsApp mesajı hazır</p>
            <p className="truncate text-[10px] text-muted-foreground">vault.app/p/yalikavak-villa</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-surface-2/60 p-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-info/15 text-info">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-foreground">Profesyonel PDF</p>
            <p className="truncate text-[10px] text-muted-foreground">Marka kapaklı · 6 sayfa</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function MapPin2({
  className = "",
  label,
  active = false,
}: {
  className?: string;
  label: string;
  active?: boolean;
}) {
  return (
    <span
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur ${
        active
          ? "border-gold bg-gradient-gold text-primary-foreground shadow-gold"
          : "border-border-strong bg-background/85 text-foreground"
      } ${className}`}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section primitives                                                  */
/* ------------------------------------------------------------------ */

function SectionHeader({
  eyebrow,
  title,
  desc,
  className = "",
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {desc && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{desc}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Problem                                                             */
/* ------------------------------------------------------------------ */

const problems = [
  { icon: Folder, title: "Portföyler kayboluyor", desc: "Yüzlerce mesaj arasında değerli portföyler akışta kayboluyor." },
  { icon: AlertTriangle, title: "Gizli bilgiler kontrolsüz yayılıyor", desc: "Adres, tapu ve fiyat bilgileri istenmeyen kişilere ulaşıyor." },
  { icon: UserCheck, title: "Doğru alıcıya ulaşmak zor", desc: "Portföyünüzü gerçekten ilgilenen profesyonele iletmek zaman alıyor." },
  { icon: Layers, title: "PDF, fotoğraf ve bilgiler dağınık", desc: "Materyaller farklı yerlerde duruyor, tutarlı bir sunum yok." },
];

function ProblemSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <SectionHeader
        eyebrow="Problem"
        title="WhatsApp gruplarındaki dağınık portföy akışını profesyonel network'e taşıyın."
        desc="Lüks gayrimenkul, dağınık sohbet gruplarına değil; kontrollü, doğrulanmış ve profesyonel bir ağa ait."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant transition-colors hover:border-border-strong"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive/80">
              <p.icon className="size-5" />
            </span>
            <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

const steps = [
  { icon: Sparkles, title: "AI ile portföy oluştur", desc: "Metin, PDF veya WhatsApp içeriğini yapılandırılmış portföye dönüştürün." },
  { icon: Lock, title: "Gizlilik seviyesini seç", desc: "Hangi bilgilerin herkese açık, hangilerinin kilitli kalacağını siz belirleyin." },
  { icon: MapPin, title: "Haritada ve listede keşfedil", desc: "Portföyünüz doğrulanmış profesyonellere harita ve liste üzerinde görünür." },
  { icon: KeyRound, title: "Detay taleplerini onayla", desc: "Kilitli detaylara erişim için gelen talepleri tek tek onaylayın." },
  { icon: Share2, title: "WhatsApp link/PDF ile paylaş", desc: "Markalı link ve profesyonel PDF ile portföyünüzü güvenle iletin." },
];

function HowItWorks() {
  return (
    <section id="nasil-calisir" className="relative z-10 border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-[1320px] px-6 py-20">
        <SectionHeader eyebrow="Nasıl Çalışır" title="Portföyden onaylı paylaşıma, beş adımda." />
        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-2xl border border-border bg-background/60 p-5 shadow-elegant"
            >
              <span className="font-display text-sm font-semibold text-gold/60">
                0{i + 1}
              </span>
              <span className="mt-3 flex size-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

const featureList = [
  { icon: Sparkles, title: "AI Portföy Oluşturucu", desc: "Dağınık içeriği saniyeler içinde yapılandırılmış, premium portföy taslağına çevirin." },
  { icon: MapPin, title: "Map-first Portföy Arama", desc: "Lüks portföyleri harita üzerinde keşfedin, fiyat ve bölgeye göre filtreleyin." },
  { icon: KeyRound, title: "Request Access", desc: "Kilitli detaylar için gelen detay taleplerini onaylayın veya reddedin." },
  { icon: Share2, title: "Share Studio", desc: "WhatsApp mesajı, markalı link ve profesyonel PDF tek bir yerden." },
  { icon: UserCheck, title: "Profesyonel Profil", desc: "Doğrulanmış kimlik, uzmanlık bölgeleri ve yanıt performansınız bir arada." },
  { icon: Bookmark, title: "Saved Searches", desc: "Kriterlerinizi kaydedin, uygun portföy eklendiğinde haberdar olun." },
];

function FeaturesSection() {
  return (
    <section id="ozellikler" className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <SectionHeader
        eyebrow="Özellikler"
        title="Bir portföy ağı için tasarlanmış, eksiksiz profesyonel araç seti."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featureList.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant transition-colors hover:border-gold/30"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* AI Concierge                                                        */
/* ------------------------------------------------------------------ */

function ConciergeSection() {
  return (
    <section id="concierge" className="relative z-10 border-y border-border/60 bg-surface/30">
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow="AI Concierge"
            title="Doğal dilde sorun, eşleşen portföyleri ve uzmanları bulalım."
            desc="AI Concierge talebinizi anlar; kriterlere uyan gizli portföyleri ve o bölgede uzman profesyonelleri tek bir yanıtta önünüze getirir."
          />
          <ul className="mt-8 space-y-3">
            {["Bölge, tip ve özelliklere göre akıllı eşleştirme", "İlgili uzman profesyonel önerileri", "Tek tıkla detay talebi başlatma"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Check className="size-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat mock */}
        <GlassCard className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Bot className="size-4" />
            </span>
            <span className="text-sm font-medium text-foreground">VAULT Concierge</span>
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-success">
              <span className="size-1.5 rounded-full bg-success" /> Çevrimiçi
            </span>
          </div>
          <div className="space-y-4 p-5">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-gold/15 px-4 py-2.5 text-sm text-foreground">
              Bodrum'da deniz manzaralı, 5+1, havuzlu villa arıyorum.
            </p>
            <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
              Kriterlerinize uyan <span className="font-medium text-foreground">3 portföy</span> ve{" "}
              <span className="font-medium text-foreground">2 uzman profesyonel</span> buldum:
              <div className="mt-3 space-y-2">
                {[
                  { img: propertyImages.villa1, name: "Yalıkavak Deniz Villa", meta: "5+1 · Havuzlu · ₺145M" },
                  { img: propertyImages.villa2, name: "Türkbükü Panorama", meta: "5+1 · Havuzlu · ₺210M" },
                ].map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-2"
                  >
                    <img src={r.img} alt={r.name} className="size-11 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-foreground">{r.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{r.meta}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md border border-gold/30 px-1.5 py-0.5 text-[10px] text-gold">
                      <Lock className="size-2.5" /> Kilitli
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-border/60 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-background/60 px-3 py-2">
              <span className="flex-1 text-sm text-muted-foreground">Bir talep yazın…</span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground">
                <Send className="size-3.5" />
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Membership                                                          */
/* ------------------------------------------------------------------ */

const tiers = [
  {
    name: "Private Beta",
    icon: ShieldCheck,
    price: "Davetli",
    tagline: "Kurucu üye erişimi",
    featured: false,
    features: ["Doğrulanmış profil", "10 aktif portföy", "Harita öncelikli arama", "Temel detay talebi yönetimi"],
    cta: "Başvuru Yap",
  },
  {
    name: "Pro",
    icon: Crown,
    price: "Yakında",
    tagline: "Aktif profesyoneller için",
    featured: true,
    features: ["Sınırsız portföy", "AI Portföy Oluşturucu", "Share Studio (link + PDF)", "Saved Searches & bildirimler", "Öncelikli detay talepleri"],
    cta: "İlgileniyorum",
  },
  {
    name: "Elite",
    icon: Sparkles,
    price: "Yakında",
    tagline: "Üst düzey danışmanlar için",
    featured: false,
    features: ["Pro'daki her şey", "AI Concierge tam erişim", "Markalı profesyonel PDF'ler", "Öne çıkan profil & rozet", "Özel hesap yöneticisi"],
    cta: "İlgileniyorum",
  },
];

function MembershipSection() {
  return (
    <section id="uyelik" className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <SectionHeader
        eyebrow="Üyelik"
        title="Private bir ağ. Yalnızca doğrulanmış profesyoneller."
        desc="VAULT şu anda kurucu üyelere açık. Üyelik başvurunuz onaylandığında uygun planı seçebilirsiniz."
        className="mx-auto text-center"
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative flex flex-col rounded-2xl border p-7 shadow-elegant ${
              t.featured
                ? "border-gold/40 bg-gradient-surface shadow-gold"
                : "border-border bg-surface/60"
            }`}
          >
            {t.featured && (
              <span className="absolute right-5 top-5 rounded-full bg-gradient-gold px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                En popüler
              </span>
            )}
            <span
              className={`flex size-11 items-center justify-center rounded-xl ${
                t.featured ? "bg-gradient-gold text-primary-foreground" : "bg-gold/10 text-gold"
              }`}
            >
              <t.icon className="size-5" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold text-foreground">{t.price}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Check className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={`mt-7 w-full ${
                t.featured
                  ? "bg-gradient-gold text-primary-foreground hover:opacity-90"
                  : "border border-border-strong bg-surface text-foreground hover:bg-surface-2"
              }`}
            >
              <Link to="/dashboard">{t.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="relative z-10 mx-auto max-w-[1320px] px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-surface px-8 py-16 text-center shadow-gold sm:px-16">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[120px]" />
        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            <Sparkles className="size-3.5" /> Kurucu üyelik açık
          </span>
          <h2 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Kurucu üye olarak VAULT ağına katılın.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Gizli portföylerinizi doğru profesyonellerle, kontrollü ve premium bir ağda paylaşmaya
            bugün başvurun.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Link to="/dashboard">
                Üyelik Başvurusu Yap <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border-strong bg-background/40 text-foreground hover:bg-surface"
            >
              <Link to="/dashboard/search">Portföyleri Keşfet</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/60">
      <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Logo />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} VAULT — Private Luxury Real Estate Network. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
