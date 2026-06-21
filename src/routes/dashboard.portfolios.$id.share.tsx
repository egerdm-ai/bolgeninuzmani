import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MessageCircle,
  Copy,
  Check,
  Link2,
  ImageOff,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { getMyPortfolioFull, type PortfolioFull } from "@/lib/data/portfolios";
import { formatPortfolioPrice } from "@/lib/portfolio-labels";
import { PUBLIC_ORIGIN } from "@/lib/public-origin";

// Public share domain — single source (VITE_PUBLIC_ORIGIN, falls back to window origin).
const SHARE_ORIGIN = PUBLIC_ORIGIN;

export const Route = createFileRoute("/dashboard/portfolios/$id/share")({
  component: ShareStudio,
});

function ShareStudio() {
  const { id } = Route.useParams();
  const [full, setFull] = useState<PortfolioFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyPortfolioFull(id)
      .then((d) => {
        if (!active) return;
        setFull(d);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      </PageContainer>
    );
  }
  if (!full) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Portföy bulunamadı.</p>
          <Button asChild variant="outline" className="mt-4 gap-1.5">
            <Link to="/dashboard/portfolios">
              <ArrowLeft className="size-4" /> Portföylerim
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const p = full.portfolio;
  const cover = full.images.find((i) => i.is_cover && i.visibility === "public") ?? full.images[0];
  const shareUrl = `${SHARE_ORIGIN}/p/${p.slug}`;
  const region = [p.neighborhood, p.district, p.city].filter(Boolean).join(", ");
  const message =
    `🏛️ Bölgenin Uzmanı — Özel Portföy\n\n` +
    `${p.title}\n` +
    (region ? `📍 ~${region}\n` : "") +
    `💰 ${formatPortfolioPrice(p.price, p.currency)}\n` +
    (p.room_count ? `🛏️ ${p.room_count}` : "") +
    (p.gross_m2 ? `${p.room_count ? " · " : ""}${p.gross_m2} m²\n` : "\n") +
    (p.public_description ? `\n${p.public_description}\n` : "") +
    `\nDetaylar ve erişim için:\n${shareUrl}`;

  const copy = (text: string, key: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopied(key);
      toast.success("Kopyalandı");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Kopyalanamadı");
    }
  };

  const notActive = p.status !== "active";

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Share Studio"
        breadcrumbs={[
          { label: "Portföylerim", to: "/dashboard/portfolios" },
          { label: p.title },
          { label: "Paylaş" },
        ]}
      />

      {notActive && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          Bu portföy <strong>yayında değil</strong> — paylaşılan link, siz yayınlayana kadar
          müşteriye görünmez.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Public teaser preview card */}
        <SurfaceCard className="p-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-surface-2">
            {cover ? (
              <img src={cover.url} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <ImageOff className="size-7" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="line-clamp-1 font-semibold text-foreground">{p.title}</h3>
            <p className="text-xs text-muted-foreground">~{region || "—"}</p>
            <p className="mt-1.5 font-display text-lg font-semibold text-gold">
              {formatPortfolioPrice(p.price, p.currency)}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full gap-1.5">
              <a href={shareUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" /> Public sayfayı aç
              </a>
            </Button>
          </div>
        </SurfaceCard>

        {/* Share actions */}
        <div className="space-y-4">
          <SurfaceCard className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Paylaşım Linki</h2>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-secondary-foreground outline-none"
              />
              <Button variant="outline" className="gap-1.5" onClick={() => copy(shareUrl, "url")}>
                {copied === "url" ? <Check className="size-4" /> : <Link2 className="size-4" />}
                Linki Kopyala
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Link müşteriye yalnızca <strong>teaser</strong>'ı gösterir; tam adres, malik bilgisi,
              belgeler ve özel notlar görünmez.
            </p>
          </SurfaceCard>

          <SurfaceCard className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">WhatsApp Mesajı</h2>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-surface-2 p-3 text-xs text-secondary-foreground">
              {message}
            </pre>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" /> WhatsApp ile Paylaş
                </a>
              </Button>
              <Button variant="outline" className="gap-1.5" onClick={() => copy(message, "msg")}>
                {copied === "msg" ? <Check className="size-4" /> : <Copy className="size-4" />}
                Mesajı Kopyala
              </Button>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}
