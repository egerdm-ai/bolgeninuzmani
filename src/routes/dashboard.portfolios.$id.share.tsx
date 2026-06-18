import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  MessageCircle,
  Link2,
  FileText,
  Mail,
  Copy,
  Download,
  Check,
  ShieldCheck,
  Lock,
  Eye,
  Users,
  Inbox,
  BarChart3,
  CheckCheck,
} from "lucide-react";
import { getPortfolioById } from "@/lib/mock/data";
import { getShareAnalytics } from "@/lib/mock/insights";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/portfolios/$id/share")({
  loader: ({ params }) => {
    const portfolio = getPortfolioById(params.id);
    if (!portfolio) throw notFound();
    return { portfolio };
  },
  component: ShareStudio,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Portföy bulunamadı.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">{error.message}</div>
  ),
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
  const analytics = getShareAnalytics(portfolio);

  const shareUrl = `https://bolgeninuzmani.com/p/${portfolio.slug}`;
  const message = `🏛️ Bölgenin Uzmanı — Özel Portföy\n\n${portfolio.title}\n📍 ~${portfolio.regionLabel}\n💰 ${formatPrice(portfolio.price, portfolio.currency)}\n${portfolio.rooms ? `🛏️ ${portfolio.rooms}` : ""}${portfolio.grossM2 ? ` · ${portfolio.grossM2} m²` : ""}\n\n${portfolio.shortDescription}\n\nDetaylar ve erişim talebi için:\n${shareUrl}`;

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    toast.success("Kopyalandı");
    setTimeout(() => setCopied(null), 2000);
  };

  const analyticsRows = [
    { icon: Eye, label: "Görüntüleme", value: formatNumber(analytics.views) },
    { icon: Users, label: "Tekil ziyaretçi", value: formatNumber(analytics.uniqueViewers) },
    {
      icon: MessageCircle,
      label: "WhatsApp tıklaması",
      value: formatNumber(analytics.whatsappClicks),
    },
    { icon: Inbox, label: "Detay talebi", value: formatNumber(analytics.detailRequests) },
  ];

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Share Studio"
        subtitle="Portföyünüzü müşteriye sunum kalitesinde, profesyonel paylaşım araçlarıyla ağınıza ulaştırın."
        breadcrumbs={[
          { label: "Portföylerim", to: "/dashboard/portfolios" },
          { label: portfolio.title },
          { label: "Paylaş" },
        ]}
      />

      {/* Locked-info warning banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/[0.06] px-4 py-3">
        <Lock className="mt-0.5 size-4 shrink-0 text-gold" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Kilitli bilgiler yalnızca detay talebi sonrası açılır
          </p>
          <p className="text-xs text-muted-foreground">
            Tam adres, tapu ve PDF belgeleri paylaşımda gizli kalır; yalnızca onayladığınız detay
            taleplerinde görünür hale gelir.
          </p>
        </div>
      </div>

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
                  channel === c.key
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border bg-surface-2 text-secondary-foreground hover:border-border-strong",
                )}
              >
                <c.icon className="size-5" />
                <span className="text-xs font-medium">{c.label}</span>
              </button>
            ))}
          </div>

          {channel === "whatsapp" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* WhatsApp chat preview */}
              <SurfaceCard className="space-y-3">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <MessageCircle className="size-4 text-success" /> WhatsApp Önizleme
                </h3>
                <div className="rounded-2xl bg-[#0b141a] p-4">
                  <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-[#005c4b] p-3 shadow">
                    <div className="overflow-hidden rounded-lg">
                      <img
                        src={portfolio.coverImage}
                        alt=""
                        className="aspect-[16/9] w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-[#e9edef]">
                      {message}
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#8fa3ad]">
                      14:32 <CheckCheck className="size-3 text-[#53bdeb]" />
                    </p>
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Mesaj Metni</h3>
                <Textarea
                  value={message}
                  readOnly
                  rows={11}
                  className="resize-none font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => copy(message, "msg")}
                    variant="outline"
                    className="flex-1 gap-1.5"
                  >
                    {copied === "msg" ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <Copy className="size-4" />
                    )}{" "}
                    Kopyala
                  </Button>
                  <Button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
                      }
                      toast.success("WhatsApp paylaşımı açıldı (demo)");
                    }}
                    className="flex-1 gap-1.5 bg-success/90 text-background hover:bg-success"
                  >
                    <MessageCircle className="size-4" /> WhatsApp'ta Aç
                  </Button>
                </div>
              </SurfaceCard>
            </div>
          )}

          {channel === "link" && (
            <SurfaceCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Markalı Paylaşım Linki</h3>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
                <Link2 className="size-4 text-gold" />
                <span className="flex-1 truncate text-sm text-secondary-foreground">
                  {shareUrl}
                </span>
              </div>
              <Button
                onClick={() => copy(shareUrl, "link")}
                className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                {copied === "link" ? <Check className="size-4" /> : <Copy className="size-4" />}{" "}
                Linki Kopyala
              </Button>
              {/* Link tracking placeholder */}
              <div className="rounded-xl border border-border bg-surface-2 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <BarChart3 className="size-3.5 text-gold" /> Link Takibi
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Bu link her açılışta tıklanma, ziyaretçi ve detay talebi olarak ölçülür. (Demo —
                  yakında)
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] text-secondary-foreground">
                    UTM destekli
                  </span>
                  <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] text-secondary-foreground">
                    Cihaz kırılımı
                  </span>
                  <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] text-secondary-foreground">
                    Coğrafi dağılım
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Bu link, üye olmayanlara sınırlı teaser bilgisi gösterir.
              </p>
            </SurfaceCard>
          )}

          {channel === "pdf" && (
            <SurfaceCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Müşteriye Özel PDF Sunum</h3>
              <div className="relative aspect-[3/4] max-w-xs overflow-hidden rounded-xl border border-border">
                <img src={portfolio.coverImage} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute left-4 top-4">
                  <span className="font-display text-lg font-bold uppercase tracking-widest text-gold">
                    Bölgenin Uzmanı
                  </span>
                </div>
                <div className="absolute bottom-0 p-4">
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">
                    {portfolio.title}
                  </p>
                  <p className="text-xs text-muted-foreground">~{portfolio.regionLabel}</p>
                  <p className="text-xs text-gold">
                    {formatPrice(portfolio.price, portfolio.currency)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => toast.success("PDF önizleme açıldı (demo)")}
                  variant="outline"
                  className="flex-1 gap-1.5"
                >
                  <Eye className="size-4" /> Önizle
                </Button>
                <Button
                  onClick={() => toast.success("PDF indiriliyor (demo)")}
                  className="flex-1 gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
                >
                  <Download className="size-4" /> PDF İndir
                </Button>
              </div>
            </SurfaceCard>
          )}

          {channel === "email" && (
            <SurfaceCard className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">E-posta ile Paylaş</h3>
              <Textarea defaultValue={message} rows={8} className="resize-none text-sm" />
              <Button
                onClick={() => toast.success("E-posta taslağı hazırlandı (demo)")}
                className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <Mail className="size-4" /> E-posta Oluştur
              </Button>
            </SurfaceCard>
          )}
        </div>

        {/* Preview + analytics rail */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <SurfaceCard className="p-0">
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Link Önizleme
              </p>
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
                <img
                  src={portfolio.coverImage}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="p-3">
                  <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-gold">
                    <ShieldCheck className="size-3" /> bolgeninuzmani.com
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
                    {portfolio.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    ~{portfolio.regionLabel} · {formatPrice(portfolio.price, portfolio.currency)}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-success/25 bg-success/5 px-3 py-2 text-xs text-success">
                <Check className="mr-1 inline size-3.5" /> Portföy yayında ve paylaşıma hazır
              </div>
            </div>
          </SurfaceCard>

          {/* Share analytics placeholder */}
          <SurfaceCard className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <BarChart3 className="size-3.5 text-gold" /> Paylaşım Analitiği
              </p>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                Demo
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border">
              {analyticsRows.map((r) => (
                <div key={r.label} className="bg-surface p-4">
                  <r.icon className="size-4 text-gold" />
                  <div className="mt-2 font-display text-xl font-semibold text-foreground">
                    {r.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{r.label}</div>
                </div>
              ))}
            </div>
            <p className="px-4 py-2 text-[11px] text-muted-foreground">
              Gerçek zamanlı paylaşım istatistikleri yakında aktif olacak.
            </p>
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}
