import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { ProfessionalProfileView } from "@/components/profile/professional-profile-view";
import { toProfessionalVM, type ProfessionalVM } from "@/lib/profile-vm";
import { getPublicProfile, getPublicAgentPortfolios } from "@/lib/data/public-portfolio";

export const Route = createFileRoute("/dashboard/professionals/$id")({
  component: ProfessionalProfilePage,
});

function ProfessionalProfilePage() {
  // The route param is the agent's username (public profile key).
  const { id: username } = Route.useParams();
  const [vm, setVm] = useState<ProfessionalVM | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getPublicProfile(username), getPublicAgentPortfolios(username).catch(() => [])])
      .then(([profile, ports]) => {
        if (!active) return;
        setVm(profile ? toProfessionalVM(profile, ports) : null);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [username]);

  return (
    <PageContainer className="space-y-5">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/dashboard/search" className="transition-colors hover:text-gold">
          Keşfet
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-secondary-foreground">{vm?.fullName ?? "Profesyonel"}</span>
      </nav>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : !vm ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-sm text-muted-foreground">
          Profesyonel bulunamadı.
        </div>
      ) : (
        <ProfessionalProfileView vm={vm} context="app" />
      )}
    </PageContainer>
  );
}
