import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, ArrowLeft, MapPin, Phone, MessageCircle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicProfile, type PublicProfile } from "@/lib/data/public-portfolio";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPublicProfile(username)
      .then((d) => {
        if (!active) return;
        setData(d);
        setLoading(false);
        if (d) document.title = `${d.full_name} — Bölgenin Uzmanı`;
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [username]);

  const wa = data?.contact_whatsapp?.replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[900px] items-center justify-between px-4 lg:px-7">
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

      <main className="mx-auto max-w-[900px] px-4 py-6 lg:px-7">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        ) : !data ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-20 text-center">
            <p className="text-sm text-muted-foreground">Profesyonel bulunamadı.</p>
            <Button asChild variant="outline" className="mt-4 gap-1.5">
              <Link to="/">
                <ArrowLeft className="size-4" /> Ana sayfa
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-center gap-4">
                  {data.avatar_url ? (
                    <img
                      src={data.avatar_url}
                      alt=""
                      className="size-16 rounded-full object-cover ring-2 ring-surface"
                    />
                  ) : (
                    <span className="flex size-16 items-center justify-center rounded-full bg-surface-2 text-2xl font-semibold text-gold">
                      {data.full_name.slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h1 className="font-display text-2xl font-semibold text-foreground">
                        {data.full_name}
                      </h1>
                      <ShieldCheck className="size-4 text-gold" aria-label="Doğrulanmış" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {[data.title, data.company_name].filter(Boolean).join(" · ")}
                    </p>
                    {data.location && (
                      <p className="flex items-center gap-1 text-xs text-gold">
                        <MapPin className="size-3.5" /> {data.location}
                      </p>
                    )}
                  </div>
                </div>
                {data.bio && (
                  <p className="mt-4 text-sm leading-relaxed text-secondary-foreground">
                    {data.bio}
                  </p>
                )}
              </div>

              {(data.expertise_regions.length > 0 || data.expertise_types.length > 0) && (
                <div className="rounded-2xl border border-border bg-surface p-6">
                  <h2 className="text-sm font-semibold text-foreground">Uzmanlık</h2>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[...data.expertise_regions, ...data.expertise_types].map((x) => (
                      <span
                        key={x}
                        className="rounded-md bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold ring-1 ring-inset ring-gold/20"
                      >
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact (D8 open) */}
            <div className="space-y-2 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-20 lg:self-start">
              <h2 className="text-sm font-semibold text-foreground">İletişim</h2>
              {wa && (
                <Button
                  asChild
                  className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
                >
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                </Button>
              )}
              {data.contact_phone && (
                <Button asChild variant="outline" className="w-full gap-1.5">
                  <a href={`tel:${data.contact_phone}`}>
                    <Phone className="size-4" /> {data.contact_phone}
                  </a>
                </Button>
              )}
              {data.contact_email && (
                <Button asChild variant="outline" className="w-full gap-1.5">
                  <a href={`mailto:${data.contact_email}`}>
                    <Mail className="size-4" /> E-posta
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
