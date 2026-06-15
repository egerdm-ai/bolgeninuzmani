import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/vault/cards";
import {
  BuyerSearchCard,
  buyerSearchStatusLabels,
} from "@/components/vault/buyer-search-card";
import { buyerSearches } from "@/lib/mock/matching";
import { cn } from "@/lib/utils";
import type { BuyerSearchStatus } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/buyer-searches/")({
  component: BuyerSearches,
});

const filters: { key: BuyerSearchStatus | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "active", label: buyerSearchStatusLabels.active },
  { key: "matched", label: buyerSearchStatusLabels.matched },
  { key: "awaiting", label: buyerSearchStatusLabels.awaiting },
  { key: "closed", label: buyerSearchStatusLabels.closed },
];

function BuyerSearches() {
  const [filter, setFilter] = useState<BuyerSearchStatus | "all">("all");
  const list = buyerSearches.filter((b) => filter === "all" || b.status === filter);
  const matched = buyerSearches.filter((b) => b.status === "matched").length;
  const awaiting = buyerSearches.filter((b) => b.status === "awaiting").length;
  const totalMatches = buyerSearches.reduce((s, b) => s + b.matchCount, 0);

  return (
    <PageContainer className="space-y-7">
      <PageHeader
        title="Arayışlar"
        subtitle="Alıcılarınız için aradığınız portföyleri tanımlayın, VAULT uygun portföyleri ve bölge uzmanlarını eşleştirsin."
        actions={
          <Button asChild className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Link to="/dashboard/buyer-searches/new">
              <Plus className="size-4" /> Yeni Arayış Oluştur
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Aktif Arayış" value={String(buyerSearches.filter((b) => b.status !== "closed").length)} icon={Search} />
        <KpiCard label="Eşleşme Bulundu" value={String(matched)} icon={CheckCircle2} />
        <KpiCard label="Yanıt Bekleyen" value={String(awaiting)} icon={Clock} />
        <KpiCard label="Toplam Eşleşme" value={String(totalMatches)} icon={Sparkles} />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === f.key
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((s) => (
          <BuyerSearchCard key={s.id} search={s} />
        ))}
      </div>
    </PageContainer>
  );
}
