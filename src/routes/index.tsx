import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Sparkles,
  MapPin,
  ArrowRight,
  Bot,
  Check,
  Crown,
  UserCheck,
  Bookmark,
  KeyRound,
  Folder,
  AlertTriangle,
  Layers,
  Users,
  GitMerge,
  Search,
  Share2,
  Bell,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/landing/primitives";
import { LandingHeroProductMockup } from "@/components/landing/hero-mockup";
import { StepProcessShowcase } from "@/components/landing/step-showcase";
import { AIAssistantPreview } from "@/components/landing/ai-assistant-preview";
import { ProfessionalProfilePreview } from "@/components/landing/professional-profile-preview";
import { ShareStudioPreview } from "@/components/landing/share-studio-preview";
import { ApplicationForm } from "@/components/landing/application-form";
import { FaqSection } from "@/components/landing/faq";

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

const APPLY_ID = "basvuru";

function scrollToApply(e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById(APPLY_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const navLinks = [
  { label: "Nasıl Çalışır", href: "#nasil-calisir" },
  { label: "Özellikler", href: "#ozellikler" },
  { label: "VAULT Asistan", href: "#asistan" },
  { label: "Üyelik", href: "#uyelik" },
  { label: "SSS", href: "#sss" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background pb-20 text-foreground lg:pb-0">
      <BackgroundGlow />
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <FeaturesSection />
      <AssistantSection />
      <ProfessionalSection />
      <ShareStudioSection />
      <MembershipSection />
      <ApplicationSection />
      <FaqBlock />
      <Footer />
      <MobileStickyCta />
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
          <Button
            asChild
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <a href={`#${APPLY_ID}`} onClick={scrollToApply}>
              Üyelik Başvurusu Yap <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const heroStats = [
  "500+ Kapalı Portföy",
  "120+ Doğrulanmış Profesyonel",
  "AI Destekli Eşleşme",
  "Kontrollü Detay Talebi",
];

function Hero() {
  return (
    <section className="relative z-10">
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:pb-28 lg:pt-20">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            <Sparkles className="size-3.5" /> Davetli ve doğrulanmış profesyoneller için
          </span>
          <h1 className="mt-6 font-display text-[2.75rem] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Kapalı luxury portföylerinizi{" "}
            <span className="text-gold">doğru profesyonellerle</span> paylaşın.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            VAULT, emlak profesyonellerinin gizli portföylerini AI destekli eşleşmeler, harita
            tabanlı keşif ve onaylı detay talepleriyle yönettiği private real estate network'tür.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <a href={`#${APPLY_ID}`} onClick={scrollToApply}>
                Üyelik Başvurusu Yap <ArrowRight className="size-4" />
              </a>
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
          <div className="mt-12 grid max-w-md grid-cols-2 gap-x-6 gap-y-4 border-t border-border/60 pt-7">
            {heroStats.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 shrink-0 text-gold" />
                {s}
              </div>
            ))}
          </div>
        </div>

        <LandingHeroProductMockup />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Problem                                                             */
/* ------------------------------------------------------------------ */

const problems = [
  {
    icon: Folder,
    title: "Portföyler kayboluyor",
    desc: "Her gün aynı portföyler tekrar paylaşılıyor, doğru portföyü sonra bulmak zorlaşıyor.",
  },
  {
    icon: AlertTriangle,
    title: "Gizli bilgiler kontrolsüz yayılıyor",
    desc: "Tam adres, malik bilgisi, telefon ve PDF'ler yanlış kişilerle paylaşılabiliyor.",
  },
  {
    icon: UserCheck,
    title: "Doğru alıcıya ulaşmak zor",
    desc: "Kim hangi müşterisi için ne arıyor, hangi portföyle eşleşir görmek mümkün olmuyor.",
  },
  {
    icon: Layers,
    title: "PDF, fotoğraf ve bilgiler dağınık",
    desc: "Portföy bilgisi WhatsApp mesajı, fotoğraf, PDF ve notlar arasında parçalanıyor.",
  },
  {
    icon: MapPin,
    title: "Bölge uzmanını bulmak zor",
    desc: "Bir bölgede gerçekten kim aktif, kimde portföy var, kim arayış takip ediyor görünmüyor.",
  },
  {
    icon: GitMerge,
    title: "Eşleşmeler manuel kalıyor",
    desc: "Yeni portföy geldiğinde kimin arayışıyla uyumlu olduğu otomatik anlaşılmıyor.",
  },
];

function ProblemSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <SectionHeader
        eyebrow="Problem"
        title="WhatsApp gruplarındaki dağınık portföy akışını profesyonel network'e taşıyın."
        desc="Kapalı portföyler bugün WhatsApp gruplarında, PDF'lerde ve özel mesajlarda kayboluyor. VAULT bu akışı kontrollü, takip edilebilir ve profesyonel hale getirir."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-destructive/15 bg-destructive/[0.03] p-5 transition-colors hover:border-destructive/30"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive/80">
              <p.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{p.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Solution                                                            */
/* ------------------------------------------------------------------ */

const solutionColumns = [
  {
    icon: Folder,
    title: "Portföy",
    items: ["AI ile oluştur", "Gizlilik seviyesini seç", "Haritada keşfedil", "PDF / link ile paylaş"],
  },
  {
    icon: Search,
    title: "Arayış",
    items: ["Müşteri ihtiyacını kaydet", "Yeni portföylerle eşleş", "Bildirim al", "Detay talebi gönder"],
  },
  {
    icon: Users,
    title: "Bölge Uzmanı",
    items: ["Bölgeye göre profesyonel bul", "Portföylerini incele", "Takip et", "Doğru kişiye ulaş"],
  },
];

function SolutionSection() {
  return (
    <section className="relative z-10 border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-[1320px] px-6 py-20">
        <SectionHeader
          eyebrow="Çözüm"
          title="VAULT, kapalı portföyleri, arayışları ve bölge uzmanlarını aynı ağda birleştirir."
          className="mx-auto text-center"
        />
        <div className="relative mt-14 grid gap-5 lg:grid-cols-3">
          {solutionColumns.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <c.icon className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">{c.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {c.items.map((it) => (
                  <li key={it} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <Check className="size-3" />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* center connector */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/10 px-5 py-2.5 shadow-gold">
            <Sparkles className="size-4 text-gold" />
            <span className="font-display text-sm font-semibold text-foreground">
              AI Eşleşme Motoru
            </span>
            <span className="text-xs text-muted-foreground">
              Portföy ↔ Arayış ↔ Bölge Uzmanı
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  return (
    <section id="nasil-calisir" className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <SectionHeader
        eyebrow="Nasıl Çalışır"
        title="Portföyden onaylı paylaşıma, beş adımda."
      />
      <div className="mt-12">
        <StepProcessShowcase />
      </div>
      <div className="mt-12 flex justify-center">
        <Button
          asChild
          size="lg"
          className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
        >
          <Link to="/dashboard/search">
            VAULT Akışını Gör <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

const featureList = [
  {
    icon: Sparkles,
    title: "AI Portföy Oluşturucu",
    desc: "WhatsApp mesajı, PDF veya metinden portföy taslağı çıkarır; eksik alanları ve veri skorunu gösterir.",
    preview: "Veri skoru %78 · 3 eksik alan",
  },
  {
    icon: MapPin,
    title: "Map-first Portföy Arama",
    desc: "Portföyleri harita üzerinde bölge, fiyat, özellik ve gizlilik durumuna göre keşfedin.",
    preview: "Yalıkavak · 18 portföy",
  },
  {
    icon: Bookmark,
    title: "Arayışlarım",
    desc: "Müşterileriniz için arayış kaydedin; yeni portföy eşleştiğinde bildirim alın.",
    preview: "4 aktif arayış · 2 yeni eşleşme",
  },
  {
    icon: Network,
    title: "Network Arayışları",
    desc: "Diğer profesyonellerin aktif alıcı arayışlarını görün; portföylerinizle eşleşen talepleri bulun.",
    preview: "Portföyünle eşleşen 3 arayış",
  },
  {
    icon: GitMerge,
    title: "Eşleşme Motoru",
    desc: "Portföy, arayış ve bölge uzmanlarını uyum skoru ve açıklamasıyla birleştirir.",
    preview: "%92 Uyum · Neden uyumlu?",
  },
  {
    icon: Users,
    title: "Bölge Uzmanları",
    desc: "Bodrum, Yalıkavak, Bebek, Riva gibi bölgelerde aktif profesyonelleri ve portföy yoğunluğunu görün.",
    preview: "Bebek · 4 uzman · 9 portföy",
  },
  {
    icon: KeyRound,
    title: "Request Access",
    desc: "Tam adres, telefon, PDF ve belgeleri yalnızca onaylı detay talepleri sonrası açın.",
    preview: "Tam adres · Kilitli",
  },
  {
    icon: Share2,
    title: "Share Studio",
    desc: "WhatsApp mesajı, teaser PDF, paylaşım linki ve QR ile portföyünüzü profesyonel sunuma çevirin.",
    preview: "WhatsApp · PDF · Link · QR",
  },
  {
    icon: Bell,
    title: "Bildirimler",
    desc: "Takip ettiğiniz bölgeye yeni portföy geldiğinde veya arayışınız eşleştiğinde haberdar olun.",
    preview: "Bebek arayışına yeni portföy",
  },
];

function FeaturesSection() {
  return (
    <section id="ozellikler" className="relative z-10 border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-[1320px] px-6 py-20">
        <SectionHeader
          eyebrow="Özellikler"
          title="Kapalı portföy ağı için tasarlanmış profesyonel araç seti."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((f) => (
            <div
              key={f.title}
              className="group flex flex-col rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant transition-colors hover:border-gold/30"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1 text-[11px] text-gold">
                <Sparkles className="size-3" /> {f.preview}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* VAULT Asistan                                                       */
/* ------------------------------------------------------------------ */

function AssistantSection() {
  return (
    <section id="asistan" className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow="VAULT Asistan"
            title="Doğal dille sorun, eşleşen portföyleri ve uzmanları bulun."
            desc="VAULT Asistan, portföy arama, arayış oluşturma, eşleşme analizi, bölge uzmanı önerisi ve PDF hazırlama için çalışır."
          />
          <ul className="mt-8 space-y-3">
            {[
              "Arayışınıza uyan gizli portföyleri tek yanıtta önerir",
              "Bölge uzmanı ve bölge içgörüsü gösterir",
              "Eşleşmeyi 'Neden uyumlu?' ile açıklar",
              "Tek tıkla arayış kaydı ve detay talebi başlatır",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Check className="size-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface/50 px-4 py-2.5 text-sm text-muted-foreground">
            <Bot className="size-4 text-gold" /> VAULT Asistan, eski "AI Concierge" akışının yerini alır.
          </div>
        </div>
        <AIAssistantPreview />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Professional network                                                */
/* ------------------------------------------------------------------ */

const profCards = [
  "Profesyonel Profil",
  "Portföy Kataloğu",
  "Uzmanlık Bölgeleri",
  "Takip Sistemi",
  "Kontrollü İletişim",
];

function ProfessionalSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <ProfessionalProfilePreview />
        <div>
          <SectionHeader
            eyebrow="Profesyonel Ağ"
            title="Portföy değil, profesyonel ağ da keşfedin."
            desc="Her profesyonel kendi portföy vitrini, aktif arayışları, uzmanlık bölgeleri ve kontrollü iletişim bilgileriyle VAULT içinde görünür."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {profCards.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface/60 px-3.5 py-1.5 text-sm text-foreground"
              >
                <Check className="size-3.5 text-gold" /> {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Share Studio                                                        */
/* ------------------------------------------------------------------ */

function ShareStudioSection() {
  return (
    <section className="relative z-10 border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-[1320px] px-6 py-20">
        <div className="grid items-end gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
          <SectionHeader
            eyebrow="Share Studio"
            title="Portföyü sadece listelemek değil, profesyonel şekilde paylaşmak."
            desc="WhatsApp mesajı, paylaşım linki, teaser PDF ve e-mail tek workstation'dan. Teaser bilgiler açık kalır; tam adres, telefon ve belgeler detay talebi sonrası açılır."
          />
          <Button
            asChild
            size="lg"
            className="shrink-0 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <Link to="/dashboard/portfolios">
              Share Studio'yu Gör <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12">
          <ShareStudioPreview />
        </div>
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
    featured: true,
    features: ["Doğrulanmış profil", "Portföy oluşturma", "Harita keşfi", "Detay talebi yönetimi"],
    cta: "Başvur",
  },
  {
    name: "Pro",
    icon: Crown,
    price: "Yakında",
    tagline: "Aktif profesyoneller için",
    featured: false,
    features: ["Gelişmiş arayışlar", "AI portföy oluşturma", "Share Studio PDF", "Bölge takipleri"],
    cta: "İlgileniyorum",
  },
  {
    name: "Elite",
    icon: Sparkles,
    price: "Yakında",
    tagline: "Üst düzey danışmanlar için",
    featured: false,
    features: ["Öncelikli görünürlük", "Bölge uzmanı rozeti", "Gelişmiş eşleşme", "Analytics"],
    cta: "İlgileniyorum",
  },
];

function MembershipSection() {
  return (
    <section id="uyelik" className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <SectionHeader
        eyebrow="Üyelik"
        title="Private bir ağ. Yalnızca doğrulanmış profesyoneller."
        desc="VAULT, yüksek değerli kapalı portföylerin güvenli paylaşımı için davetli ve doğrulanmış profesyonellerle büyür."
        className="mx-auto text-center"
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative flex flex-col rounded-2xl border p-7 shadow-elegant ${
              t.featured ? "border-gold/40 bg-gradient-surface shadow-gold" : "border-border bg-surface/60"
            }`}
          >
            {t.featured && (
              <span className="absolute right-5 top-5 rounded-full bg-gradient-gold px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                Açık başvuru
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
              <a href={`#${APPLY_ID}`} onClick={scrollToApply}>
                {t.cta}
              </a>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Application / waitlist                                              */
/* ------------------------------------------------------------------ */

function ApplicationSection() {
  return (
    <section id={APPLY_ID} className="relative z-10 border-y border-border/60 bg-surface/30 scroll-mt-20">
      <div className="mx-auto grid max-w-[1320px] items-start gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow="Başvuru"
            title="Kurucu üye olarak VAULT ağına katılın."
            desc="Kapalı luxury portföylerinizi güvenli, kontrollü ve profesyonel bir ağda paylaşmaya bugün başlayın."
          />
          <ul className="mt-8 space-y-3">
            {[
              "Davetli ve doğrulanmış profesyonel ağı",
              "Kapalı portföyler için kontrollü paylaşım",
              "AI destekli eşleşme ve bölge takibi",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Check className="size-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <ApplicationForm />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

function FaqBlock() {
  return (
    <section id="sss" className="relative z-10 mx-auto max-w-3xl px-6 py-20">
      <SectionHeader eyebrow="SSS" title="Sık sorulan sorular." className="mx-auto text-center" />
      <div className="mt-10">
        <FaqSection />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

const footerProductLinks = [
  { label: "Nasıl Çalışır", href: "#nasil-calisir" },
  { label: "Özellikler", href: "#ozellikler" },
  { label: "VAULT Asistan", href: "#asistan" },
  { label: "Üyelik", href: "#uyelik" },
];

const footerLegalLinks = ["Gizlilik", "Kullanım Şartları", "KVKK"];

function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/60">
      <div className="mx-auto max-w-[1320px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Private Real Estate Network — doğrulanmış profesyoneller için kapalı luxury portföy ağı.
            </p>
          </div>
          <FooterCol title="Ürün">
            {footerProductLinks.map((l) => (
              <a key={l.href} href={l.href} className="block text-sm text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </a>
            ))}
          </FooterCol>
          <FooterCol title="Yasal">
            {footerLegalLinks.map((l) => (
              <span key={l} className="block cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">
                {l}
              </span>
            ))}
          </FooterCol>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              Katılın
            </p>
            <Button
              asChild
              className="mt-4 w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <a href={`#${APPLY_ID}`} onClick={scrollToApply}>
                Üyelik Başvurusu Yap <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="mt-12 border-t border-border/60 pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VAULT — Private Luxury Real Estate Network. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">{title}</p>
      <div className="mt-4 space-y-2.5">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile sticky CTA                                                   */
/* ------------------------------------------------------------------ */

function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 p-3 backdrop-blur-xl lg:hidden">
      <Button
        asChild
        size="lg"
        className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
      >
        <a href={`#${APPLY_ID}`} onClick={scrollToApply}>
          Üyelik Başvurusu Yap <ArrowRight className="size-4" />
        </a>
      </Button>
    </div>
  );
}
