import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyStateCard } from "@/components/vault/cards";
import { ProfessionalDirectoryCard } from "@/components/profile/professional-directory-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { featureFlags } from "@/lib/feature-flags";
import { listProfessionals, type ProfessionalListItem } from "@/lib/data/professionals";

export const Route = createFileRoute("/dashboard/professionals/")({
  beforeLoad: () => {
    if (!featureFlags.professionals) throw redirect({ to: "/dashboard" });
  },
  component: Professionals,
});

const lc = (s: string) => s.toLocaleLowerCase("tr-TR");
const ALL = "all";

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
    () => [...new Set((rows ?? []).flatMap((p) => p.expertise_regions))].sort(),
    [rows],
  );
  const types = useMemo(
    () => [...new Set((rows ?? []).flatMap((p) => p.expertise_types))].sort(),
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

      {/* Expertise filters — dropdowns (E3.3) */}
      {(regions.length > 0 || types.length > 0) && (
        <div className="grid gap-2 sm:grid-cols-2">
          {regions.length > 0 && (
            <Select
              value={region ?? ALL}
              onValueChange={(v) => setRegion(v === ALL ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tüm bölgeler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tüm bölgeler</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {types.length > 0 && (
            <Select value={type ?? ALL} onValueChange={(v) => setType(v === ALL ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm uzmanlıklar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tüm uzmanlıklar</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
