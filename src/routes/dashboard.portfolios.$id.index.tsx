import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Pencil, Share2 } from "lucide-react";
import { getPortfolioById, portfolios } from "@/lib/mock/data";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { PortfolioDetailView } from "@/components/vault/portfolio-detail-view";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/portfolios/$id/")({
  loader: ({ params }) => {
    const portfolio = getPortfolioById(params.id);
    if (!portfolio) throw notFound();
    return { portfolio };
  },
  component: OwnerPortfolioDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Portföy bulunamadı.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">{error.message}</div>
  ),
});

function OwnerPortfolioDetail() {
  const { portfolio } = Route.useLoaderData();
  const similar = portfolios
    .filter((p) => p.id !== portfolio.id && p.category === portfolio.category)
    .slice(0, 3);

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Portföy Detayı"
        breadcrumbs={[
          { label: "Portföylerim", to: "/dashboard/portfolios" },
          { label: portfolio.title },
        ]}
        actions={
          <>
            <Button variant="outline" className="gap-1.5">
              <Pencil className="size-4" /> Düzenle
            </Button>
            <Button
              asChild
              className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <Link to="/dashboard/portfolios/$id/share" params={{ id: portfolio.id }}>
                <Share2 className="size-4" /> Share Studio
              </Link>
            </Button>
          </>
        }
      />
      <PortfolioDetailView portfolio={portfolio} similar={similar} mode="owner" />
    </PageContainer>
  );
}
