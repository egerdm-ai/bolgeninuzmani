import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { getPortfolioBySlug, portfolios } from "@/lib/mock/data";
import { PortfolioDetailView } from "@/components/vault/portfolio-detail-view";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/p/$slug")({
  loader: ({ params }) => {
    const portfolio = getPortfolioBySlug(params.slug);
    if (!portfolio) throw notFound();
    return { portfolio };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.portfolio.title ?? "Portföy"} — VAULT` },
      { name: "description", content: loaderData?.portfolio.shortDescription ?? "" },
      { property: "og:title", content: loaderData?.portfolio.title ?? "VAULT Portföy" },
      { property: "og:description", content: loaderData?.portfolio.shortDescription ?? "" },
      { property: "og:image", content: loaderData?.portfolio.coverImage ?? "" },
    ],
  }),
  component: PublicPortfolioPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">Portföy bulunamadı.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">{error.message}</div>
  ),
});

function PublicPortfolioPage() {
  const { portfolio } = Route.useLoaderData();
  const similar = portfolios.filter((p) => p.id !== portfolio.id && p.category === portfolio.category && p.status === "active").slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 lg:px-7">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground"><ShieldCheck className="size-5" /></span>
            <span className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-foreground">Vault</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground"><Link to="/dashboard/search"><ArrowLeft className="size-4" /> Aramaya Dön</Link></Button>
            <Button asChild className="bg-gradient-gold text-primary-foreground hover:opacity-90"><Link to="/dashboard">Üye Girişi</Link></Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-7">
        <PortfolioDetailView portfolio={portfolio} similar={similar} mode="public" />
      </main>
    </div>
  );
}
