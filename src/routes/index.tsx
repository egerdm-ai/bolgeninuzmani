import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Sparkles,
  MapPin,
  ArrowRight,
  Bot,
  Check,
  X,
  Crown,
  UserCheck,
  Bookmark,
  KeyRound,
  Lock,
  Folder,
  Users,
  Search,
  Bell,
  Star,
  FileText,
  Eye,
  EyeOff,
  FileLock,
  History,
  Mail,
  ScrollText,
  Building2,
  Factory,
  Hotel,
  Trees,
  Store,
  Warehouse,
  Layers,
  Send,
  TrendingUp,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/landing/primitives";
import { LandingHeroProductMockup } from "@/components/landing/hero-mockup";
import { ApplicationForm } from "@/components/landing/application-form";
import { FaqSection } from "@/components/landing/faq";
import { propertyImages } from "@/lib/mock/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bölgenin Uzmanı — Emlak Profesyonelleri için Kapalı Portföy ve Arayış Ağı" },
      {
        name: "description",
        content:
          "Bölgenin Uzmanı, doğrulanmış emlak profesyonellerinin konut, arsa, ticari mülk ve yatırım portföylerini kontrollü şekilde paylaştığı; alıcı arayışlarıyla AI destekli eşleştirdiği kapalı gayrimenkul ağıdır.",
      },
      {
        property: "og:title",
        content: "Bölgenin Uzmanı — Private Real Estate Network",
      },
      {
        property: "og:description",
        content:
          "Kapalı portföyleri ve alıcı arayışlarını tek profesyonel ağda buluşturun. Doğrulanmış emlak profesyonelleri için kapalı portföy ve arayış ağı.",
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

function scrollTo(id: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

const navLinks = [
  { label: "Nasıl Çalışır", href: "nasil-calisir" },
  { label: "Kapalı Portföy", href: "kontrol" },
  { label: "Arayış Ağı", href: "arayis" },
  { label: "Üyelik", href: "uyelik" },
  { label: "SSS", href: "sss" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background pb-24 text-foreground lg:pb-0">
      <BackgroundGlow />
      <Navbar />
      <Hero />
      <BenefitsSection />
      <ProblemSection />
      <ProductMockupSection />
      <HowItWorks />
      <ControlSection />
      <SearchNetworkSection />
      <AssistantSection />
      <ExpertsSection />
      <TrustSection />
      <PricingSection />
      <BoostSection />
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

function Logo({ stacked = false }: { stacked?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold">
        <ShieldCheck className="size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Bölgenin Uzmanı
        </span>
        {stacked && (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-gold">
            Private Real Estate Network
          </span>
        )}
        {!stacked && (
          <span className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
            Private Real Estate Network
          </span>
        )}
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
              href={`#${l.href}`}
              onClick={scrollTo(l.href)}
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
/* 1. Hero                                                             */
/* ------------------------------------------------------------------ */

const heroMetrics = [
  { value: "1.200+", label: "Kapalı Portföy" },
  { value: "350+", label: "Doğrulanmış Profesyonel" },
  { value: "75+", label: "Aktif Arayış" },
  { value: "24", label: "Şehir" },
];

function Hero() {
  return (
    <section className="relative z-10">
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            <Sparkles className="size-3.5" /> Doğrulanmış profesyoneller için kapalı ağ
          </span>
          <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
            Kapalı Portföyleri ve Alıcı Arayışlarını{" "}
            <span className="text-gold">Tek Profesyonel Ağda</span> Buluşturun
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Bölgenin Uzmanı, doğrulanmış emlak profesyonellerinin konut, arsa, ticari mülk ve
            yatırım portföylerini kontrollü şekilde paylaştığı; alıcı arayışlarıyla AI destekli
            eşleştirdiği kapalı gayrimenkul ağıdır.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
              <a href="#nasil-calisir" onClick={scrollTo("nasil-calisir")}>
                Nasıl Çalışır?
              </a>
            </Button>
          </div>
          <div className="mt-12 grid max-w-md grid-cols-2 gap-x-8 gap-y-6 border-t border-border/60 pt-8 sm:grid-cols-4">
            {heroMetrics.map((m) => (
              <div key={m.label}>
                <p className="font-display text-2xl font-semibold text-gold sm:text-[1.7rem]">
                  {m.value}
                </p>
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{m.label}</p>
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
/* 2. 3 ana kullanıcı faydası                                          */
/* ------------------------------------------------------------------ */

const benefits = [
  {
    icon: Folder,
    title: "Portföy Paylaş",
    desc: "Kapalı portföyünüzü tam adres, malik bilgisi ve belgeleri gizli tutarak doğrulanmış profesyonellerle paylaşın.",
  },
  {
    icon: Bookmark,
    title: "Arayış Kaydet",
    desc: "Müşterinizin aradığı mülk kriterlerini kaydedin. Uygun yeni portföy geldiğinde bildirim alın.",
  },
  {
    icon: Users,
    title: "Uzman Bul",
    desc: "Bölge, portföy tipi ve işlem tecrübesine göre doğru emlak profesyonelleriyle bağlantı kurun.",
  },
];

function BenefitsSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1320px] px-6 pb-8 pt-4 lg:pb-16">
      <div className="grid gap-5 md:grid-cols-3">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="group rounded-2xl border border-border bg-gradient-surface p-7 shadow-elegant transition-colors hover:border-gold/30"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
              <b.icon className="size-6" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">{b.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Problem                                                          */
/* ------------------------------------------------------------------ */

const problems = [
  {
    icon: Folder,
    title: "Portföyler Kayboluyor",
    desc: "Kapalı portföyler WhatsApp gruplarında, PDF'lerde ve özel mesajlarda dağınık şekilde kalıyor.",
  },
  {
    icon: Lock,
    title: "Kontrol Kaybı Yaşanıyor",
    desc: "Tam adres, malik bilgisi ve özel belgeler yanlış kişilere ulaşabiliyor.",
  },
  {
    icon: Search,
    title: "Arayışlar Eşleşmiyor",
    desc: "Alıcı arayışları doğru portföy sahiplerine ulaşmadığı için fırsatlar kaçıyor.",
  },
];

function ProblemSection() {
  return (
    <section className="relative z-10 border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-[1320px] px-6 py-20">
        <SectionHeader
          eyebrow="Problem"
          title="WhatsApp gruplarındaki karmaşayı profesyonel ağa taşıyın."
          className="mx-auto text-center"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-destructive/15 bg-destructive/[0.03] p-6 transition-colors hover:border-destructive/30"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive/80">
                <p.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Ürün mockup                                                      */
/* ------------------------------------------------------------------ */

const mockListings = [
  { img: propertyImages.villa1, title: "Yalıkavak Deniz Manzaralı Villa", meta: "Villa · 520 m² · Deniz manzarası", price: "₺92M" },
  { img: propertyImages.hotel1, title: "Bodrum Butik Otel", meta: "Otel · 24 oda · İşletmeli", price: "₺240M" },
  { img: propertyImages.land1, title: "Çeşme Turizm İmarlı Arsa", meta: "Arsa · 6.400 m² · Turizm imarlı", price: "₺115M" },
];

const mockFilters = ["Konut", "Villa / Yalı", "Arsa", "Ticari", "Fabrika", "Otel"];

function ProductMockupSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <SectionHeader
        eyebrow="Ürün"
        title="Harita, liste ve AI arama ile kapalı portföyleri keşfedin."
        className="mx-auto text-center"
      />
      <div className="mt-12 overflow-hidden rounded-3xl border border-border-strong bg-gradient-surface shadow-elegant">
        {/* AI search bar */}
        <div className="border-b border-border/60 p-4 sm:p-5">
          <div className="flex items-center gap-3 rounded-xl border border-gold/25 bg-background/60 px-4 py-3">
            <Sparkles className="size-4 shrink-0 text-gold" />
            <span className="line-clamp-1 text-sm text-muted-foreground">
              "Bodrum Yalıkavak'ta minimum 500 m² kapalı alanlı, deniz manzaralı villa arıyorum."
            </span>
            <span className="ml-auto hidden shrink-0 rounded-lg bg-gradient-gold px-3 py-1.5 text-xs font-semibold text-primary-foreground sm:inline-flex">
              AI Ara
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[210px_minmax(0,1fr)]">
          {/* Filter panel */}
          <aside className="hidden border-r border-border/60 p-5 lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filtreler
            </p>
            <div className="mt-4 space-y-2">
              {mockFilters.map((f, i) => (
                <div
                  key={f}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    i === 1
                      ? "border-gold/40 bg-gold/10 text-foreground"
                      : "border-border/60 bg-background/40 text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex size-4 items-center justify-center rounded border ${
                      i === 1 ? "border-gold bg-gold text-primary-foreground" : "border-border-strong"
                    }`}
                  >
                    {i === 1 && <Check className="size-3" />}
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </aside>

          {/* Listings */}
          <div className="p-5">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-2.5">
              <Star className="size-4 text-gold" />
              <span className="text-sm font-medium text-foreground">Vitrin</span>
              <span className="text-xs text-muted-foreground">· Öne çıkan kapalı portföyler</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {mockListings.map((l) => (
                <div
                  key={l.title}
                  className="overflow-hidden rounded-2xl border border-border-strong bg-surface/80"
                >
                  <div className="relative h-28">
                    <img src={l.img} alt={l.title} className="size-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md border border-gold/30 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-gold backdrop-blur">
                      <Lock className="size-3" /> Tam lokasyon kilitli
                    </span>
                    <span className="absolute bottom-2 right-2 rounded-md bg-gradient-gold px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                      {l.price}
                    </span>
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="font-display text-sm font-semibold leading-tight text-foreground">
                      {l.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{l.meta}</p>
                    <button className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-gold py-1.5 text-[11px] font-semibold text-primary-foreground">
                      <KeyRound className="size-3" /> Detay Talebi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Nasıl Çalışır                                                    */
/* ------------------------------------------------------------------ */

const steps = [
  {
    icon: Folder,
    title: "Portföy veya Arayış Oluştur",
    desc: "Konut, arsa, ticari mülk, fabrika, otel veya müşteri arayışınızı sisteme girin.",
  },
  {
    icon: Lock,
    title: "Gizlilik Seviyesini Belirle",
    desc: "Tam adres, malik bilgisi, belgeler ve PDF'ler sadece onayınızla açılsın.",
  },
  {
    icon: MapPin,
    title: "Haritada ve Listede Keşfedil",
    desc: "Portföyünüz yaklaşık lokasyonla görünür, tam detaylar kilitli kalır.",
  },
  {
    icon: Sparkles,
    title: "AI Eşleşmeleri Gör",
    desc: "Arayışlar ve portföyler doğal dil, filtreler ve özelliklere göre eşleşir.",
  },
  {
    icon: UserCheck,
    title: "Detay Talebini Onayla",
    desc: "Emlakçılardan gelen bilgi taleplerini inceleyin, istediğiniz kişiye detay açın.",
  },
];

function HowItWorks() {
  return (
    <section id="nasil-calisir" className="relative z-10 border-y border-border/60 bg-surface/30 scroll-mt-20">
      <div className="mx-auto max-w-[1320px] px-6 py-20">
        <SectionHeader eyebrow="Süreç" title="Nasıl Çalışır?" className="mx-auto text-center" />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant"
            >
              <span className="absolute right-5 top-5 font-display text-3xl font-semibold text-gold/20">
                {i + 1}
              </span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold leading-tight text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button
            asChild
            size="lg"
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <a href={`#${APPLY_ID}`} onClick={scrollToApply}>
              Üyelik Başvurusu Yap <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Kapalı portföy sistemi / kontrol                                 */
/* ------------------------------------------------------------------ */

const controlCards = [
  { icon: EyeOff, title: "Tam adres gizli" },
  { icon: Lock, title: "Malik bilgisi gizli" },
  { icon: FileLock, title: "Belgeler ve PDF kilitli" },
  { icon: KeyRound, title: "Tam konum talep sonrası açılır" },
  { icon: UserCheck, title: "Talep eden emlakçı profilini görürsünüz" },
  { icon: History, title: "Erişim geçmişi kaydedilir" },
];

function ControlSection() {
  return (
    <section id="kontrol" className="relative z-10 mx-auto max-w-[1320px] px-6 py-20 scroll-mt-20">
      <SectionHeader
        eyebrow="Kontrollü Erişim"
        title="Bilgi Kontrolü Sizde"
        desc="Portföyünüz herkes tarafından görülebilir ama kritik bilgiler sadece sizin onayınızla açılır."
        className="mx-auto text-center"
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {controlCards.map((c) => (
          <div
            key={c.title}
            className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant transition-colors hover:border-gold/30"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <c.icon className="size-5" />
            </span>
            <p className="font-medium text-foreground">{c.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Arayış sistemi                                                   */
/* ------------------------------------------------------------------ */

const searchCriteria = [
  "Bodrum / Yalıkavak",
  "Villa",
  "Minimum 500 m² kapalı alan",
  "Minimum 500 m² açık alan",
  "4 araçlık otopark",
  "5+ oda",
  "4+ banyo",
  "Deniz manzarası",
];

const searchFeatures = [
  "Müşteri bilgisi gizli kalır",
  "Arayış profilinizde görünür",
  "Yeni uygun portföy geldiğinde bildirim alırsınız",
  "Portföy sahipleri sizinle iletişime geçebilir",
  "AI arayışınızı portföylerle eşleştirir",
];

function SearchNetworkSection() {
  return (
    <section id="arayis" className="relative z-10 border-y border-border/60 bg-surface/30 scroll-mt-20">
      <div className="mx-auto max-w-[1320px] px-6 py-20">
        <SectionHeader
          eyebrow="Arayış Ağı"
          title="Sadece Portföy Değil, Arayış da Paylaşın"
          desc="Müşterinizin aradığı mülk kriterlerini sisteme kaydedin. Müşteri bilgisi sadece sizde kalır; profilinizde ise anonim arayış olarak görünür."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Benim gördüğüm müşteri arayışı */}
          <div className="rounded-2xl border border-border-strong bg-surface/80 p-6 shadow-elegant">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <Eye className="size-4 text-gold" />
              <span className="text-sm font-medium text-foreground">Benim gördüğüm müşteri arayışı</span>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-gold/15 font-display text-base font-semibold text-gold">
                AY
              </span>
              <div>
                <p className="text-[11px] text-muted-foreground">Müşteri</p>
                <p className="text-sm font-semibold text-foreground">Ahmet Yılmaz</p>
              </div>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Arayış kriterleri
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {searchCriteria.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-gold" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Profilimde görünen hali */}
          <div className="rounded-2xl border border-gold/30 bg-gradient-surface p-6 shadow-gold">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <Users className="size-4 text-gold" />
              <span className="text-sm font-medium text-foreground">Profilimde görünen hali</span>
            </div>
            <div className="mt-5 rounded-xl border border-border-strong bg-background/50 p-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-gold">
                <Search className="size-3" /> Aktif Arayış
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold leading-tight text-foreground">
                Bodrum Yalıkavak'ta Deniz Manzaralı Villa Arayışı
              </h3>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2.5 text-sm text-muted-foreground">
                <Lock className="size-4 shrink-0 text-gold/80" /> Müşteri bilgisi gizli
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Uygun portföy sahipleri detay paylaşabilir.
              </p>
            </div>
            <ul className="mt-5 space-y-2.5">
              {searchFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Check className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 8. AI Asistan                                                       */
/* ------------------------------------------------------------------ */

const aiPrompts = [
  "Tuzla'da satılık fabrika arıyorum, minimum 5.000 m² kapalı alan olsun.",
  "Bodrum'da deniz manzaralı otel var mı?",
  "Yalıkavak'ta 4 araçlık otoparkı olan villa ara.",
  "Çeşme'de turizm imarlı arsa göster.",
];

function AssistantSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1320px] px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow="AI Asistan"
            title="AI Asistan ile Aradığınız Portföyü Tarif Edin"
            desc="Filtrelerle uğraşmadan aradığınız mülkü doğal dille yazın. AI Asistan, portföyleri, açıklamaları, özellikleri ve arayışları analiz ederek en uygun eşleşmeleri getirir."
          />
          <ul className="mt-8 space-y-3">
            {aiPrompts.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface/50 px-4 py-3 text-sm text-foreground"
              >
                <Bot className="mt-0.5 size-4 shrink-0 text-gold" />
                <span className="text-muted-foreground">"{p}"</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mockup */}
        <div className="overflow-hidden rounded-2xl border border-border-strong bg-surface/80 shadow-elegant backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Bot className="size-4" />
            </span>
            <span className="text-sm font-medium text-foreground">AI Asistan</span>
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-success">
              <span className="size-1.5 rounded-full bg-success" /> Çevrimiçi
            </span>
          </div>
          <div className="space-y-4 p-5">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-gold/15 px-4 py-2.5 text-sm text-foreground">
              Tuzla'da satılık fabrika arıyorum, minimum 5.000 m² kapalı alan olsun.
            </p>
            <div className="w-fit max-w-[96%] space-y-3 rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3.5">
              <p className="text-sm text-muted-foreground">
                Bu arayışla eşleşen{" "}
                <span className="font-medium text-foreground">2 portföyü</span> listeledim.
              </p>
              {[
                { img: propertyImages.apartment1, name: "Tuzla Sanayi Fabrika", meta: "6.200 m² kapalı · Vinçli", score: 95 },
                { img: propertyImages.land1, name: "Gebze Lojistik Depo", meta: "8.000 m² · Otoyola yakın", score: 87 },
              ].map((m) => (
                <div key={m.name} className="rounded-xl border border-border/60 bg-background/50 p-2.5">
                  <div className="flex items-center gap-3">
                    <img src={m.img} alt={m.name} className="size-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-foreground">{m.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{m.meta}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      %{m.score}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5">
                {["Arayış Olarak Kaydet", "Detay Talebi"].map((b, i) => (
                  <span
                    key={b}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                      i === 0
                        ? "bg-gradient-gold text-primary-foreground"
                        : "border border-border-strong bg-background/60 text-foreground"
                    }`}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-border/60 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-background/60 px-3 py-2">
              <span className="flex-1 text-sm text-muted-foreground">Doğal dille bir talep yazın…</span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground">
                <Send className="size-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Bölge uzmanları                                                  */
/* ------------------------------------------------------------------ */

const experts = [
  {
    name: "Taylan Hersek",
    region: "Bodrum / Yalıkavak Uzmanı",
    type: "Villa & Yalı",
    listings: 18,
    searches: 7,
    response: "%96",
    avatar: "photo-1560250097-0b93528c311a",
  },
  {
    name: "Deniz Arslan",
    region: "Tuzla Sanayi Mülkü Uzmanı",
    type: "Fabrika & Depo",
    listings: 12,
    searches: 5,
    response: "%92",
    avatar: "photo-1573497019940-1c28c88b4f3e",
  },
  {
    name: "Mert Kaya",
    region: "Kadıköy Ticari Gayrimenkul Uzmanı",
    type: "Ticari & Devren",
    listings: 21,
    searches: 9,
    response: "%89",
    avatar: "photo-1500648767791-00dcc994a43e",
  },
  {
    name: "Selin Demir",
    region: "Çeşme Arsa ve Turizm İmarı Uzmanı",
    type: "Arsa & Turizm",
    listings: 14,
    searches: 6,
    response: "%94",
    avatar: "photo-1580489944761-15a19d654956",
  },
];

function ExpertsSection() {
  return (
    <section className="relative z-10 border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-[1320px] px-6 py-20">
        <SectionHeader
          eyebrow="Bölge Uzmanları"
          title="Her Portföyün Arkasında Bir Bölge Uzmanı Var"
          desc="Doğrulanmış emlak profesyonellerini uzmanlık bölgesi, aktif portföyleri, arayışları ve yanıt performanslarına göre keşfedin."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {experts.map((e) => (
            <div
              key={e.name}
              className="overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant transition-colors hover:border-gold/30"
            >
              <div className="flex flex-col items-center px-5 pt-6 text-center">
                <div className="relative">
                  <img
                    src={`https://images.unsplash.com/${e.avatar}?auto=format&fit=crop&crop=faces&w=160&h=160&q=80`}
                    alt={e.name}
                    className="size-16 rounded-full object-cover ring-2 ring-gold/30"
                  />
                  <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold">
                    <BadgeCheck className="size-3.5" />
                  </span>
                </div>
                <p className="mt-3 font-display text-lg font-semibold text-foreground">{e.name}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-gold">
                  <MapPin className="size-3" /> {e.region}
                </p>
                <span className="mt-3 rounded-full border border-border-strong bg-surface/60 px-3 py-1 text-[11px] text-muted-foreground">
                  {e.type}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 border-t border-border/60 text-center">
                <Stat value={e.listings} label="İlan" />
                <Stat value={e.searches} label="Arayış" className="border-x border-border/60" />
                <Stat value={e.response} label="Yanıt" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
  className = "",
}: {
  value: string | number;
  label: string;
  className?: string;
}) {
  return (
    <div className={`py-3 ${className}`}>
      <p className="font-display text-lg font-semibold text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Güven ve gizlilik                                               */
/* ------------------------------------------------------------------ */

const trustCards = [
  { icon: BadgeCheck, title: "Doğrulanmış Profesyoneller" },
  { icon: Layers, title: "Katmanlı Erişim" },
  { icon: UserCheck, title: "Detay Talebi Onayı" },
  { icon: EyeOff, title: "Tam Adres Gizleme" },
  { icon: FileLock, title: "Belgeler Kilitli" },
  { icon: History, title: "Erişim Logları" },
  { icon: Mail, title: "Davetli Üyelik" },
  { icon: ScrollText, title: "KVKK Uyumlu Süreç" },
];

function TrustSection() {
  return (
    <section id="ozellikler" className="relative z-10 mx-auto max-w-[1320px] px-6 py-20 scroll-mt-20">
      <SectionHeader
        eyebrow="Güven & Gizlilik"
        title="Güven, Gizlilik ve Kontrollü Erişim"
        className="mx-auto text-center"
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustCards.map((c) => (
          <div
            key={c.title}
            className="flex flex-col items-center rounded-2xl border border-border bg-gradient-surface p-6 text-center shadow-elegant transition-colors hover:border-gold/30"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <c.icon className="size-6" />
            </span>
            <p className="mt-4 font-medium text-foreground">{c.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 11. Pricing                                                         */
/* ------------------------------------------------------------------ */

const tiers = [
  {
    name: "Basic",
    icon: ShieldCheck,
    price: "2.500 TL",
    period: "/ Ay",
    tag: null as string | null,
    featured: false,
    included: [
      "Profil oluşturma",
      "Marketplace erişimi",
      "Tüm ilanları görüntüleme",
      "Detay Talebi gönderme",
      "Mesajlaşma",
      "Favoriler",
      "1 aktif ilan",
      "3 aktif arayış",
      "Temel filtreler",
      "Basic profil görünürlüğü",
    ],
    excluded: [
      "AI Asistan",
      "PDF Portföy Oluşturucu",
      "Yeni ilan eşleşme bildirimi",
      "Profil Boost",
      "Arayış Boost",
      "Request Boost",
      "Premium analitik",
    ],
    cta: "Başvur",
  },
  {
    name: "Pro",
    icon: Crown,
    price: "5.000 TL",
    period: "/ Ay",
    tag: "En Popüler",
    featured: false,
    included: [
      "Basic'teki her şey",
      "3 aktif ilan",
      "15 aktif arayış",
      "AI Asistan",
      "PDF Portföy Oluşturucu",
      "Yeni uygun ilan bildirimleri",
      "Gelişmiş filtreler",
      "İlan performans raporları",
      "Komisyon paylaşımı alanları",
      "Öncelikli destek",
    ],
    excluded: [
      "Elite rozet",
      "Profil Boost",
      "Arayış Boost",
      "Request Boost",
      "Sınırsız arayış",
      "Premium analitik",
      "Concierge support",
    ],
    cta: "Başvur",
  },
  {
    name: "Elite",
    icon: Sparkles,
    price: "10.000 TL",
    period: "/ Ay",
    tag: "En Çok Fayda",
    featured: true,
    included: [
      "Pro'daki her şey",
      "7 aktif ilan",
      "Sınırsız arayış",
      "Elite Member rozeti",
      "Profil Boost",
      "Arayış Boost",
      "Request Boost",
      "AI Asistan Pro",
      "Premium Analytics",
      "Profil ziyaretçi raporları",
      "Bölgesel görünürlük avantajı",
      "Yeni özelliklere erken erişim",
      "Concierge Support",
    ],
    excluded: [] as string[],
    cta: "Başvur",
  },
];

function PricingSection() {
  return (
    <section id="uyelik" className="relative z-10 mx-auto max-w-[1320px] px-6 py-20 scroll-mt-20">
      <SectionHeader
        eyebrow="Üyelik"
        title="Üyelik Paketleri"
        desc="Network'e erişin, portföylerinizi paylaşın, arayışlarınızı görünür kılın ve doğru profesyonellerle eşleşin."
        className="mx-auto text-center"
      />
      <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative flex flex-col rounded-2xl border p-7 ${
              t.featured
                ? "border-gold/50 bg-gradient-surface shadow-gold lg:-mt-4 lg:pb-9 lg:pt-9"
                : "border-border bg-surface/60 shadow-elegant"
            }`}
          >
            {t.tag && (
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-semibold ${
                  t.featured
                    ? "bg-gradient-gold text-primary-foreground shadow-gold"
                    : "border border-gold/40 bg-background text-gold"
                }`}
              >
                {t.tag}
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
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-semibold text-foreground">{t.price}</span>
              <span className="text-sm text-muted-foreground">{t.period}</span>
            </div>
            <Button
              asChild
              className={`mt-6 w-full ${
                t.featured
                  ? "bg-gradient-gold text-primary-foreground hover:opacity-90"
                  : "border border-border-strong bg-surface text-foreground hover:bg-surface-2"
              }`}
            >
              <a href={`#${APPLY_ID}`} onClick={scrollToApply}>
                {t.cta}
              </a>
            </Button>
            <ul className="mt-7 space-y-2.5">
              {t.included.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Check className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
              {t.excluded.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground/50 line-through decoration-muted-foreground/30"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/60">
                    <X className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Öne Çıkarma                                                     */
/* ------------------------------------------------------------------ */

const boostCards = [
  { icon: Star, title: "Ana Sayfa Vitrini" },
  { icon: Building2, title: "Şehir Vitrini" },
  { icon: MapPin, title: "Bölge Vitrini" },
  { icon: Users, title: "Profil Öne Çıkarma" },
  { icon: Search, title: "Arayış Öne Çıkarma" },
  { icon: Sparkles, title: "AI Eşleşme Artırıcı" },
  { icon: TrendingUp, title: "Aciliyet Rozeti" },
  { icon: FileText, title: "Premium PDF Showcase" },
];

function BoostSection() {
  return (
    <section className="relative z-10 border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-[1320px] px-6 py-16">
        <SectionHeader
          eyebrow="Öne Çıkarma"
          title="Görünürlüğünüzü Artırın"
          desc="İlanlarınızı, profilinizi ve arayışlarınızı doğru profesyonellerin karşısına daha hızlı çıkarın."
          className="mx-auto text-center"
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {boostCards.map((c) => (
            <div
              key={c.title}
              className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3.5 transition-colors hover:border-gold/30"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <c.icon className="size-4" />
              </span>
              <p className="text-sm font-medium text-foreground">{c.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 13. Başvuru                                                         */
/* ------------------------------------------------------------------ */

const portfolioTypes = [
  { icon: Building2, label: "Konut & Rezidans" },
  { icon: Trees, label: "Arsa" },
  { icon: Store, label: "Ticari mülk" },
  { icon: Factory, label: "Fabrika" },
  { icon: Hotel, label: "Otel & Restoran" },
  { icon: Warehouse, label: "Lojistik & Depo" },
];

function ApplicationSection() {
  return (
    <section id={APPLY_ID} className="relative z-10 mx-auto max-w-[1320px] px-6 py-20 scroll-mt-20">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow="Başvuru"
            title="Kurucu Üyelik Başvurusu"
            desc="Bölgenin Uzmanı kapalı bir profesyonel ağdır. Başvurular doğrulanmış emlak profesyonelleri arasından değerlendirilir."
          />
          <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Paylaşabileceğiniz portföy tipleri
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {portfolioTypes.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-surface/60 px-3.5 py-2.5 text-sm text-foreground"
              >
                <p.icon className="size-4 text-gold" /> {p.label}
              </span>
            ))}
          </div>
        </div>
        <ApplicationForm />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 14. SSS                                                             */
/* ------------------------------------------------------------------ */

function FaqBlock() {
  return (
    <section id="sss" className="relative z-10 mx-auto max-w-3xl px-6 py-20 scroll-mt-20">
      <SectionHeader eyebrow="SSS" title="Sık sorulan sorular." className="mx-auto text-center" />
      <div className="mt-10">
        <FaqSection />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 15. Footer                                                          */
/* ------------------------------------------------------------------ */

const footerLinks = [
  { label: "Nasıl Çalışır", href: "nasil-calisir" },
  { label: "Özellikler", href: "ozellikler" },
  { label: "Üyelik", href: "uyelik" },
  { label: "SSS", href: "sss" },
  { label: "Başvuru", href: APPLY_ID },
];

function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/60">
      <div className="mx-auto max-w-[1320px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1.2fr]">
          <div>
            <Logo stacked />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Emlak profesyonelleri için kapalı portföy ve arayış ağı.
            </p>
          </div>
          <FooterCol title="Bağlantılar">
            {footerLinks.map((l) => (
              <a
                key={l.href}
                href={`#${l.href}`}
                onClick={scrollTo(l.href)}
                className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </FooterCol>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              İletişim
            </p>
            <a
              href="mailto:hello@bolgeninuzmani.com"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="size-4 text-gold" /> hello@bolgeninuzmani.com
            </a>
            <Button
              asChild
              className="mt-5 w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <a href={`#${APPLY_ID}`} onClick={scrollToApply}>
                Üyelik Başvurusu Yap <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="mt-12 border-t border-border/60 pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bölgenin Uzmanı — Private Real Estate Network. Tüm hakları
            saklıdır.
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
