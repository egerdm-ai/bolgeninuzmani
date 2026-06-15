import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  Search,
  FolderLock,
  Eye,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Activity as ActivityIcon,
  Bookmark,
  Target,
  Download,
  MapPin,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { KpiCard, QuickActionCard, InfoPanel, SurfaceCard } from "@/components/vault/cards";
import { AIButton } from "@/components/vault/ai-button";
import { Button } from "@/components/ui/button";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { StatusBadge } from "@/components/vault/badges";
import { PortfolioCard } from "@/components/vault/portfolio-card";
import { DetailRequestModal } from "@/components/vault/detail-request-modal";
import {
  activities,
  currentUser,
  dashboardKpis,
  detailRequests,
  myPortfolios,
  propertyImages,
} from "@/lib/mock/data";
import { networkAnalytics } from "@/lib/mock/matching";
import { formatNumber, requestStatusLabels, requestStatusTones } from "@/lib/format";
import { useSaved } from "@/lib/saved-store";
import type { Portfolio } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { isSaved, toggleSave } = useSaved();
  const [requestTarget, setRequestTarget] = useState<Portfolio | null>(null);
  const recent = myPortfolios.filter((p) => p.status === "active").slice(0, 3);
  const incoming = detailRequests.slice(0, 3);

  return (
    <PageContainer className="space-y-7">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border shadow-elegant">
        <img src={propertyImages.villa1} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="relative flex flex-col gap-6 p-7 lg:p-10">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold ring-1 ring-inset ring-gold/25">
              <Sparkles className="size-3.5" /> Özel Lüks Gayrimenkul Ağı
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground lg:text-5xl">
              Hoş geldiniz, {currentUser.fullName.split(" ")[0]}
            </h1>
            <p className="mt-3 text-base text-secondary-foreground">
              Lüks portföylerinizi yönetin, harita üzerinde keşfedin ve doğrulanmış ağınızla güvenle paylaşın.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Link to="/dashboard/portfolios/new"><Plus className="size-4" /> Portföy Oluştur</Link>
              </Button>
              <AIButton />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/dashboard/portfolios/new"><QuickActionCard label="Portföy Oluştur" description="Yeni lüks portföy ekle" icon={Plus} accent /></Link>
        <Link to="/dashboard/buyer-searches/new"><QuickActionCard label="Yeni Arayış" description="Alıcı için portföy eşleştir" icon={Target} /></Link>
        <Link to="/dashboard/search"><QuickActionCard label="Portföy Ara" description="Harita üzerinde keşfet" icon={Search} /></Link>
        <Link to="/dashboard/assistant"><QuickActionCard label="VAULT Asistan" description="Akıllı eşleştirme & değerleme" icon={Sparkles} /></Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Aktif Portföy" value={formatNumber(networkAnalytics.activePortfolios)} delta="+3 bu ay" icon={FolderLock} />
        <KpiCard label="Aktif Arayış" value={formatNumber(networkAnalytics.activeSearches)} delta="+2 bu hafta" icon={Target} />
        <KpiCard label="Eşleşen Arayışlar" value={formatNumber(networkAnalytics.matchedSearches)} delta="Yeni eşleşmeler" icon={Sparkles} />
        <KpiCard label="Gelen Detay Talepleri" value={formatNumber(networkAnalytics.detailRequests)} delta="+5 yeni" icon={Send} />
        <KpiCard label="PDF İndirme" value={formatNumber(networkAnalytics.pdfDownloads)} delta="+18 bu ay" icon={Download} />
        <KpiCard label="Profil Görüntülenme" value={formatNumber(networkAnalytics.profileViews)} delta="+12% bu ay" icon={Eye} />
        <KpiCard label="Kaydedilen Portföy" value={formatNumber(dashboardKpis.savedPortfolios)} delta="+4 bu ay" icon={Bookmark} />
        <KpiCard label="En Aktif Bölge" value={networkAnalytics.topRegion} delta="Yüksek talep" deltaTone="muted" icon={MapPin} />
      </div>

      <div className="grid gap-7 lg:grid-cols-3">
        <div className="space-y-7 lg:col-span-2">
          {/* Recent portfolios */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">Son Portföyleriniz</h2>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-gold hover:text-gold-light">
                <Link to="/dashboard/portfolios">Tümünü Gör <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recent.map((p) => (
                <PortfolioCard key={p.id} portfolio={p} saved={isSaved(p.id)} onToggleSave={toggleSave} />
              ))}
            </div>
          </div>

          {/* Incoming requests */}
          <InfoPanel
            title="Gelen Detay Talepleri"
            action={
              <Button asChild variant="ghost" size="sm" className="gap-1 text-gold hover:text-gold-light">
                <Link to="/dashboard/detail-requests">Tümü <ArrowRight className="size-4" /></Link>
              </Button>
            }
          >
            <ul className="space-y-3">
              {incoming.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
                  <BrokerAvatar name={r.requester.fullName} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{r.requester.fullName}</p>
                      <StatusBadge label={requestStatusLabels[r.status]} tone={requestStatusTones[r.status]} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{r.portfolio.title}</p>
                  </div>
                  <span className="hidden whitespace-nowrap text-xs text-muted-foreground sm:block">{r.createdAt}</span>
                </li>
              ))}
            </ul>
          </InfoPanel>
        </div>

        {/* Right rail */}
        <div className="space-y-7">
          {/* VAULT Asistan CTA */}
          <SurfaceCard className="border-gold/30 bg-gold/[0.05]">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-gold text-primary-foreground">
              <Sparkles className="size-5" />
            </span>
            <h3 className="mt-3 font-display text-lg font-semibold text-foreground">VAULT Asistan</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Arayıştan portföy bulun, portföyü arayışlarla eşleştirin ve bölge uzmanı önerileri alın.
            </p>
            <Button asChild className="mt-4 w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Link to="/dashboard/assistant"><Sparkles className="size-4" /> Asistan ile Eşleştir</Link>
            </Button>
          </SurfaceCard>

          {/* Activity */}
          <InfoPanel title="Son Aktiviteler">
            <ul className="space-y-4">
              {activities.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-gold">
                    {a.type === "request" && <Send className="size-3.5" />}
                    {a.type === "view" && <Eye className="size-3.5" />}
                    {a.type === "save" && <Bookmark className="size-3.5" />}
                    {a.type === "approve" && <CheckCircle2 className="size-3.5" />}
                    {a.type === "publish" && <ActivityIcon className="size-3.5" />}
                  </span>
                  <div>
                    <p className="text-sm text-secondary-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </InfoPanel>
        </div>
      </div>

      <DetailRequestModal portfolio={requestTarget} open={!!requestTarget} onOpenChange={(o) => !o && setRequestTarget(null)} />
    </PageContainer>
  );
}
