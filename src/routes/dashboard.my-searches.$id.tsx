import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  MapPin,
  Wallet,
  Home,
  Bell,
  Pencil,
  Users,
  Eye,
  MessageSquare,
  Bookmark,
  Check,
  X,
  Plus,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoPanel, SurfaceCard, KpiCard, EmptyStateCard } from "@/components/vault/cards";
import { StatusBadge, FeatureChip } from "@/components/vault/badges";
import { MatchExplanationCard } from "@/components/vault/match-explanation-card";
import { RegionExpertCard } from "@/components/vault/region-expert-card";
import {
  buyerSearchStatusLabels,
  buyerSearchStatusTones,
} from "@/components/vault/buyer-search-card";
import { getMatchesForSearch, getExpertsForSearch } from "@/lib/mock/matching";
import { formatPrice, portfolioTypeLabels } from "@/lib/format";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import type { BuyerSearchStatus, NotificationFrequency } from "@/lib/mock/types";
import { useMySearches } from "@/lib/my-searches-store";
import { useSaved } from "@/lib/saved-store";
import { useDetailRequest } from "@/lib/detail-request-store";
import { cn } from "@/lib/utils";

type SearchParams = { mode?: "edit"; tab?: "matches" };

export const Route = createFileRoute("/dashboard/my-searches/$id")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    mode: s.mode === "edit" ? "edit" : undefined,
    tab: s.tab === "matches" ? "matches" : undefined,
  }),
  component: MySearchDetail,
});

const freqOptions: NotificationFrequency[] = ["instant", "daily", "weekly", "off"];

function MySearchDetail() {
  const { id } = Route.useParams();
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { getById, update, setStatus, setNotify } = useMySearches();
  const { isSaved, toggleSave } = useSaved();
  const { open: openRequest } = useDetailRequest();

  const search = getById(id);
  const editing = mode === "edit";

  // local edit buffer
  const [budgetMin, setBudgetMin] = useState(search?.budgetMin ?? 0);
  const [budgetMax, setBudgetMax] = useState(search?.budgetMax ?? 0);
  const [mustHave, setMustHave] = useState<string[]>(search?.mustHave ?? []);
  const [newFeature, setNewFeature] = useState("");
  const [freq, setFreq] = useState<NotificationFrequency>(search?.notify ?? "instant");
  const [status, setLocalStatus] = useState<BuyerSearchStatus>(search?.status ?? "active");

  if (!search) {
    return (
      <PageContainer>
        <EmptyStateCard
          icon={Sparkles}
          title="Arayış bulunamadı"
          description="Bu arayış kaldırılmış veya henüz oluşturulmamış olabilir."
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard/my-searches">Arayışlarım'a dön</Link>
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
    { text: `${search.region} villa arayışınızla yüksek uyumlu yeni bir portföy eklendi.`, time: search.lastMatchAt ?? "3 saat önce" },
    { text: "Fiyat kriterlerinize uygun 2 portföy güncellendi.", time: "1 gün önce" },
    { text: "Bu arayış için yeni bir bölge uzmanı aktif oldu.", time: "2 gün önce" },
    { text: "Arayış oluşturuldu ve bildirimler etkinleştirildi.", time: search.createdAt },
  ];

  const enterEdit = () => navigate({ to: "/dashboard/my-searches/$id", params: { id }, search: { mode: "edit" } });
  const exitEdit = () => navigate({ to: "/dashboard/my-searches/$id", params: { id }, search: {} });

  const saveEdits = () => {
    update(id, { budgetMin, budgetMax, mustHave, notify: freq, status });
    toast.success("Arayış güncellendi", { description: search.title });
    exitEdit();
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={search.title}
        subtitle={search.clientLabel ?? search.clientType}
        breadcrumbs={[
          { label: "Arayışlarım", to: "/dashboard/my-searches" },
          { label: search.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              label={buyerSearchStatusLabels[search.status]}
              tone={buyerSearchStatusTones[search.status]}
            />
            {editing ? (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={exitEdit}>
                <X className="size-4" /> Vazgeç
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={enterEdit}>
                <Pencil className="size-4" /> Düzenle
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Eşleşen Portföy" value={String(matches.length)} icon={Sparkles} />
        <KpiCard label="Bölge Uzmanı" value={String(experts.length)} icon={Users} />
        <KpiCard label="Görüntülenme" value={String(search.views)} icon={Eye} />
        <KpiCard label="Yanıt" value={String(search.responses)} icon={MessageSquare} />
      </div>

      {/* Edit panel */}
      {editing && (
        <InfoPanel title="Arayışı Düzenle">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Bütçe min</Label>
                <Input type="number" value={budgetMin || ""} onChange={(e) => setBudgetMin(Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Bütçe max</Label>
                <Input type="number" value={budgetMax || ""} onChange={(e) => setBudgetMax(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Olmazsa olmaz özellikler</Label>
              <div className="flex flex-wrap gap-1.5">
                {mustHave.map((f) => (
                  <button
                    key={f}
                    onClick={() => setMustHave((p) => p.filter((x) => x !== f))}
                    className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold"
                  >
                    {f} <X className="size-3" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFeature.trim()) {
                      setMustHave((p) => [...p, newFeature.trim()]);
                      setNewFeature("");
                    }
                  }}
                  placeholder="Özellik ekle ve Enter'a basın"
                  className="h-9"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    if (newFeature.trim()) {
                      setMustHave((p) => [...p, newFeature.trim()]);
                      setNewFeature("");
                    }
                  }}
                >
                  <Plus className="size-4" /> Ekle
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bildirim sıklığı</Label>
              <div className="grid grid-cols-4 gap-2">
                {freqOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFreq(f)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                      freq === f ? "border-gold/40 bg-gold/10 text-gold" : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {notificationFrequencyLabels[f]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Durum</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLocalStatus("active")}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    status !== "closed" ? "border-gold/40 bg-gold/10 text-gold" : "border-border bg-surface-2 text-muted-foreground",
                  )}
                >
                  Aktif
                </button>
                <button
                  onClick={() => setLocalStatus("closed")}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    status === "closed" ? "border-gold/40 bg-gold/10 text-gold" : "border-border bg-surface-2 text-muted-foreground",
                  )}
                >
                  Pasif
                </button>
              </div>
            </div>

            <Button onClick={saveEdits} className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Check className="size-4" /> Değişiklikleri Kaydet
            </Button>
          </div>
        </InfoPanel>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* AI summary */}
          <SurfaceCard className="border-gold/30 bg-gold/[0.05]">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-semibold text-foreground">AI Eşleşme Özeti</p>
                <p className="mt-1 text-sm text-secondary-foreground">
                  Bu arayış için <span className="font-semibold text-gold">{matches.length} uygun portföy</span> ve{" "}
                  <span className="font-semibold text-gold">{experts.length} bölge uzmanı</span> bulundu. En güçlü
                  eşleşmeler {search.region} bölgesinde yoğunlaşıyor.
                </p>
              </div>
            </div>
          </SurfaceCard>

          {/* Matching portfolios */}
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Eşleşen Portföyler</h2>
            {matches.length === 0 ? (
              <EmptyStateCard
                icon={Home}
                title="Uygun portföy bulunamadı"
                description="Kriterlere tam uyan portföy yok. Bölge uzmanlarına ulaşmanızı öneririz."
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

          {/* Region experts */}
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Bölge Uzmanı Önerileri</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {experts.map((e) => (
                <RegionExpertCard key={e.id} professional={e} regionName={search.region} />
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
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

            {search.notes && (
              <div className="mt-4 rounded-xl border border-border bg-surface-2 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Müşteri notu</p>
                <p className="text-sm text-secondary-foreground">{search.notes}</p>
              </div>
            )}

            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Olmazsa olmaz</p>
              <div className="flex flex-wrap gap-1.5">
                {search.mustHave.map((f) => (
                  <FeatureChip key={f} label={f} />
                ))}
              </div>
            </div>

            {!editing && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={enterEdit}>
                  <Pencil className="size-3.5" /> Düzenle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setStatus(id, search.status === "closed" ? "active" : "closed")}
                >
                  {search.status === "closed" ? "Aktifleştir" : "Pasifleştir"}
                </Button>
              </div>
            )}
          </InfoPanel>

          {/* Notification frequency quick toggle */}
          <InfoPanel title="Bildirim Sıklığı">
            <div className="grid grid-cols-2 gap-2">
              {freqOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setNotify(id, f)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    notify === f ? "border-gold/40 bg-gold/10 text-gold" : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {notificationFrequencyLabels[f]}
                </button>
              ))}
            </div>
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

          <Button asChild variant="outline" className="w-full gap-1.5">
            <Link to="/dashboard/my-searches">
              <Bookmark className="size-4" /> Tüm Arayışlarım
            </Link>
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
