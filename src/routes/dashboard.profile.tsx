import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, MapPin, Eye, Send, FolderLock } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard, KpiCard } from "@/components/vault/cards";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { MembershipBadge } from "@/components/vault/badges";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile/profile-form";
import { useAuth } from "@/lib/auth/auth-context";
import { dashboardKpis, myPortfolios, propertyImages } from "@/lib/mock/data";
import { PortfolioCard } from "@/components/vault/portfolio-card";
import { useSaved } from "@/lib/saved-store";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/dashboard/profile")({
  component: Profile,
});

function Profile() {
  const { profile } = useAuth();
  const { isSaved, toggleSave } = useSaved();
  // TODO[M2]: KPIs + published portfolios are still mock; wire to real portfolios.
  const active = myPortfolios.filter((p) => p.status === "active").slice(0, 3);

  if (!profile) return null;

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Profilim" subtitle="Profesyonel profilinizi yönetin." />

      {/* Cover + identity (real profile) */}
      <SurfaceCard className="overflow-hidden p-0">
        <div className="relative h-40">
          <img src={propertyImages.villa2} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="-mt-12">
            <BrokerAvatar
              name={profile.full_name}
              src={profile.avatar_url ?? undefined}
              size="xl"
              className="ring-4 ring-surface"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {profile.full_name}
              </h2>
              <ShieldCheck className="size-5 text-gold" />
              <MembershipBadge tier={profile.membership_tier} />
            </div>
            <p className="text-sm text-muted-foreground">
              {[profile.title, profile.company_name].filter(Boolean).join(" · ") || "—"}
            </p>
            {profile.location && (
              <p className="flex items-center gap-1 text-xs text-gold">
                <MapPin className="size-3.5" /> {profile.location}
              </p>
            )}
          </div>
          {/* Public profile preview (Slice 3: /v/$username via get_public_profile RPC). */}
          <Button asChild variant="outline">
            <Link to="/v/$username" params={{ username: profile.username }}>
              Profili Önizle
            </Link>
          </Button>
        </div>
      </SurfaceCard>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Aktif Portföy"
          value={formatNumber(dashboardKpis.activePortfolios)}
          icon={FolderLock}
        />
        <KpiCard
          label="Toplam Görüntülenme"
          value={formatNumber(dashboardKpis.totalViews)}
          icon={Eye}
        />
        <KpiCard
          label="Detay Talepleri"
          value={formatNumber(dashboardKpis.detailRequests)}
          icon={Send}
        />
      </div>

      {/* Edit form (real — profiles_update_self) */}
      <SurfaceCard>
        <ProfileForm />
      </SurfaceCard>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Yayındaki Portföyler</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((p) => (
            <PortfolioCard
              key={p.id}
              portfolio={p}
              saved={isSaved(p.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
