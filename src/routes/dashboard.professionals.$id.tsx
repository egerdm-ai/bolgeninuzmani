import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { ProfessionalProfile } from "@/components/vault/professional-profile";
import { getProfessionalById } from "@/lib/mock/data";

export const Route = createFileRoute("/dashboard/professionals/$id")({
  loader: ({ params }) => {
    const professional = getProfessionalById(params.id);
    if (!professional) throw notFound();
    return { professional };
  },
  component: ProfessionalProfilePage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Profesyonel bulunamadı.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">{error.message}</div>
  ),
});

function ProfessionalProfilePage() {
  const { professional } = Route.useLoaderData();
  return (
    <PageContainer className="space-y-5">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/dashboard/professionals" className="transition-colors hover:text-gold">
          Profesyoneller
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-secondary-foreground">{professional.fullName}</span>
      </nav>
      <ProfessionalProfile professional={professional} />
    </PageContainer>
  );
}
