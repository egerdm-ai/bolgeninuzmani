import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Link2, FileText, Mail, Copy, Download, Check, ShieldCheck } from "lucide-react";
import { getPortfolioById } from "@/lib/mock/data";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/portfolios/$id/share")({
  loader: ({ params }) => {
    const portfolio = getPortfolioById(params.id);
    if (!portfolio) throw notFound();
    return { portfolio };
  },
  component: ShareStudio,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Portföy bulunamadı.</div>,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">{error.message}</div>,
});

const channels = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "link", label: "Link Kopyala", icon: Link2 },
  { key: "pdf", label: "PDF", icon: FileText },
  { key: "email", label: "E-posta", icon: Mail },
];

function ShareStudio() {
  const { portfolio } = Route.useLoaderData();
  const [channel, setChannel] = useState("whatsapp");
  const [copied, setCopied] = useState<string | null>(null);

  const shareUrl = `https://vault.app/p/${portfolio.slug}`;
  const message = `🏛️ VAULT — Özel Portföy\n\n${portfolio.title}\n📍 ~${portfolio.regionLabel}\n💰 ${formatPrice(portfolio.price, portfolio.currency)}\n${portfolio.rooms ? `🛏️ ${portfolio.rooms}` : ""}${portfolio.grossM2 ? ` · ${portfolio.grossM2} m²` : ""}\n\n${portfolio.shortDescription}\n\nDetaylar ve erişim talebi için:\n${shareUrl}`;

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    toast.success("Kopyalandı");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Share Studio"
        subtitle="Portföyünüzü profesyonel paylaşım araçlarıyla ağınıza ulaştırın."
        breadcrumbs={[{ label: "Portföylerim", to: "/dashboard/portfolios" }, { label: portfolio.title }, { label: "Paylaş" }]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {/* Channels */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {channels.map((c) => (
              <button
                key={c.key}
                onClick={() => setChannel(c.key)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                  channel === c.key ? "border-gold/50 bg-gold/10 text-gold" : "border-border bg-surface-2 text-secondary-foreground hover:border-border-strong",
                )}
              >
                <c.icon className="size-5" />
                <span className="text-xs font-medium">{c.label}</span>
              </button>
            ))}
          </div>

          {channel === "whatsapp" && (
            <SurfaceCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">WhatsApp Mesajı</h3>
              <Textarea value={message} readOnly rows={10} className="resize-none font-mono text-xs" />
              <div className="flex gap-2">
                <Button onClick={() => copy(message, "msg")} variant="outline" className="flex-1 gap-1.5">
                  {copied === "msg" ? <Check className="size-4 text-success" /> : <Copy className="size-4" />} Mesajı Kopyala
                </Button>
                <Button className="flex-1 gap-1.5 bg-success/90 text-background hover:bg-success">
                  <MessageCircle className="size-4" /> WhatsApp'ta Aç
                </Button>
              </div>
            </SurfaceCard>
          )}

          {channel === "link" && (
            <SurfaceCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Paylaşım Linki</h3>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
                <Link2 className="size-4 text-gold" />
                <span className="flex-1 truncate text-sm text-secondary-foreground">{shareUrl}</span>
              </div>
              <Button onClick={() => copy(shareUrl, "link")} className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                {copied === "link" ? <Check className="size-4" /> : <Copy className="size-4" />} Linki Kopyala
              </Button>
              <p className="text-xs text-muted-foreground">Bu link, üye olmayanlara sınırlı teaser bilgisi gösterir.</p>
            </SurfaceCard>
          )}

          {channel === "pdf" && (
            <SurfaceCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">PDF Portföy</h3>
              <div className="relative aspect-[3/4] max-w-xs overflow-hidden rounded-xl border border-border">
                <img src={portfolio.coverImage} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <span className="font-display text-lg font-bold uppercase tracking-widest text-gold">Vault</span>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{portfolio.title}</p>
                  <p className="text-xs text-gold">{formatPrice(portfolio.price, portfolio.currency)}</p>
                </div>
              </div>
              <Button onClick={() => toast.success("PDF indiriliyor (demo)")} className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Download className="size-4" /> PDF İndir
              </Button>
            </SurfaceCard>
          )}

          {channel === "email" && (
            <SurfaceCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">E-posta ile Paylaş</h3>
              <Textarea defaultValue={message} rows={8} className="resize-none text-sm" />
              <Button onClick={() => toast.success("E-posta taslağı hazırlandı (demo)")} className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Mail className="size-4" /> E-posta Oluştur
              </Button>
            </SurfaceCard>
          )}
        </div>

        {/* Preview rail */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <SurfaceCard className="p-0">
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Link Önizleme</p>
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
                <img src={portfolio.coverImage} alt="" className="aspect-[16/9] w-full object-cover" />
                <div className="p-3">
                  <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-gold"><ShieldCheck className="size-3" /> vault.app</p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{portfolio.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">~{portfolio.regionLabel} · {formatPrice(portfolio.price, portfolio.currency)}</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-success/25 bg-success/5 px-3 py-2 text-xs text-success">
                <Check className="mr-1 inline size-3.5" /> Portföy yayında ve paylaşıma hazır
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}
