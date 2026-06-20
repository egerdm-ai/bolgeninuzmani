import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, Compass, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard, EmptyStateCard } from "@/components/vault/cards";
import { SearchCard } from "@/components/search/search-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { featureFlags } from "@/lib/feature-flags";
import { Constants } from "@/lib/database.types";
import { CATEGORY_LABELS, TRANSACTION_LABELS } from "@/lib/portfolio-labels";
import { listNetworkSearches, type NetworkSearch } from "@/lib/data/searches";

export const Route = createFileRoute("/dashboard/searches/")({
  beforeLoad: () => {
    if (!featureFlags.arayis) throw redirect({ to: "/dashboard" });
  },
  component: NetworkSearches,
});

const ALL = "all";
const CATEGORIES = Constants.public.Enums.portfolio_category;
const TRANSACTIONS = Constants.public.Enums.transaction_type;
const URGENCY_LABEL: Record<string, string> = { low: "Düşük", medium: "Orta", high: "Yüksek" };

function NetworkSearches() {
  const [rows, setRows] = useState<NetworkSearch[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [transaction, setTransaction] = useState<string>(ALL);

  useEffect(() => {
    let active = true;
    listNetworkSearches()
      .then((r) => active && setRows(r))
      .catch(() => active && setRows([]));
    return () => {
      active = false;
    };
  }, []);

  const list = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLocaleLowerCase("tr");
    return rows.filter((s) => {
      if (category !== ALL && s.category !== category) return false;
      if (transaction !== ALL && s.transaction_type !== transaction) return false;
      if (
        q &&
        !`${s.title} ${s.city ?? ""} ${s.district ?? ""} ${s.notes ?? ""}`
          .toLocaleLowerCase("tr")
          .includes(q)
      )
        return false;
      return true;
    });
  }, [rows, query, category, transaction]);

  const urgentCount = rows?.filter((s) => s.urgency === "high").length ?? 0;

  return (
    <PageContainer className="space-y-7">
      <PageHeader
        title="Ağ Arayışları"
        subtitle="Ağdaki doğrulanmış emlakçıların aktif arayışları. Uygun bir portföyünüz varsa ulaşın."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Aktif Ağ Arayışı" value={String(rows?.length ?? 0)} icon={Compass} />
        <KpiCard label="Acil" value={String(urgentCount)} icon={SearchIcon} />
        <KpiCard label="Gösterilen" value={String(list.length)} icon={SearchIcon} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Arayış, bölge veya not ara..."
            className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm kategoriler</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={transaction} onValueChange={setTransaction}>
          <SelectTrigger className="sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm işlemler</SelectItem>
            {TRANSACTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {TRANSACTION_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <Loader2 className={cn("size-6 animate-spin text-gold")} />
        </div>
      ) : list.length === 0 ? (
        <EmptyStateCard
          icon={SearchIcon}
          title="Ağda arayış bulunamadı"
          description="Şu an filtrelerinize uygun aktif ağ arayışı yok."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((s) => (
            <SearchCard key={s.id} search={s} context="network" />
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        Aciliyet etiketleri: {Object.values(URGENCY_LABEL).join(" · ")}
      </p>
    </PageContainer>
  );
}
