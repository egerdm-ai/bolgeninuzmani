import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, MapPin, Lock, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyImages } from "@/lib/mock/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VAULT — Özel Lüks Gayrimenkul Ağı" },
      { name: "description", content: "Doğrulanmış gayrimenkul profesyonelleri için özel, harita öncelikli lüks portföy platformu." },
      { property: "og:title", content: "VAULT — Özel Lüks Gayrimenkul Ağı" },
      { property: "og:description", content: "Özel lüks portföyler oluşturun, harita üzerinde keşfedin, güvenle paylaşın." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Sparkles, title: "AI ile Portföy", desc: "WhatsApp, PDF veya metinden saniyeler içinde yapılandırılmış portföy taslağı." },
  { icon: MapPin, title: "Harita Öncelikli Arama", desc: "Lüks portföyleri harita üzerinde keşfedin, gelişmiş filtrelerle daraltın." },
  { icon: Lock, title: "Kontrollü Erişim", desc: "Hassas bilgiler kilitli kalır; yalnızca onayladığınız üyeler erişir." },
  { icon: Share2, title: "Profesyonel Paylaşım", desc: "WhatsApp mesajı, link ve PDF ile portföylerinizi ağınıza ulaştırın." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground"><ShieldCheck className="size-5" /></span>
            <span className="font-display text-2xl font-bold uppercase tracking-[0.25em] text-foreground">Vault</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-secondary-foreground"><Link to="/dashboard">Giriş Yap</Link></Button>
            <Button asChild className="bg-gradient-gold text-primary-foreground hover:opacity-90"><Link to="/dashboard">Panele Git</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <img src={propertyImages.villa1} alt="Lüks villa" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="relative mx-auto w-full max-w-[1400px] px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold ring-1 ring-inset ring-gold/25">
              <Sparkles className="size-3.5" /> Doğrulanmış profesyoneller için özel ağ
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-7xl">
              Lüks gayrimenkulün<br /><span className="text-gold">özel kasası.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-secondary-foreground">
              Özel lüks portföyler oluşturun, harita üzerinde keşfedin ve doğrulanmış ağınızla güvenle paylaşın. VAULT bir ilan pazarı değil — kontrollü, premium bir portföy ağıdır.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Link to="/dashboard">Panele Git <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
                <Link to="/dashboard/search">Portföyleri Keşfet</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-elegant">
              <span className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold"><f.icon className="size-5" /></span>
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
