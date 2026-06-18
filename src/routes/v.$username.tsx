import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { getProfessionalByUsername } from "@/lib/mock/data";
import { ProfessionalProfile } from "@/components/vault/professional-profile";
import { Button } from "@/components/ui/button";
import { featureFlags } from "@/lib/feature-flags";

export const Route = createFileRoute("/v/$username")({
  loader: ({ params }) => {
    const professional = getProfessionalByUsername(params.username);
    if (!professional) throw notFound();
    return { professional };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.professional.fullName ?? "Profesyonel"} — Bölgenin Uzmanı` },
      { name: "description", content: loaderData?.professional.bio ?? "" },
      {
        property: "og:title",
        content: loaderData?.professional.fullName ?? "Bölgenin Uzmanı Profesyonel",
      },
      { property: "og:description", content: loaderData?.professional.bio ?? "" },
      { property: "og:image", content: loaderData?.professional.coverImage ?? "" },
    ],
  }),
  component: PublicProfessionalPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Profesyonel bulunamadı.
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      {error.message}
    </div>
  ),
});

function PublicProfessionalPage() {
  const { professional } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 lg:px-7">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span className="font-display text-base font-bold uppercase leading-tight text-foreground sm:text-2xl sm:tracking-[0.2em]">
              Bölgenin Uzmanı
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {featureFlags.professionals && (
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Link to="/dashboard/professionals">
                  <ArrowLeft className="size-4" /> Profesyoneller
                </Link>
              </Button>
            )}
            <Button asChild className="bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Link to="/login">Üye Girişi</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-7">
        <ProfessionalProfile professional={professional} />
      </main>
    </div>
  );
}
