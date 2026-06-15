import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Users, FolderLock, Clock, Heart, X } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ProfessionalCard } from "@/components/vault/professional-card";
import { professionals } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { useFollow } from "@/lib/follow-store";

export const Route = createFileRoute("/dashboard/professionals/")({
  component: ProfessionalsPage,
});

const regionFilters = ["İstanbul", "Bodrum", "Çeşme", "Riva", "Bebek", "Yalıkavak", "Türkbükü"];
const expertiseFilters = ["Villa", "Yalı", "Arsa", "Ticari", "Otel", "Ofis", "Restoran"];

type SortMode = "default" | "portfolios" | "recent";

function ProfessionalsPage() {
  const { isFollowing } = useFollow();
  const [search, setSearch] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [sort, setSort] = useState<SortMode>("default");
  const [followingOnly, setFollowingOnly] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const results = useMemo(() => {
    let list = professionals.filter((pro) => {
      if (search) {
        const q = search.toLocaleLowerCase("tr");
        const hay = `${pro.fullName} ${pro.title} ${pro.companyName} ${pro.location} ${pro.expertiseRegions.join(" ")} ${pro.expertiseTypes.join(" ")}`.toLocaleLowerCase("tr");
        if (!hay.includes(q)) return false;
      }
      if (regions.length > 0) {
        const hay = `${pro.expertiseRegions.join(" ")} ${pro.location}`;
        if (!regions.some((r) => hay.includes(r))) return false;
      }
      if (expertise.length > 0 && !expertise.some((t) => pro.expertiseTypes.includes(t))) return false;
      if (followingOnly && !isFollowing(pro.id)) return false;
      return true;
    });

    if (sort === "portfolios") list = [...list].sort((a, b) => b.activePortfolios - a.activePortfolios);
    if (sort === "recent") list = [...list].sort((a, b) => b.views30d - a.views30d);
    return list;
  }, [search, regions, expertise, sort, followingOnly, isFollowing]);

  const hasFilters = regions.length > 0 || expertise.length > 0 || followingOnly || sort !== "default" || search !== "";

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Profesyoneller"
        subtitle="Luxury portföy ağı içindeki doğrulanmış emlak profesyonellerini keşfedin."
      />

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İsim, bölge veya uzmanlık ara..."
          className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
        />
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <QuickChip active={sort === "portfolios"} onClick={() => setSort(sort === "portfolios" ? "default" : "portfolios")} icon={FolderLock}>
          Portföy sayısı
        </QuickChip>
        <QuickChip active={sort === "recent"} onClick={() => setSort(sort === "recent" ? "default" : "recent")} icon={Clock}>
          Yeni portföy ekleyenler
        </QuickChip>
        <QuickChip active={followingOnly} onClick={() => setFollowingOnly((v) => !v)} icon={Heart}>
          Takip ettiklerim
        </QuickChip>
      </div>

      {/* Region + expertise filters */}
      <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
        <FilterRow label="Bölge" options={regionFilters} selected={regions} onToggle={(v) => toggle(regions, setRegions, v)} />
        <FilterRow label="Uzmanlık" options={expertiseFilters} selected={expertise} onToggle={(v) => toggle(expertise, setExpertise, v)} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.length}</span> profesyonel bulundu
        </p>
        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setRegions([]);
              setExpertise([]);
              setSort("default");
              setFollowingOnly(false);
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" /> Filtreleri temizle
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center">
          <Users className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Aramanıza uygun profesyonel bulunamadı.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((pro) => (
            <ProfessionalCard key={pro.id} professional={pro} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function QuickChip({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors",
        active ? "bg-gold/15 text-gold ring-gold/30" : "bg-surface-2 text-secondary-foreground ring-border hover:ring-border-strong",
      )}
    >
      <Icon className="size-3.5" /> {children}
    </button>
  );
}

function FilterRow({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex w-20 shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
        <SlidersHorizontal className="size-3.5" /> {label}
      </span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onToggle(o)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
            selected.includes(o) ? "bg-gold/15 text-gold ring-gold/30" : "bg-surface text-secondary-foreground ring-border hover:ring-border-strong",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
