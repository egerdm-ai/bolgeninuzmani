import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin,
  ShieldCheck,
  FolderLock,
  Users,
  Eye,
  Compass,
  Search,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  PencilLine,
  Send,
  Layers,
  Send as SendIcon,
} from "lucide-react";
import type { Portfolio, Professional, ProfessionalActivity } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { formatNumber, portfolioTypeLabels } from "@/lib/format";
import {
  getPortfoliosByProfessional,
  professionals,
} from "@/lib/mock/data";
import { BrokerAvatar } from "./broker-avatar";
import { MembershipBadge, FeatureChip, RegionExpertBadge } from "./badges";
import { FollowButton } from "./follow-button";
import { ShareProfileButton } from "./share-profile-button";
import { ExpertiseMap } from "./expertise-map";
import { PortfolioCard } from "./portfolio-card";
import { PortfolioListRow } from "./portfolio-list-row";
import { ProfessionalMiniCard } from "./professional-mini-card";
import { ExpertiseRegionCard } from "./expertise-region-card";
import { LockedContactCard } from "./locked-contact-card";
import { RegionLinkChip } from "./region-link-chip";
import { SurfaceCard, InfoPanel } from "./cards";
import { DetailRequestModal } from "./detail-request-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSaved } from "@/lib/saved-store";
import { useFollow } from "@/lib/follow-store";

const ALL = "__all__";

const priceRanges: { label: string; min: number; max: number }[] = [
  { label: "0 - 40M ₺", min: 0, max: 40_000_000 },
  { label: "40M - 70M ₺", min: 40_000_000, max: 70_000_000 },
  { label: "70M - 120M ₺", min: 70_000_000, max: 120_000_000 },
  { label: "120M+ ₺", min: 120_000_000, max: Infinity },
];

const activityIcon: Record<ProfessionalActivity["type"], typeof PencilLine> = {
  publish: Sparkles,
  update: PencilLine,
  photo: ImageIcon,
  request: Send,
};

export function ProfessionalProfile({ professional }: { professional: Professional }) {
  const { isSaved, toggleSave } = useSaved();
  const { followerCount } = useFollow();
  const followers = followerCount(professional.id, professional.followerCount);

  const allPortfolios = useMemo(
    () => getPortfoliosByProfessional(professional.id, { activeOnly: true }),
    [professional.id],
  );

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>(ALL);
  const [type, setType] = useState<string>(ALL);
  const [city, setCity] = useState<string>(ALL);
  const [priceIdx, setPriceIdx] = useState<string>(ALL);
  const [features, setFeatures] = useState<string[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [requestTarget, setRequestTarget] = useState<Portfolio | null>(null);

  const cityOptions = useMemo(
    () => Array.from(new Set(allPortfolios.map((p) => p.city))),
    [allPortfolios],
  );
  const typeOptions = useMemo(
    () => Array.from(new Set(allPortfolios.map((p) => p.type))),
    [allPortfolios],
  );
  const featureOptions = ["Deniz Manzarası", "Havuz", "Otopark"];

  const matchesRegion = (p: Portfolio, r: string) =>
    p.neighborhood === r || p.district === r || p.regionLabel.includes(r);

  const filtered = useMemo(() => {
    return allPortfolios.filter((p) => {
      if (search) {
        const q = search.toLocaleLowerCase("tr");
        const hay = `${p.title} ${p.regionLabel} ${p.neighborhood ?? ""}`.toLocaleLowerCase("tr");
        if (!hay.includes(q)) return false;
      }
      if (region !== ALL && !matchesRegion(p, region)) return false;
      if (city !== ALL && p.city !== city) return false;
      if (type !== ALL && p.type !== type) return false;
      if (priceIdx !== ALL) {
        const range = priceRanges[Number(priceIdx)];
        if (p.price < range.min || p.price >= range.max) return false;
      }
      if (features.length > 0) {
        const has = (label: string) =>
          p.features.some((f) => f.toLocaleLowerCase("tr").includes(label.toLocaleLowerCase("tr")));
        if (
          (features.includes("Deniz Manzarası") && !has("Deniz")) ||
          (features.includes("Havuz") && !has("Havuz")) ||
          (features.includes("Otopark") && !has("Otopark") && !p.parkingCapacity)
        )
          return false;
      }
      return true;
    });
  }, [allPortfolios, search, region, city, type, priceIdx, features]);

  const featured = useMemo(
    () => [...allPortfolios].sort((a, b) => b.viewCount - a.viewCount).slice(0, 3),
    [allPortfolios],
  );

  const similar = useMemo(
    () =>
      professionals
        .filter(
          (x) =>
            x.id !== professional.id &&
            x.expertiseTypes.some((t) => professional.expertiseTypes.includes(t)),
        )
        .slice(0, 3),
    [professional],
  );

  const filtersActive =
    search !== "" || region !== ALL || type !== ALL || city !== ALL || priceIdx !== ALL || features.length > 0;

  const resetFilters = () => {
    setSearch("");
    setRegion(ALL);
    setType(ALL);
    setCity(ALL);
    setPriceIdx(ALL);
    setFeatures([]);
  };

  const focusRegion = (r: string) => {
    setRegion((prev) => (prev === r ? ALL : r));
    document.getElementById("portfoy-vitrini")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleFeature = (f: string) =>
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const stats = [
    { label: "Aktif Portföy", value: formatNumber(professional.activePortfolios), icon: FolderLock },
    { label: "Takipçi", value: formatNumber(followers), icon: Users },
    { label: "Uzmanlık Bölgesi", value: String(professional.expertiseRegions.length), icon: Compass },
    { label: "Son 30 Gün Görüntülenme", value: formatNumber(professional.views30d), icon: Eye },
    { label: "Eşleşme Sayısı", value: formatNumber(professional.matchCount), icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      {/* A. Hero header */}
      <SurfaceCard className="overflow-hidden p-0">
        <div className="relative h-32 sm:h-40">
          <img src={professional.coverImage} alt="" className="size-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 85% 15%, oklch(0.78 0.12 85 / 0.18), transparent 45%)",
            }}
          />
        </div>
        <div className="px-5 pb-5 sm:px-7 sm:pb-7">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <BrokerAvatar
              name={professional.fullName}
              src={professional.avatarUrl || undefined}
              size="xl"
              className="size-24 text-2xl ring-4 ring-surface"
            />
            <div className="flex flex-wrap items-center justify-end gap-2 pb-1">
              <FollowButton id={professional.id} name={professional.fullName} />
              <ShareProfileButton username={professional.username} />
              <Button
                className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
                onClick={() =>
                  document
                    .getElementById("portfoy-vitrini")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Portföylerini Gör <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                {professional.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold ring-1 ring-inset ring-gold/30">
                <ShieldCheck className="size-3.5" /> Doğrulanmış Profesyonel
              </span>
              <MembershipBadge tier={professional.membershipTier} label={professional.membershipBadge} />
              <RegionExpertBadge region={professional.expertBadge} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {professional.title} · <span className="text-gold">{professional.companyName}</span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 text-gold" /> {professional.location}
            </p>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <s.icon className="size-3.5 text-gold" /> {s.label}
                </span>
                <span className="mt-1 block font-display text-2xl font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>

      {/* B. About + contact / region-list / quick actions sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <InfoPanel title="Hakkında" className="self-start">
          <p className="text-sm leading-relaxed text-secondary-foreground">{professional.bio}</p>
          <p className="mt-3 rounded-lg border border-gold/20 bg-gold/[0.05] px-4 py-3 text-sm text-secondary-foreground">
            Bu profesyonel özellikle{" "}
            <span className="font-medium text-gold">
              {professional.expertiseRegions.slice(0, 3).join(", ")}
            </span>{" "}
            bölgesindeki kapalı luxury portföylerde aktiftir.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {professional.expertiseRegions.map((r) => (
              <RegionLinkChip key={r} region={r} withIcon />
            ))}
          </div>
        </InfoPanel>

        <div className="space-y-6">
          <LockedContactCard />

          {/* Bölge Uzmanlığı */}
          <SurfaceCard>
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-gold" />
              <h3 className="text-sm font-semibold text-foreground">Bölge Uzmanlığı</h3>
            </div>
            <p className="mt-2 text-sm text-secondary-foreground">
              <span className="font-semibold text-gold">{professional.regionListCount}</span> bölge listesinde yer alıyor
            </p>
            <div className="mt-3 space-y-1.5">
              {[...professional.regionExpertise]
                .sort((a, b) => b.portfolioCount - a.portfolioCount)
                .map((r) => (
                  <button
                    key={r.region}
                    onClick={() => focusRegion(r.region)}
                    className="flex w-full items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-left transition-colors hover:bg-surface-3"
                  >
                    <span className="flex items-center gap-1.5 text-sm text-secondary-foreground">
                      <MapPin className="size-3.5 text-gold" /> {r.region}
                    </span>
                    <span className="text-xs font-semibold text-foreground">{r.portfolioCount} portföy</span>
                  </button>
                ))}
            </div>
          </SurfaceCard>

          {/* Quick actions */}
          <SurfaceCard>
            <h3 className="text-sm font-semibold text-foreground">Hızlı İşlemler</h3>
            <div className="mt-3 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() =>
                  document.getElementById("portfoy-vitrini")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                <FolderLock className="size-4 text-gold" /> Portföylerini Gör
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/dashboard/regions">
                  <Compass className="size-4 text-gold" /> Bölge Uzmanlarını Gör
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => featured[0] && setRequestTarget(featured[0])}
              >
                <SendIcon className="size-4 text-gold" /> Detay Talebi Gönder
              </Button>
              <ShareProfileButton username={professional.username} className="w-full justify-start" />
            </div>
          </SurfaceCard>
        </div>
      </div>

      {/* C. Expertise regions */}
      <div>
        <div className="mb-3">
          <h2 className="font-display text-xl font-semibold text-foreground">Uzmanlık Bölgeleri</h2>
          <p className="text-sm text-muted-foreground">
            Bu profesyonelin aktif olduğu yaklaşık bölgeler ve portföy yoğunluğu.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-3 sm:grid-cols-2">
            {professional.regionExpertise.map((r) => (
              <ExpertiseRegionCard key={r.region} region={r} onFocus={focusRegion} />
            ))}
          </div>
          <ExpertiseMap
            regions={professional.regionExpertise}
            activeRegion={region === ALL ? null : region}
            onSelectRegion={focusRegion}
            className="lg:sticky lg:top-20 lg:self-start"
          />
        </div>
      </div>

      {/* D. Portfolio showcase */}
      <div id="portfoy-vitrini" className="scroll-mt-20">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Portföy Vitrini</h2>
            <p className="text-sm text-muted-foreground">Bu profesyonelin paylaştığı kapalı portföyler.</p>
          </div>
          <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm",
                view === "grid" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <LayoutGrid className="size-4" /> Izgara
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm",
                view === "list" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <List className="size-4" /> Liste
            </button>
          </div>
        </div>

        {/* Filters */}
        <SurfaceCard className="p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Bu profesyonelin portföylerinde ara..."
                className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSelect value={city} onChange={setCity} placeholder="Şehir" options={cityOptions.map((c) => ({ value: c, label: c }))} />
              <FilterSelect
                value={region}
                onChange={setRegion}
                placeholder="Bölge"
                options={professional.expertiseRegions.map((r) => ({ value: r, label: r }))}
              />
              <FilterSelect
                value={type}
                onChange={setType}
                placeholder="Portföy Tipi"
                options={typeOptions.map((t) => ({ value: t, label: portfolioTypeLabels[t] }))}
              />
              <FilterSelect
                value={priceIdx}
                onChange={setPriceIdx}
                placeholder="Fiyat Aralığı"
                options={priceRanges.map((r, i) => ({ value: String(i), label: r.label }))}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {featureOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFeature(f)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                    features.includes(f)
                      ? "bg-gold/15 text-gold ring-gold/30"
                      : "bg-surface-2 text-secondary-foreground ring-border hover:ring-border-strong",
                  )}
                >
                  {f}
                </button>
              ))}
              {filtersActive && (
                <Button variant="ghost" size="sm" className="ml-auto gap-1.5 text-muted-foreground" onClick={resetFilters}>
                  <RotateCcw className="size-3.5" /> Filtreleri Sıfırla
                </Button>
              )}
            </div>
          </div>
        </SurfaceCard>

        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span> portföy gösteriliyor
        </p>

        {filtered.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">Seçilen filtrelere uygun portföy bulunamadı.</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={resetFilters}>
              <RotateCcw className="size-3.5" /> Filtreleri Sıfırla
            </Button>
          </div>
        ) : view === "grid" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <PortfolioCard
                key={p.id}
                portfolio={p}
                saved={isSaved(p.id)}
                onToggleSave={toggleSave}
                onRequestDetail={setRequestTarget}
              />
            ))}
          </div>
        ) : (
          <SurfaceCard className="mt-4 p-0">
            {filtered.map((p) => (
              <PortfolioListRow key={p.id} portfolio={p} />
            ))}
          </SurfaceCard>
        )}
      </div>

      {/* E. Featured strip */}
      {featured.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-foreground">
            <Sparkles className="size-5 text-gold" /> Öne Çıkan Portföyler
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((p) => (
              <PortfolioCard key={p.id} portfolio={p} saved={isSaved(p.id)} onToggleSave={toggleSave} />
            ))}
          </div>
        </div>
      )}

      {/* F. Recent activity */}
      <InfoPanel title="Son Aktiviteler">
        <ul className="space-y-3">
          {professional.activity.map((a) => {
            const Icon = activityIcon[a.type];
            return (
              <li key={a.id} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm text-secondary-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </InfoPanel>

      {/* G. Similar professionals */}
      {similar.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-xl font-semibold text-foreground">Benzer Profesyoneller</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <ProfessionalMiniCard key={s.id} professional={s} />
            ))}
          </div>
        </div>
      )}

      <DetailRequestModal
        portfolio={requestTarget}
        open={!!requestTarget}
        onOpenChange={(o) => !o && setRequestTarget(null)}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 bg-surface-2">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}: Tümü</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
