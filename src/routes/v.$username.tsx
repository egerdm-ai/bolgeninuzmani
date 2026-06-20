import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ProfessionalProfileView } from "@/components/profile/professional-profile-view";
import { toProfessionalVM, type ProfessionalVM } from "@/lib/profile-vm";
import { getPublicProfile, getPublicAgentPortfolios } from "@/lib/data/public-portfolio";

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
  const [vm, setVm] = useState<ProfessionalVM | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getPublicProfile(username), getPublicAgentPortfolios(username).catch(() => [])])
      .then(([profile, ports]) => {
        if (!active) return;
        setVm(profile ? toProfessionalVM(profile, ports) : null);
        setLoading(false);
        if (profile) document.title = `${profile.full_name} — Bölgenin Uzmanı`;
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [username]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-gradient-gold text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span className="font-display text-base font-bold uppercase tracking-tight text-foreground sm:text-xl sm:tracking-[0.18em]">
              Bölgenin Uzmanı
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Link to="/login">Üye Girişi</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 pb-12 pt-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        ) : !vm ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-20 text-center">
            <p className="text-sm text-muted-foreground">Profesyonel bulunamadı.</p>
            <Button asChild variant="outline" className="mt-4 gap-1.5">
              <Link to="/">
                <ArrowLeft className="size-4" /> Ana sayfa
              </Link>
            </Button>
          </div>
        ) : (
          <ProfessionalProfileView vm={vm} context="public" />
        )}
      </main>
    </div>
  );
}
