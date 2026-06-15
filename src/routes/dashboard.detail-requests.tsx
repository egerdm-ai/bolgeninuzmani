import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Reply,
  ShieldCheck,
  X,
  MapPin,
  Send,
  Check,
  TrendingUp,
  Clock,
  Wallet,
  Target,
  History,
  Sparkles,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { StatusBadge, RegionExpertBadge } from "@/components/vault/badges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { detailRequests } from "@/lib/mock/data";
import { formatPrice, requestStatusLabels, requestStatusTones } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DetailRequest, DetailRequestStatus } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/detail-requests")({
  component: DetailRequestsInbox,
});

const tabs: { key: DetailRequestStatus | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "new", label: "Yeni" },
  { key: "read", label: "İncelendi" },
  { key: "approved", label: "Bilgi Paylaşıldı" },
  { key: "rejected", label: "Reddedildi" },
];

const pipeline: { key: DetailRequestStatus; label: string }[] = [
  { key: "new", label: "Yeni" },
  { key: "read", label: "İncelendi" },
  { key: "approved", label: "Bilgi Paylaşıldı" },
];

function StatusPipeline({ status }: { status: DetailRequestStatus }) {
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/[0.06] px-3 py-2 text-sm font-medium text-destructive">
        <X className="size-4" /> Talep reddedildi
      </div>
    );
  }
  const order: DetailRequestStatus[] = ["new", "read", "answered", "approved"];
  const currentIdx = order.indexOf(status);
  return (
    <div className="flex items-center">
      {pipeline.map((stage, i) => {
        const stageIdx = order.indexOf(stage.key);
        const done = currentIdx >= stageIdx;
        const active = status === stage.key;
        return (
          <div key={stage.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done ? "bg-gradient-gold text-primary-foreground" : "bg-surface-3 text-muted-foreground",
                  active && "ring-2 ring-gold/40 ring-offset-2 ring-offset-surface",
                )}
              >
                {done && currentIdx > stageIdx ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className={cn("text-[10px] font-medium", done ? "text-gold" : "text-muted-foreground")}>{stage.label}</span>
            </div>
            {i < pipeline.length - 1 && (
              <div className={cn("mx-1 h-px flex-1", currentIdx > stageIdx ? "bg-gold" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailRequestsInbox() {
  const [requests, setRequests] = useState<DetailRequest[]>(detailRequests);
  const [tab, setTab] = useState<DetailRequestStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string>(detailRequests[0].id);

  const filtered = tab === "all" ? requests : requests.filter((r) => r.status === tab);
  const selected = requests.find((r) => r.id === selectedId) ?? filtered[0];

  const updateStatus = (id: string, status: DetailRequestStatus, msg: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(msg);
  };

  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Detay Talepleri"
        subtitle="Her detay talebi bir fırsattır. Talepleri inceleyin, yanıtlayın ve bilgi paylaşın."
      />

      {/* Opportunity summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Açık fırsat", value: requests.filter((r) => r.status !== "rejected").length, icon: Target },
          { label: "Yeni", value: newCount, icon: Sparkles },
          { label: "Bilgi paylaşıldı", value: requests.filter((r) => r.status === "approved").length, icon: Check },
          { label: "Ort. yanıt", value: "~2 sa", icon: Clock },
        ].map((s) => (
          <SurfaceCard key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</span>
              <s.icon className="size-4 text-gold" />
            </div>
            <div className="mt-2 font-display text-2xl font-semibold text-foreground">{s.value}</div>
          </SurfaceCard>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {tabs.map((t) => {
          const count = t.key === "all" ? requests.length : requests.filter((r) => r.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.key ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11px]", tab === t.key ? "bg-primary-foreground/20" : "bg-surface-3")}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Bu kategoride talep yok.</p>}
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                selected?.id === r.id ? "border-gold/50 bg-gold/[0.06]" : "border-border bg-surface hover:border-border-strong",
              )}
            >
              <BrokerAvatar name={r.requester.fullName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{r.requester.fullName}</p>
                  <ShieldCheck className="size-3.5 shrink-0 text-gold" />
                </div>
                <p className="truncate text-xs text-muted-foreground">{r.requester.companyName} · {r.portfolio.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-secondary-foreground">{r.message}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge label={requestStatusLabels[r.status]} tone={requestStatusTones[r.status]} />
                <span className="text-[11px] text-muted-foreground">{r.createdAt}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Opportunity panel */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {selected && (
            <SurfaceCard className="space-y-4 p-0">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Target className="size-4 text-gold" /> Fırsat Detayı
                </h3>
                <StatusBadge label={requestStatusLabels[selected.status]} tone={requestStatusTones[selected.status]} />
              </div>

              <div className="space-y-4 px-5 pb-5">
                {/* Pipeline */}
                <StatusPipeline status={selected.status} />

                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <BrokerAvatar name={selected.requester.fullName} size="lg" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 font-semibold text-foreground">{selected.requester.fullName} <ShieldCheck className="size-3.5 text-gold" /></p>
                    <p className="text-xs text-muted-foreground">{selected.requester.title}</p>
                    <p className="text-xs text-gold">{selected.requester.companyName}</p>
                  </div>
                </div>

                {selected.requester.expertiseRegions[0] && (
                  <RegionExpertBadge region={selected.requester.expertiseRegions[0]} />
                )}

                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
                  <img src={selected.portfolio.coverImage} alt="" className="h-12 w-16 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{selected.portfolio.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3 text-gold" /> ~{selected.portfolio.regionLabel}</p>
                    <p className="text-xs text-gold">{formatPrice(selected.portfolio.price, selected.portfolio.currency)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-surface-2 px-3 py-2">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Target className="size-3 text-gold" /> Amaç</p>
                    <p className="font-medium text-foreground">{selected.purpose}</p>
                  </div>
                  <div className="rounded-lg bg-surface-2 px-3 py-2">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Wallet className="size-3 text-gold" /> Bütçe</p>
                    <p className="font-medium text-foreground">{selected.budgetLabel ?? "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">Mesaj</p>
                  <p className="rounded-xl border border-border bg-surface-2 p-3 text-sm leading-relaxed text-secondary-foreground">{selected.message}</p>
                </div>

                {/* Activity / history placeholder */}
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <History className="size-3.5 text-gold" /> Geçmiş
                  </p>
                  <ol className="relative space-y-3 pl-5">
                    <span className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
                    {[
                      { text: "Talep alındı", time: selected.createdAt },
                      { text: "Profilin incelendi", time: "1 saat önce" },
                      { text: "Yanıt bekleniyor", time: "şimdi" },
                    ].map((e, i) => (
                      <li key={i} className="relative flex items-start gap-2">
                        <span className="absolute -left-[18px] top-1 size-2 rounded-full bg-gold/40 ring-2 ring-surface" />
                        <TrendingUp className="mt-0.5 size-3 shrink-0 text-gold" />
                        <div>
                          <p className="text-xs text-secondary-foreground">{e.text}</p>
                          <p className="text-[11px] text-muted-foreground">{e.time}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">Yanıtınız</p>
                  <Textarea rows={3} placeholder="Talebe bir not yazın..." />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => updateStatus(selected.id, "read", "Yanıt gönderildi")} variant="outline" className="gap-1.5">
                    <Reply className="size-4" /> Yanıtla
                  </Button>
                  <Button onClick={() => updateStatus(selected.id, "rejected", "Talep reddedildi")} variant="outline" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10">
                    <X className="size-4" /> Reddet
                  </Button>
                  <Button onClick={() => updateStatus(selected.id, "approved", "Bilgiler paylaşıldı")} className="col-span-2 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                    <Send className="size-4" /> Bilgi Paylaş
                  </Button>
                </div>
              </div>
            </SurfaceCard>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
