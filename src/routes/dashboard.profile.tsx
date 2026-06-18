import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck, MapPin, Eye, Send, FolderLock } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard, KpiCard } from "@/components/vault/cards";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { MembershipBadge } from "@/components/vault/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentUser, dashboardKpis, myPortfolios, propertyImages } from "@/lib/mock/data";
import { PortfolioCard } from "@/components/vault/portfolio-card";
import { useSaved } from "@/lib/saved-store";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/dashboard/profile")({
  component: Profile,
});

function Profile() {
  const { isSaved, toggleSave } = useSaved();
  const active = myPortfolios.filter((p) => p.status === "active").slice(0, 3);

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Profilim" subtitle="Profesyonel profilinizi yönetin." />

      {/* Cover + identity */}
      <SurfaceCard className="overflow-hidden p-0">
        <div className="relative h-40">
          <img src={propertyImages.villa2} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="-mt-12">
            <BrokerAvatar name={currentUser.fullName} size="xl" className="ring-4 ring-surface" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {currentUser.fullName}
              </h2>
              <ShieldCheck className="size-5 text-gold" />
              <MembershipBadge tier={currentUser.membershipTier} />
            </div>
            <p className="text-sm text-muted-foreground">
              {currentUser.title} · {currentUser.companyName}
            </p>
            <p className="flex items-center gap-1 text-xs text-gold">
              <MapPin className="size-3.5" /> {currentUser.location}
            </p>
          </div>
          <Button variant="outline">Profili Önizle</Button>
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

      {/* Edit form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Profil Bilgileri</h3>
          <div className="space-y-1.5">
            <Label>Ad Soyad</Label>
            <Input defaultValue={currentUser.fullName} />
          </div>
          <div className="space-y-1.5">
            <Label>Ünvan</Label>
            <Input defaultValue={currentUser.title} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Şirket</Label>
              <Input defaultValue={currentUser.companyName} />
            </div>
            <div className="space-y-1.5">
              <Label>Konum</Label>
              <Input defaultValue={currentUser.location} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Hakkında</Label>
            <Textarea
              rows={4}
              defaultValue="Bodrum ve Ege bölgesinde lüks gayrimenkul danışmanlığı."
            />
          </div>
          <Button
            onClick={() => toast.success("Profil güncellendi")}
            className="bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            Kaydet
          </Button>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Uzmanlık Alanları</h3>
          <div className="space-y-1.5">
            <Label>Uzmanlık Bölgeleri</Label>
            <Input defaultValue="Bodrum, Yalıkavak, Türkbükü" />
          </div>
          <div className="space-y-1.5">
            <Label>Uzmanlık Tipleri</Label>
            <Input defaultValue="Villa, Arsa, Turizm" />
          </div>
          <div className="space-y-1.5">
            <Label>Web Sitesi</Label>
            <Input placeholder="https://" />
          </div>
          <div className="rounded-xl border border-gold/30 bg-gold/[0.05] p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <ShieldCheck className="size-4 text-gold" /> Doğrulanmış Profesyonel
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Kimliğiniz ve şirket bilgileriniz Bölgenin Uzmanı tarafından doğrulandı.
            </p>
          </div>
        </SurfaceCard>
      </div>

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
