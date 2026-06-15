import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Sparkles,
  MapPin,
  Wallet,
  Home,
  Bookmark,
  Eye,
  MessageSquare,
  Users,
  Bell,
  Pencil,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { InfoPanel, SurfaceCard, KpiCard, EmptyStateCard } from "@/components/vault/cards";
import { StatusBadge, FeatureChip } from "@/components/vault/badges";
import { MatchExplanationCard } from "@/components/vault/match-explanation-card";
import { RegionExpertCard } from "@/components/vault/region-expert-card";
import {
  buyerSearchStatusLabels,
  buyerSearchStatusTones,
} from "@/components/vault/buyer-search-card";
import {
  getBuyerSearchById,
  getMatchesForSearch,
  getExpertsForSearch,
} from "@/lib/mock/matching";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import { useSaved } from "@/lib/saved-store";
import { useDetailRequest } from "@/lib/detail-request-store";

export const Route = createFileRoute("/dashboard/searches/$id")({
  component: SearchDetail,
});

function SearchDetail() {
  const { id } = Route.useParams();
  const { isSaved, toggleSave } = useSaved();
  const { open: openRequest } = useDetailRequest();
  const search = getBuyerSearchById(id);

  if (!search) {
    return (
      <PageContainer>
        <EmptyStateCard
          icon={Sparkles}
          title="Arayış bulunamadı"
          description="Bu arayış kaldırılmış veya taşınmış olabilir."
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard/searches">Arayışlara dön</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const q = {
    region: search.region,
    city: search.city,
    type: search.type,
    budgetMin: search.budgetMin,
    budgetMax: search.budgetMax,
    rooms: search.rooms,
    mustHave: search.mustHave,
  };
  const matches = getMatchesForSearch(q);
  const experts = getExpertsForSearch(q);
  const notify = search.notify ?? "instant";

  const notificationHistory = [
    {
      text: `${search.region} bölgesinde yeni eşleşen portföy eklendi.`,
      time: search.lastMatchAt ?? "3 saat önce",
    },
    { text: `${matches.length} portföy bu arayışla yeniden eşleşti.`, time: "1 gün önce" },
    { text: "Arayış oluşturuldu ve bildirimler etkinleştirildi.", time: search.createdAt },
  ];

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={search.title}
        subtitle={search.notes}
        breadcrumbs={[
          { label: "Arayışlar", to: "/dashboard/searches" },
          { label: search.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              label={buyerSearchStatusLabels[search.status]}
              tone={buyerSearchStatusTones[search.status]}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => toast.info("Arayış düzenleme (mock)", { description: search.title })}
            >
              <Pencil className="size-4" /> Düzenle
            </Button>
          </div>
        }
      />

      {/* Analytics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Eşleşen Portföy" value={String(matches.length)} icon={Sparkles} />
        <KpiCard label="Eşleşen Uzman" value={String(experts.length)} icon={Users} />
        <KpiCard label="Görüntülenme" value={String(search.views)} icon={Eye} />
        <KpiCard label="Yanıt" value={String(search.responses)} icon={MessageSquare} />
        <KpiCard label="Kaydeden" value={String(search.savedBy)} icon={Bookmark} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* AI summary */}
          <SurfaceCard className="border-gold/30 bg-gold/[0.05]">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-semibold text-foreground">VAULT Asistan Eşleşme Özeti</p>
                <p className="mt-1 text-sm text-secondary-foreground">
                  Bu arayış için <span className="font-semibold text-gold">{matches.length} uygun portföy</span> ve{" "}
                  <span className="font-semibold text-gold">{experts.length} bölge uzmanı</span> bulundu. En güçlü
                  eşleşmeler {search.region} bölgesinde yoğunlaşıyor.
                </p>
              </div>
            </div>
          </SurfaceCard>

          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Eşleşen Portföyler</h2>
            {matches.length === 0 ? (
              <EmptyStateCard
                icon={Home}
                title="Uygun portföy bulunamadı"
                description="Şu an kriterlere tam uyan portföy yok. Bölge uzmanlarına ulaşmanızı öneririz."
              />
            ) : (
              <div className="space-y-4">
                {matches.map((m) => (
                  <MatchExplanationCard
                    key={m.portfolio.id}
                    match={m}
                    saved={isSaved(m.portfolio.id)}
                    onSave={toggleSave}
                    onRequestDetail={openRequest}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Önerilen Bölge Uzmanları</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {experts.map((e) => (
                <RegionExpertCard key={e.id} professional={e} regionName={search.region} />
              ))}
            </div>
          </div>
        </div>

        {/* Right rail — summary */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <InfoPanel title="Arayış Özeti">
            <dl className="space-y-3 text-sm">
              <Row icon={MapPin} label="Bölge" value={`${search.region} / ${search.city}`} />
              <Row icon={Home} label="Tip" value={portfolioTypeLabels[search.type]} />
              <Row
                icon={Wallet}
                label="Bütçe"
                value={`${formatPrice(search.budgetMin, search.currency)} – ${formatPrice(search.budgetMax, search.currency)}`}
              />
              {search.rooms && <Row icon={Home} label="Oda" value={search.rooms} />}
              <Row icon={Bell} label="Bildirim" value={notificationFrequencyLabels[notify]} />
            </dl>

            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Olmazsa olmaz
              </p>
              <div className="flex flex-wrap gap-1.5">
                {search.mustHave.map((f) => (
                  <FeatureChip key={f} label={f} />
                ))}
              </div>
            </div>
            {search.niceToHave.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Olursa iyi olur
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {search.niceToHave.map((f) => (
                    <FeatureChip key={f} label={f} />
                  ))}
                </div>
              </div>
            )}
          </InfoPanel>

          {/* Notification history */}
          <InfoPanel title="Bildirim Geçmişi">
            <ul className="space-y-3 text-sm">
              {notificationHistory.map((n, i) => (
                <li key={i} className="flex gap-2">
                  <Bell className="mt-0.5 size-3.5 shrink-0 text-gold" />
                  <div>
                    <p className="text-secondary-foreground">{n.text}</p>
                    <p className="text-[11px] text-muted-foreground">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </InfoPanel>

          <Button
            onClick={() => toast.success("Arayış kaydedildi", { description: search.title })}
            variant="outline"
            className="w-full gap-1.5"
          >
            <Bookmark className="size-4" /> Kaydedilen Arayış
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5 text-gold" /> {label}
      </dt>
      <dd className="text-right font-medium text-secondary-foreground">{value}</dd>
    </div>
  );
}
