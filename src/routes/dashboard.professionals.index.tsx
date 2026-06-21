import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyStateCard } from "@/components/vault/cards";
import { ProfessionalDirectoryCard } from "@/components/profile/professional-directory-card";
import { cn } from "@/lib/utils";
import { featureFlags } from "@/lib/feature-flags";
import { listProfessionals, type ProfessionalListItem } from "@/lib/data/professionals";

export const Route = createFileRoute("/dashboard/professionals/")({
  beforeLoad: () => {
    if (!featureFlags.professionals) throw redirect({ to: "/dashboard" });
  },
  component: Professionals,
});

const lc = (s: string) => s.toLocaleLowerCase("tr-TR");

function Professionals() {
  const [rows, setRows] = useState<ProfessionalListItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listProfessionals()
      .then((r) => active && setRows(r))
      .catch(() => active && setRows([]));
    return () => {
      active = false;
    };
  }, []);

  const regions = useMemo(
    () => [...new Set((rows ?? []).flatMap((p) => p.expertise_regions))].sort().slice(0, 12),
    [rows],
  );
  const types = useMemo(
    () => [...new Set((rows ?? []).flatMap((p) => p.expertise_types))].sort().slice(0, 10),
    [rows],
  );

  const list = useMemo(() => {
    if (!rows) return [];
    const q = lc(query.trim());
    return rows.filter((p) => {
      if (q && !lc(`${p.full_name} ${p.company_name ?? ""}`).includes(q)) return false;
      if (region && !p.expertise_regions.includes(region)) return false;
      if (type && !p.expertise_types.includes(type)) return false;
      return true;
    });
  }, [rows, query, region, type]);

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Profesyoneller" subtitle="Ağdaki doğrulanmış emlak profesyonelleri." />

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad veya şirket ara…"
          className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
        />
      </div>

      {/* Expertise filters */}
      {(regions.length > 0 || types.length > 0) && (
        <div className="space-y-2">
          {regions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Bölge
              </span>
              {regions.map((r) => (
                <Chip
                  key={r}
                  active={region === r}
                  onClick={() => setRegion(region === r ? null : r)}
                >
                  {r}
                </Chip>
              ))}
            </div>
          )}
          {types.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Uzmanlık
              </span>
              {types.map((t) => (
                <Chip key={t} active={type === t} onClick={() => setType(type === t ? null : t)}>
                  {t}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}

      {rows === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : list.length === 0 ? (
        <EmptyStateCard
          icon={Users}
          title="Profesyonel bulunamadı"
          description="Filtrelerinize uygun doğrulanmış profesyonel yok."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProfessionalDirectoryCard key={p.username} p={p} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-gold/40 bg-gold/10 text-gold"
          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
