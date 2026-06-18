import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Users, FolderLock, Award, Sparkles, X } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ProfessionalCard } from "@/components/vault/professional-card";
import { professionals } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { useFollow } from "@/lib/follow-store";

export const Route = createFileRoute("/dashboard/professionals/")({
  component: ProfessionalsPage,
});

type ChipKind = "scope" | "tier" | "region" | "type";
type Chip = { id: string; label: string; kind: ChipKind; value?: string };

const chips: Chip[] = [
  { id: "all", label: "Tümü", kind: "scope" },
  { id: "following", label: "Takip Ettiklerim", kind: "scope" },
  { id: "experts", label: "Bölge Uzmanları", kind: "scope" },
  { id: "elite", label: "Elite", kind: "tier", value: "Elite" },
  { id: "r-bodrum", label: "Bodrum", kind: "region", value: "Bodrum" },
  { id: "r-istanbul", label: "İstanbul", kind: "region", value: "İstanbul" },
  { id: "r-cesme", label: "Çeşme", kind: "region", value: "Çeşme" },
  { id: "t-ticari", label: "Ticari", kind: "type", value: "Ticari" },
  { id: "t-villa", label: "Villa", kind: "type", value: "Villa" },
  { id: "t-arsa", label: "Arsa", kind: "type", value: "Arsa" },
];

const stats = [
  { label: "Profesyonel", value: "48", icon: Users },
  { label: "Aktif Portföy", value: "126", icon: FolderLock },
  { label: "Bölge Uzmanı", value: "18", icon: Award },
  { label: "Yeni Eşleşme", value: "312", icon: Sparkles },
];

function ProfessionalsPage() {
  const { isFollowing } = useFollow();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string[]>(["all"]);

  const toggleChip = (chip: Chip) => {
    if (chip.id === "all") {
      setActive(["all"]);
      return;
    }
    setActive((prev) => {
      const without = prev.filter((x) => x !== "all");
      const next = without.includes(chip.id)
        ? without.filter((x) => x !== chip.id)
        : [...without, chip.id];
      return next.length === 0 ? ["all"] : next;
    });
  };

  const results = useMemo(() => {
    const activeChips = chips.filter((c) => active.includes(c.id));
    const scopes = activeChips.filter((c) => c.kind === "scope").map((c) => c.id);
    const tiers = activeChips.filter((c) => c.kind === "tier").map((c) => c.value!);
    const regions = activeChips.filter((c) => c.kind === "region").map((c) => c.value!);
    const types = activeChips.filter((c) => c.kind === "type").map((c) => c.value!);

    return professionals.filter((pro) => {
      if (search) {
        const q = search.toLocaleLowerCase("tr");
        const hay =
          `${pro.fullName} ${pro.title} ${pro.companyName} ${pro.location} ${pro.expertiseRegions.join(" ")} ${pro.expertiseTypes.join(" ")}`.toLocaleLowerCase(
            "tr",
          );
        if (!hay.includes(q)) return false;
      }
      if (scopes.includes("following") && !isFollowing(pro.id)) return false;
      if (scopes.includes("experts") && pro.expertBadge === "Network Uzmanı") return false;
      if (tiers.length > 0 && !tiers.includes(pro.membershipBadge)) return false;
      if (regions.length > 0) {
        const hay = `${pro.expertiseRegions.join(" ")} ${pro.location}`;
        if (!regions.some((r) => hay.includes(r))) return false;
      }
      if (types.length > 0 && !types.some((t) => pro.expertiseTypes.includes(t))) return false;
      return true;
    });
  }, [search, active, isFollowing]);

  const hasFilters = search !== "" || !(active.length === 1 && active[0] === "all");

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Profesyoneller"
        subtitle="Bölgenin Uzmanı ağı içindeki doğrulanmış emlak profesyonellerini, bölge uzmanlarını ve portföy vitrinlerini keşfedin."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface-2 px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <s.icon className="size-3.5 text-gold" /> {s.label}
            </span>
            <span className="mt-1 block font-display text-2xl font-semibold text-foreground">
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İsim, bölge, şirket veya uzmanlık ara..."
          className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
        />
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => {
          const isActive = active.includes(chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => toggleChip(chip)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors",
                isActive
                  ? "bg-gold/15 text-gold ring-gold/30"
                  : "bg-surface-2 text-secondary-foreground ring-border hover:ring-border-strong",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.length}</span> profesyonel
          bulundu
        </p>
        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setActive(["all"]);
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
          <p className="mt-3 text-sm text-muted-foreground">
            Aramanıza uygun profesyonel bulunamadı.
          </p>
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
