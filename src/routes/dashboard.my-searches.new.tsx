import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/vault/cards";
import { SearchForm } from "@/components/search/search-form";
import { featureFlags } from "@/lib/feature-flags";
import { useAuth } from "@/lib/auth/auth-context";
import { createSearch, type SearchInput } from "@/lib/data/searches";

export const Route = createFileRoute("/dashboard/my-searches/new")({
  beforeLoad: () => {
    if (!featureFlags.arayis) throw redirect({ to: "/dashboard" });
  },
  component: NewSearch,
});

function NewSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(input: SearchInput) {
    if (!user) return;
    setSubmitting(true);
    try {
      await createSearch(user.id, input);
      toast.success("Arayış oluşturuldu.");
      navigate({ to: "/dashboard/my-searches" });
    } catch (e) {
      toast.error("Oluşturulamadı", { description: e instanceof Error ? e.message : String(e) });
      setSubmitting(false);
    }
  }

  return (
    <PageContainer className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
        <Link to="/dashboard/my-searches">
          <ArrowLeft className="size-4" /> Arayışlarım
        </Link>
      </Button>
      <PageHeader
        title="Yeni Arayış"
        subtitle="Müşterinizin aradığı portföyün kriterlerini girin; ağda paylaşılır."
      />
      <SurfaceCard>
        <SearchForm submitting={submitting} submitLabel="Arayış Oluştur" onSubmit={onSubmit} />
      </SurfaceCard>
    </PageContainer>
  );
}
