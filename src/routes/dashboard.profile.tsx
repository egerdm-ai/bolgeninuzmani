import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Eye, Loader2, X } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfessionalProfileView } from "@/components/profile/professional-profile-view";
import { toProfessionalVM, type ProfessionalVM } from "@/lib/profile-vm";
import { useAuth } from "@/lib/auth/auth-context";
import { getPublicProfile, getPublicAgentPortfolios } from "@/lib/data/public-portfolio";

export const Route = createFileRoute("/dashboard/profile")({
  component: Profile,
});

function Profile() {
  const { profile } = useAuth();
  const username = profile?.username ?? null;
  const [vm, setVm] = useState<ProfessionalVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!username) return;
    let active = true;
    setLoading(true);
    Promise.all([getPublicProfile(username), getPublicAgentPortfolios(username).catch(() => [])])
      .then(([p, ports]) => {
        if (!active) return;
        setVm(p ? toProfessionalVM(p, ports) : null);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [username]);

  if (!profile) return null;

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Profilim" subtitle="Profesyonel profilinizi yönetin." />

      {loading || !vm ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : (
        <>
          <ProfessionalProfileView
            vm={vm}
            context="app"
            actions={
              <>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setEditing((e) => !e)}
                  aria-expanded={editing}
                >
                  <Pencil className="size-4" /> Düzenle
                </Button>
                {/* The ONLY path out to the public view — explicit preview. */}
                <Button asChild variant="ghost" className="gap-1.5">
                  <Link to="/v/$username" params={{ username: vm.username }}>
                    <Eye className="size-4" /> Profili Önizle
                  </Link>
                </Button>
              </>
            }
          />

          {editing && (
            <SurfaceCard>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Bilgileri Düzenle
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(false)}
                  aria-label="Kapat"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <ProfileForm />
            </SurfaceCard>
          )}
        </>
      )}
    </PageContainer>
  );
}
