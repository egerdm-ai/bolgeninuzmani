import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  MapPin,
  Wallet,
  Home,
  Bookmark,
  Eye,
  Users,
  Check,
  AlertTriangle,
  Send,
  ArrowRight,
  ShieldCheck,
  Search,
  Flame,
  Lock,
  Globe,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { InfoPanel, SurfaceCard, KpiCard, EmptyStateCard } from "@/components/vault/cards";
import { StatusBadge, FeatureChip, RegionExpertBadge } from "@/components/vault/badges";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { urgencyLabels, urgencyTones } from "@/components/vault/network-search-card";
import {
  getNetworkSearchById,
  getMyMatchesForBuyerSearch,
} from "@/lib/mock/matching";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { useMySearches } from "@/lib/my-searches-store";
import { useSaved } from "@/lib/saved-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MatchResult } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/searches/$id")({
  component: NetworkSearchDetail,
});

function scoreTone(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 65) return "text-gold";
  return "text-warning";
}

function NetworkSearchDetail() {
  const { id } = Route.useParams();
  const { saveFromNetwork, isNetworkSaved } = useMySearches();
  const { isSaved, toggleSave } = useSaved();
  const search = getNetworkSearchById(id);

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

  const matches = getMyMatchesForBuyerSearch(search);
  const saved = isNetworkSaved(search.id);
  const owner = search.owner;

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
            <StatusBadge tone={urgencyTones[search.urgency]} label={urgencyLabels[search.urgency]} />
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-1.5", saved && "border-gold/40 text-gold")}
              onClick={() => saveFromNetwork(search)}
            >
              <Bookmark className={cn("size-4", saved && "fill-current")} />
              {saved ? "Kayıtlı" : "Arayışı Kaydet"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Portföyümden Eşleşen" value={String(matches.length)} icon={Sparkles} />
        <KpiCard label="Ağ Eşleşmesi" value={String(search.matchCount)} icon={Flame} />
        <KpiCard label="Görüntülenme" value={String(search.views)} icon={Eye} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Suggested action */}
          <SurfaceCard className="border-gold/30 bg-gold/[0.05]">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-semibold text-foreground">VAULT Asistan Önerisi</p>
                <p className="mt-1 text-sm text-secondary-foreground">
                  {matches.length > 0 ? (
                    <>
                      Bu arayış portföylerinizden{" "}
                      <span className="font-semibold text-gold">{matches.length} tanesiyle</span> eşleşiyor.
                      Portföyünüzü <span className="font-semibold text-gold">{owner.fullName}</span> isimli profesyonele
                      önerebilirsiniz.
                    </>
                  ) : (
                    <>
                      Doğrudan eşleşen portföyünüz yok. Bu bölgedeki uzmanları veya benzer portföyleri
                      inceleyebilirsiniz.
                    </>
                  )}
                </p>
              </div>
            </div>
          </SurfaceCard>

          {/* My matching portfolios */}
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
              Benim Portföylerimle Eşleşme
            </h2>
            {matches.length === 0 ? (
              <EmptyStateCard
                icon={Home}
                title="Doğrudan eşleşen portföyünüz yok"
                description="Bu bölgede portföy ekleyebilir veya benzer portföyleri inceleyebilirsiniz."
                action={
                  <Button asChild variant="outline" className="gap-1.5">
                    <Link to="/dashboard/search" search={{ region: search.region }}>
                      <Search className="size-4" /> Benzer Portföy Ara
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {matches.map((m) => (
                  <MyPortfolioMatchCard
                    key={m.portfolio.id}
                    match={m}
                    ownerName={owner.fullName}
                    saved={isSaved(m.portfolio.id)}
                    onSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Created by */}
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Arayışı Oluşturan</h2>
            <SurfaceCard className="p-4">
              <div className="flex items-start gap-3">
                <BrokerAvatar name={owner.fullName} src={owner.avatarUrl || undefined} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/dashboard/professionals/$id"
                      params={{ id: owner.id }}
                      className="truncate font-display text-base font-semibold text-foreground transition-colors hover:text-gold"
                    >
                      {owner.fullName}
                    </Link>
                    <ShieldCheck className="size-4 shrink-0 text-gold" />
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{owner.title}</p>
                  <p className="truncate text-sm text-gold">{owner.companyName}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {owner.expertiseRegions.slice(0, 3).map((r) => (
                      <RegionExpertBadge key={r} region={r} />
                    ))}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0 gap-1.5">
                  <Link to="/dashboard/professionals/$id" params={{ id: owner.id }}>
                    Profili Gör <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </SurfaceCard>
          </div>

          {/* Footer actions */}
          <div className="flex flex-wrap gap-2">
            {matches.length > 0 && (
              <Button
                className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
                onClick={() =>
                  toast.success("Portföy önerisi gönderildi (mock)", {
                    description: `${owner.fullName} bu arayış için portföyünüzü inceleyecek.`,
                  })
                }
              >
                <Send className="size-4" /> Portföy Öner
              </Button>
            )}
            <Button asChild variant="outline" className="gap-1.5">
              <Link to="/dashboard/professionals/$id" params={{ id: owner.id }}>
                <Users className="size-4" /> Profesyoneli Gör
              </Link>
            </Button>
            <Button
              variant="outline"
              className={cn("gap-1.5", saved && "border-gold/40 text-gold")}
              onClick={() => saveFromNetwork(search)}
            >
              <Bookmark className={cn("size-4", saved && "fill-current")} /> Arayışı Kaydet
            </Button>
            <Button asChild variant="outline" className="gap-1.5">
              <Link to="/dashboard/search" search={{ region: search.region }}>
                <Search className="size-4" /> Benzer Portföy Ara
              </Link>
            </Button>
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
              <Row icon={Flame} label="Aciliyet" value={urgencyLabels[search.urgency]} />
              <Row
                icon={search.visibility === "private" ? Lock : Globe}
                label="Görünürlük"
                value={search.visibility === "private" ? "Sadece Ben" : "Network'e Açık"}
              />
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
        </div>
      </div>
    </PageContainer>
  );
}

function MyPortfolioMatchCard({
  match,
  ownerName,
  saved,
  onSave,
}: {
  match: MatchResult;
  ownerName: string;
  saved?: boolean;
  onSave?: (id: string) => void;
}) {
  const { portfolio: p, score, matched, missing, explanation } = match;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant transition-colors hover:border-border-strong">
      <div className="flex gap-4 p-4">
        <Link
          to="/dashboard/portfolios/$id"
          params={{ id: p.id }}
          className="relative size-28 shrink-0 overflow-hidden rounded-xl"
        >
          <img src={p.coverImage} alt={p.title} loading="lazy" className="size-full object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to="/dashboard/portfolios/$id"
                params={{ id: p.id }}
                className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-gold"
              >
                {p.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {portfolioTypeLabels[p.type]} · ~{p.regionLabel}
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-gold">
                {formatPrice(p.price, p.currency)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className={cn("font-display text-2xl font-bold leading-none", scoreTone(score))}>
                %{score}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Uyum</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2">
        <div className="bg-surface px-4 py-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">Neden Uyumlu?</p>
          <ul className="space-y-1">
            {matched.slice(0, 5).map((m, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                <Check className="size-3 shrink-0 text-success" /> {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-warning">Eksik kriterler</p>
          <ul className="space-y-1">
            {missing.slice(0, 4).map((m, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="size-3 shrink-0 text-warning" /> {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-gold/[0.04] px-4 py-3">
        <p className="flex items-start gap-1.5 text-xs text-secondary-foreground">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-gold" />
          <span>
            <span className="font-semibold text-gold">VAULT Asistan: </span>
            {explanation}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border p-3">
        <Button
          size="sm"
          className="flex-1 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          onClick={() =>
            toast.success("Portföy önerildi (mock)", {
              description: `${ownerName} için ${p.title} önerildi.`,
            })
          }
        >
          <Send className="size-3.5" /> Bu Portföyü Öner
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link to="/dashboard/portfolios/$id" params={{ id: p.id }}>
            Portföyü Gör
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn("gap-1.5", saved && "border-gold/40 text-gold")}
          onClick={() => onSave?.(p.id)}
        >
          <Bookmark className={cn("size-3.5", saved && "fill-current")} />
        </Button>
      </div>
    </div>
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
