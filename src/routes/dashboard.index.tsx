import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FolderLock,
  Send,
  Inbox,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Target,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { KpiCard, QuickActionCard, InfoPanel } from "@/components/vault/cards";
import { AIButton } from "@/components/vault/ai-button";
import { featureFlags } from "@/lib/feature-flags";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/vault/badges";
import { PortfolioTeaserCard, type TeaserCardData } from "@/components/portfolio/teaser-card";
import { useAuth } from "@/lib/auth/auth-context";
import { listMyPortfolios, type PortfolioWithCover } from "@/lib/data/portfolios";
import { listInbox, listMyRequests, type InboxRequest } from "@/lib/data/access";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const STATUS_TONE = { pending: "warning", approved: "success", rejected: "danger" } as const;
const STATUS_LABEL = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
} as const;

const toCard = (p: PortfolioWithCover): TeaserCardData => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  price: p.price,
  currency: p.currency,
  transaction_type: p.transaction_type,
  category: p.category,
  mode: p.mode,
  ref_no: p.ref_no,
  city: p.city,
  district: p.district,
  neighborhood: p.neighborhood,
  coverThumb: p.cover_url,
  coverFull: p.cover_url_full,
  roomCount: p.room_count,
  grossM2: p.gross_m2,
  features: p.features,
});

function DashboardHome() {
  const { user, profile } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioWithCover[] | null>(null);
  const [inbox, setInbox] = useState<InboxRequest[] | null>(null);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      listMyPortfolios(user.id).catch(() => []),
      listInbox(user.id).catch(() => []),
      listMyRequests(user.id).catch(() => []),
    ]).then(([ports, inb, sent]) => {
      if (!active) return;
      setPortfolios(ports);
      setInbox(inb);
      setSentCount(sent.length);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const activeCount = portfolios?.filter((p) => p.status === "active").length ?? 0;
  const totalCount = portfolios?.length ?? 0;
  const pendingCount = inbox?.filter((r) => r.status === "pending").length ?? 0;
  const recent = (portfolios ?? []).slice(0, 3).map(toCard);
  const incoming = (inbox ?? []).slice(0, 4);
  const loading = portfolios === null;

  return (
    <PageContainer className="space-y-7">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border shadow-elegant">
        <div className="absolute inset-0 bg-gradient-to-br from-bu-lock-bg via-bu-lock-bg to-bu-gold/25" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-bu-gold/[0.05] to-bu-gold/15" />
        <div className="relative flex flex-col gap-6 p-7 lg:p-10">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold-light ring-1 ring-inset ring-gold/30">
              <Sparkles className="size-3.5" /> Özel Lüks Gayrimenkul Ağı
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-white lg:text-5xl">
              Hoş geldiniz, {(profile?.full_name ?? "").split(" ")[0]}
            </h1>
            <p className="mt-3 text-base text-white/80">
              Portföylerinizi yönetin, doğrulanmış ağınızda keşfedin ve kontrollü erişimle güvenle
              paylaşın.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                asChild
                className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <Link to="/dashboard/portfolios/new">
                  <Plus className="size-4" /> Portföy Oluştur
                </Link>
              </Button>
              <AIButton />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/dashboard/portfolios/new">
          <QuickActionCard
            label="Portföy Oluştur"
            description="Yeni portföy ekle"
            icon={Plus}
            accent
          />
        </Link>
        <Link to="/dashboard/search">
          <QuickActionCard label="Keşfet" description="Ağdaki portföyleri ara" icon={Search} />
        </Link>
        {featureFlags.arayis && (
          <Link to="/dashboard/my-searches/new">
            <QuickActionCard label="Yeni Arayış" description="Müşteri için ara" icon={Target} />
          </Link>
        )}
      </div>

      {/* KPIs — real */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Aktif Portföy" value={String(activeCount)} icon={FolderLock} />
        <KpiCard label="Toplam Portföy" value={String(totalCount)} icon={FolderLock} />
        <KpiCard label="Bekleyen Talep" value={String(pendingCount)} icon={Inbox} />
        <KpiCard label="Gönderdiğim Talep" value={String(sentCount)} icon={Send} />
      </div>

      <div className="grid gap-7 lg:grid-cols-3">
        <div className="space-y-7 lg:col-span-2">
          {/* Recent portfolios */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Son Portföyleriniz
              </h2>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1 text-gold hover:text-gold-light"
              >
                <Link to="/dashboard/portfolios">
                  Tümünü Gör <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
                <Loader2 className="size-6 animate-spin text-gold" />
              </div>
            ) : recent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center text-sm text-muted-foreground">
                Henüz portföyünüz yok.{" "}
                <Link to="/dashboard/portfolios/new" className="text-gold hover:underline">
                  İlk portföyünüzü ekleyin.
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {recent.map((p) => (
                  <PortfolioTeaserCard key={p.id} p={p} context="app" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right rail — incoming requests */}
        <div className="space-y-7">
          <InfoPanel
            title="Gelen Detay Talepleri"
            action={
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1 text-gold hover:text-gold-light"
              >
                <Link to="/dashboard/detail-requests">
                  Tümü <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          >
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 animate-spin text-gold" />
              </div>
            ) : incoming.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Henüz erişim talebi yok.
              </p>
            ) : (
              <ul className="space-y-3">
                {incoming.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-gold">
                      {r.status === "approved" ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
                        {r.requester?.full_name ?? "Bir üye"}
                        <ShieldCheck className="size-3 shrink-0 text-gold" />
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.portfolio?.title ?? "Portföy"}
                      </p>
                    </div>
                    <StatusBadge label={STATUS_LABEL[r.status]} tone={STATUS_TONE[r.status]} />
                  </li>
                ))}
              </ul>
            )}
          </InfoPanel>
        </div>
      </div>
    </PageContainer>
  );
}
