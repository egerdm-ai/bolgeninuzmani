import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, ArrowDownWideNarrow, FolderLock, Eye, Send, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { AIButton } from "@/components/vault/ai-button";
import { PortfolioListRow } from "@/components/vault/portfolio-list-row";
import { myPortfolios } from "@/lib/mock/data";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PortfolioStatus } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/portfolios/")({
  component: MyPortfolios,
});

const tabs: { key: PortfolioStatus | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "active", label: "Aktif" },
  { key: "draft", label: "Taslak" },
  { key: "passive", label: "Pasif" },
  { key: "sold_or_rented", label: "Satıldı / Kiralandı" },
];

function MyPortfolios() {
  const [tab, setTab] = useState<PortfolioStatus | "all">("all");
  const [sortByViews, setSortByViews] = useState(false);
  const base = tab === "all" ? myPortfolios : myPortfolios.filter((p) => p.status === tab);
  const filtered = sortByViews ? [...base].sort((a, b) => b.viewCount - a.viewCount) : base;

  const totalViews = myPortfolios.reduce((s, p) => s + p.viewCount, 0);
  const totalRequests = myPortfolios.reduce((s, p) => s + p.requestCount, 0);
  const activeCount = myPortfolios.filter((p) => p.status === "active").length;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Portföylerim"
        subtitle="Tüm lüks portföylerinizi tek yerden yönetin."
        actions={
          <>
            <AIButton />
            <Button asChild className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
              <Link to="/dashboard/portfolios/new"><Plus className="size-4" /> Portföy Oluştur</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Toplam Portföy" value={String(myPortfolios.length)} icon={FolderLock} />
        <KpiCard label="Aktif Portföy" value={String(activeCount)} icon={CheckCircle2} />
        <KpiCard label="Görüntülenme" value={formatNumber(totalViews)} icon={Eye} />
        <KpiCard label="Detay Talebi" value={String(totalRequests)} icon={Send} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface-2 p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.key ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5", sortByViews && "border-gold/40 text-gold")}
          onClick={() => {
            setSortByViews((v) => !v);
            toast.info(sortByViews ? "Varsayılan sıralama" : "Görüntülenmeye göre sıralandı");
          }}
        >
          <ArrowDownWideNarrow className="size-4" /> {sortByViews ? "En çok görüntülenen" : "Sırala"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-elegant">
        <div className="hidden items-center gap-4 border-b border-border bg-surface-2/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:flex">
          <span className="w-20" />
          <span className="flex-1">Portföy</span>
          <span className="w-28 text-right">Fiyat</span>
          <span className="w-24 text-center">Görüntülenme</span>
          <span className="w-20 text-center">Talep</span>
          <span className="w-28 text-center">Durum</span>
          <span className="w-[120px]" />
        </div>
        {filtered.length > 0 ? (
          filtered.map((p) => <PortfolioListRow key={p.id} portfolio={p} />)
        ) : (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">Bu durumda portföy bulunmuyor.</div>
        )}
      </div>
    </PageContainer>
  );
}
