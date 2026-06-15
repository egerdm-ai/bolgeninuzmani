import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
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
    <PageContainer className="space-y-6">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: "Profesyoneller", to: "/dashboard/professionals" },
          { label: professional.fullName },
        ]}
        className="mb-0"
      />
      <ProfessionalProfile professional={professional} />
    </PageContainer>
  );
}
