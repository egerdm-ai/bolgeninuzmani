import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal, Map, List, BookmarkPlus, Sparkles, X } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { MapCanvasMock } from "@/components/vault/map-canvas-mock";
import { PortfolioPreviewCard } from "@/components/vault/portfolio-preview-card";
import { PortfolioCard } from "@/components/vault/portfolio-card";
import { DetailRequestModal } from "@/components/vault/detail-request-modal";
import { portfolios } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { useSaved } from "@/lib/saved-store";
import type { Portfolio } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/search")({
  component: SearchPage,
});

const filterChips = ["Bodrum", "Villa", "Deniz Manzarası", "50-100M TL", "5+1", "Havuz"];
const filterGroups = [
  { label: "Lokasyon", options: ["İstanbul", "Bodrum", "Çeşme", "Antalya"] },
  { label: "Portföy Tipi", options: ["Villa", "Daire", "Arsa", "Otel"] },
  { label: "Oda Sayısı", options: ["3+1", "4+1", "5+1", "6+"] },
];

function SearchPage() {
  const { isSaved, toggleSave, saveSearch } = useSaved();
  const searchable = portfolios.filter((p) => p.status === "active");
  const [selected, setSelected] = useState<Portfolio>(searchable[0]);
  const [view, setView] = useState<"map" | "list">("map");
  const [activeChips, setActiveChips] = useState<string[]>(["Bodrum", "Villa"]);
  const [requestTarget, setRequestTarget] = useState<Portfolio | null>(null);

  const toggleChip = (c: string) =>
    setActiveChips((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <PageContainer className="space-y-4">
      {/* Search bar row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Lokasyon, portföy başlığı veya ID ara..."
            className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-1.5 border-gold/40 text-gold hover:bg-gold/10">
            <Link to="/dashboard/concierge"><Sparkles className="size-4" /> AI Concierge</Link>
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => saveSearch("Bodrum Villa araması")}>
            <BookmarkPlus className="size-4" /> Aramayı Kaydet
          </Button>
          <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
            <button
              onClick={() => setView("map")}
              className={cn("flex items-center gap-1 rounded-md px-3 py-1.5 text-sm", view === "map" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground")}
            >
              <Map className="size-4" /> Harita
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("flex items-center gap-1 rounded-md px-3 py-1.5 text-sm", view === "list" ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground")}
            >
              <List className="size-4" /> Liste
            </button>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground"><SlidersHorizontal className="size-3.5" /> Filtreler:</span>
        {filterChips.map((c) => (
          <button
            key={c}
            onClick={() => toggleChip(c)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
              activeChips.includes(c)
                ? "bg-gold/15 text-gold ring-gold/30"
                : "bg-surface-2 text-secondary-foreground ring-border hover:ring-border-strong",
            )}
          >
            {c}
            {activeChips.includes(c) && <X className="size-3" />}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{searchable.length}</span> portföy bulundu
      </p>

      {view === "map" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* Filter + map */}
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {filterGroups.map((g) => (
                <div key={g.label} className="rounded-xl border border-border bg-surface-2 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">{g.label}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.options.map((o) => (
                      <span key={o} className="rounded-md bg-surface-3 px-2 py-0.5 text-xs text-secondary-foreground">{o}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[560px]">
              <MapCanvasMock portfolios={searchable} selectedId={selected?.id} onSelect={setSelected} className="h-full" />
            </div>
          </div>

          {/* Selected preview */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {selected && (
              <PortfolioPreviewCard
                portfolio={selected}
                saved={isSaved(selected.id)}
                onToggleSave={toggleSave}
                onRequestDetail={setRequestTarget}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {searchable.map((p) => (
            <PortfolioCard key={p.id} portfolio={p} saved={isSaved(p.id)} onToggleSave={toggleSave} />
          ))}
        </div>
      )}

      <DetailRequestModal portfolio={requestTarget} open={!!requestTarget} onOpenChange={(o) => !o && setRequestTarget(null)} />
    </PageContainer>
  );
}
