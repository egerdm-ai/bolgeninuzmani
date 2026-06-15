import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Reply, ShieldCheck, X, MapPin, Send } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { StatusBadge } from "@/components/vault/badges";
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
  { key: "read", label: "Okundu" },
  { key: "answered", label: "Yanıtlandı" },
  { key: "rejected", label: "Reddedildi" },
];

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

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Detay Talepleri" subtitle="Portföy bilgilerinize erişim taleplerini yönetin." />

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

        {/* Detail panel */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {selected && (
            <SurfaceCard className="space-y-4 p-0">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h3 className="text-sm font-semibold text-foreground">Talep Detayı</h3>
                <StatusBadge label={requestStatusLabels[selected.status]} tone={requestStatusTones[selected.status]} />
              </div>
              <div className="space-y-4 px-5 pb-5">
                <div className="flex items-center gap-3">
                  <BrokerAvatar name={selected.requester.fullName} size="lg" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 font-semibold text-foreground">{selected.requester.fullName} <ShieldCheck className="size-3.5 text-gold" /></p>
                    <p className="text-xs text-muted-foreground">{selected.requester.title}</p>
                    <p className="text-xs text-gold">{selected.requester.companyName}</p>
                  </div>
                </div>

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
                    <p className="text-xs text-muted-foreground">Amaç</p>
                    <p className="font-medium text-foreground">{selected.purpose}</p>
                  </div>
                  <div className="rounded-lg bg-surface-2 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Bütçe</p>
                    <p className="font-medium text-foreground">{selected.budgetLabel ?? "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">Mesaj</p>
                  <p className="rounded-xl border border-border bg-surface-2 p-3 text-sm leading-relaxed text-secondary-foreground">{selected.message}</p>
                </div>

                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">Yanıtınız</p>
                  <Textarea rows={3} placeholder="Talebe bir not yazın..." />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => updateStatus(selected.id, "answered", "Yanıt gönderildi")} variant="outline" className="gap-1.5">
                    <Reply className="size-4" /> Yanıtla
                  </Button>
                  <Button onClick={() => updateStatus(selected.id, "rejected", "Talep reddedildi")} variant="outline" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10">
                    <X className="size-4" /> Reddet
                  </Button>
                  <Button onClick={() => updateStatus(selected.id, "approved", "Erişim verildi")} className="col-span-2 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                    <Send className="size-4" /> Bilgi Paylaş / Erişim Ver
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
