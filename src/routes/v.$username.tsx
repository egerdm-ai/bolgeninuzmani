import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ProfessionalProfileView } from "@/components/profile/professional-profile-view";
import { toProfessionalVM } from "@/lib/profile-vm";
import { getPublicProfile, getPublicAgentPortfolios } from "@/lib/data/public-portfolio";
import { publicUrl } from "@/lib/public-origin";

export const Route = createFileRoute("/v/$username")({
  // SSR loader → dynamic OG. Public profile allow-list (get_public_profile); no contact-
  // sensitive/locked field reaches OG. Single fetch (component reads useLoaderData).
  loader: async ({ params }) => {
    const [profile, portfolios] = await Promise.all([
      getPublicProfile(params.username).catch(() => null),
      getPublicAgentPortfolios(params.username).catch(() => []),
    ]);
    return { profile, portfolios };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.profile;
    if (!p) return { meta: [{ title: "Profesyonel — Bölgenin Uzmanı" }] };
    const description =
      [p.title, p.company_name].filter(Boolean).join(" · ") ||
      [...p.expertise_regions, ...p.expertise_types].slice(0, 4).join(", ") ||
      "Doğrulanmış emlak profesyoneli";
    const url = publicUrl(`/v/${p.username}`);
    const image = p.avatar_url ?? undefined;
    return {
      meta: [
        { title: `${p.full_name} — Bölgenin Uzmanı` },
        { property: "og:title", content: p.full_name },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: p.full_name },
        { name: "twitter:description", content: description },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
      ],
    };
  },
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { profile, portfolios } = Route.useLoaderData();
  const vm = profile ? toProfessionalVM(profile, portfolios) : null;

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
        {!vm ? (
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
