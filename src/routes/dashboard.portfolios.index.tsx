import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  FolderLock,
  CheckCircle2,
  FileEdit,
  ImageOff,
  Loader2,
  Pencil,
  Rocket,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { ThumbImage } from "@/components/portfolio/thumb-image";
import { ClosedModeBadge, RefNoText } from "@/components/portfolio/portfolio-badges";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import {
  listMyPortfolios,
  setPortfolioStatus,
  type PortfolioWithCover,
  type PortfolioStatus,
} from "@/lib/data/portfolios";
import {
  CATEGORY_LABELS,
  TRANSACTION_LABELS,
  STATUS_LABELS,
  formatPortfolioPrice,
} from "@/lib/portfolio-labels";

export const Route = createFileRoute("/dashboard/portfolios/")({
  component: MyPortfolios,
});

const tabs: { key: PortfolioStatus | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "active", label: "Yayında" },
  { key: "draft", label: "Taslak" },
  { key: "passive", label: "Pasif" },
  { key: "sold", label: "Satıldı / Kiralandı" },
];

const statusTone: Record<PortfolioStatus, string> = {
  active: "bg-success/15 text-success",
  draft: "bg-surface-3 text-muted-foreground",
  passive: "bg-warning/15 text-warning",
  sold: "bg-gold/15 text-gold",
};

function MyPortfolios() {
  const { user } = useAuth();
  const [tab, setTab] = useState<PortfolioStatus | "all">("all");
  const [items, setItems] = useState<PortfolioWithCover[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setItems(null);
    setError(null);
    listMyPortfolios(user.id)
      .then((d) => active && setItems(d))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, [user]);

  const all = items ?? [];
  const filtered = tab === "all" ? all : all.filter((p) => p.status === tab);
  const activeCount = all.filter((p) => p.status === "active").length;
  const draftCount = all.filter((p) => p.status === "draft").length;

  async function publish(id: string) {
    try {
      await setPortfolioStatus(id, "active");
      setItems((prev) => prev?.map((p) => (p.id === id ? { ...p, status: "active" } : p)) ?? null);
      toast.success("Portföy yayınlandı");
    } catch (e) {
      toast.error("Yayınlanamadı", { description: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Portföylerim"
        subtitle="Tüm lüks portföylerinizi tek yerden yönetin."
        actions={
          <Button
            asChild
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <Link to="/dashboard/portfolios/new">
              <Plus className="size-4" /> Portföy Oluştur
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Toplam Portföy" value={String(all.length)} icon={FolderLock} />
        <KpiCard label="Yayında" value={String(activeCount)} icon={CheckCircle2} />
        <KpiCard label="Taslak" value={String(draftCount)} icon={FileEdit} />
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === tb.key
                ? "bg-gradient-gold text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* states */}
      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-12 text-center text-sm text-destructive">
          Portföyler yüklenemedi: {error}
        </div>
      ) : items === null ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center">
          <FolderLock className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">
            {all.length === 0 ? "Henüz portföyünüz yok" : "Bu durumda portföy yok"}
          </p>
          {all.length === 0 && (
            <Button
              asChild
              className="mt-4 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <Link to="/dashboard/portfolios/new">
                <Plus className="size-4" /> İlk portföyünü ekle
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PortfolioCard key={p.id} p={p} onPublish={publish} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function PortfolioCard({
  p,
  onPublish,
}: {
  p: PortfolioWithCover;
  onPublish: (id: string) => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong">
      <Link to="/dashboard/portfolios/$id" params={{ id: p.id }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
          {p.cover_url ? (
            <ThumbImage
              thumb={p.cover_url}
              full={p.cover_url_full}
              alt={p.title}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-7" />
            </div>
          )}
          <span
            className={cn(
              "absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-semibold",
              statusTone[p.status],
            )}
          >
            {STATUS_LABELS[p.status]}
          </span>
          <ClosedModeBadge mode={p.mode} className="absolute right-2 top-2" />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{CATEGORY_LABELS[p.category]}</span>
            <span>·</span>
            <span>{TRANSACTION_LABELS[p.transaction_type]}</span>
          </div>
          <h3 className="mt-1 line-clamp-1 font-semibold text-foreground">{p.title}</h3>
          <p className="text-xs text-muted-foreground">
            {[p.neighborhood, p.district, p.city].filter(Boolean).join(", ") || "—"}
          </p>
          <p className="mt-2 font-display text-lg font-semibold text-gold">
            {formatPortfolioPrice(p.price, p.currency)}
          </p>
          <RefNoText value={p.ref_no} className="mt-1 block" />
        </div>
      </Link>
      <div className="flex border-t border-border">
        {p.status === "draft" && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-1.5 rounded-none text-gold hover:text-gold-light"
            onClick={() => onPublish(p.id)}
          >
            <Rocket className="size-3.5" /> Yayınla
          </Button>
        )}
        <Button asChild variant="ghost" size="sm" className="flex-1 gap-1.5 rounded-none">
          <Link to="/dashboard/portfolios/$id/edit" params={{ id: p.id }}>
            <Pencil className="size-3.5" /> Düzenle
          </Link>
        </Button>
      </div>
    </div>
  );
}
