import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Inbox, Send, Check, X, Clock, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import {
  listInbox,
  listMyRequests,
  approveRequest,
  rejectRequest,
  type InboxRequest,
  type SentRequest,
  type DetailRequestStatus,
} from "@/lib/data/access";

export const Route = createFileRoute("/dashboard/detail-requests")({
  component: DetailRequestsPage,
});

const STATUS_META: Record<DetailRequestStatus, { label: string; cls: string }> = {
  pending: { label: "Bekliyor", cls: "bg-gold/15 text-gold ring-1 ring-inset ring-gold/30" },
  approved: {
    label: "Onaylandı",
    cls: "bg-success/15 text-success ring-1 ring-inset ring-success/30",
  },
  rejected: {
    label: "Reddedildi",
    cls: "bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/30",
  },
};

function StatusPill({ status }: { status: DetailRequestStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", m.cls)}>
      {m.label}
    </span>
  );
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

function DetailRequestsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [inbox, setInbox] = useState<InboxRequest[] | null>(null);
  const [sent, setSent] = useState<SentRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const [inb, snt] = await Promise.all([listInbox(user.id), listMyRequests(user.id)]);
      // pending first, then newest
      inb.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return b.created_at.localeCompare(a.created_at);
      });
      setInbox(inb);
      setSent(snt);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(reqId: string, action: "approve" | "reject") {
    setBusyId(reqId);
    try {
      if (action === "approve") {
        await approveRequest(reqId);
        toast.success("Talep onaylandı — erişim verildi.");
      } else {
        await rejectRequest(reqId);
        toast.success("Talep reddedildi.");
      }
      await load();
    } catch (e) {
      toast.error("İşlem başarısız", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = inbox?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Detay Talepleri"
        subtitle="Portföylerinize gelen erişim taleplerini yönetin; gönderdiğiniz talepleri takip edin."
      />

      <div className="flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
        <TabButton active={tab === "inbox"} onClick={() => setTab("inbox")} icon={Inbox}>
          Gelen Kutusu
          {pendingCount > 0 && (
            <span className="ml-1.5 rounded-full bg-gold px-1.5 text-[11px] font-bold text-primary-foreground">
              {pendingCount}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === "sent"} onClick={() => setTab("sent")} icon={Send}>
          Gönderdiğim Talepler
        </TabButton>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-12 text-center text-sm text-destructive">
          Yüklenemedi: {error}
        </div>
      ) : tab === "inbox" ? (
        inbox === null ? (
          <Loading />
        ) : inbox.length === 0 ? (
          <Empty text="Henüz erişim talebi yok." />
        ) : (
          <div className="space-y-3">
            {inbox.map((r) => (
              <InboxRow key={r.id} r={r} busy={busyId === r.id} onAct={act} />
            ))}
          </div>
        )
      ) : sent === null ? (
        <Loading />
      ) : sent.length === 0 ? (
        <Empty text="Henüz bir detay talebi göndermediniz." />
      ) : (
        <div className="space-y-3">
          {sent.map((r) => (
            <SentRow key={r.id} r={r} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function InboxRow({
  r,
  busy,
  onAct,
}: {
  r: InboxRequest;
  busy: boolean;
  onAct: (id: string, a: "approve" | "reject") => void;
}) {
  return (
    <SurfaceCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {r.requester?.full_name ?? "Bir üye"}
          <ShieldCheck className="size-3.5 text-gold" />
          {r.requester?.company_name && (
            <span className="truncate text-xs font-normal text-muted-foreground">
              · {r.requester.company_name}
            </span>
          )}
        </p>
        <p className="flex items-center gap-1 text-xs text-secondary-foreground">
          <MapPin className="size-3 text-gold" />
          {r.portfolio ? (
            <Link
              to="/dashboard/portfolios/$id"
              params={{ id: r.portfolio.id }}
              className="font-medium text-foreground hover:text-gold hover:underline"
            >
              {r.portfolio.title}
            </Link>
          ) : (
            "Portföy"
          )}
        </p>
        {r.message && <p className="line-clamp-2 text-xs text-muted-foreground">“{r.message}”</p>}
        <p className="text-[11px] text-muted-foreground">{fmtDate(r.created_at)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {r.status === "pending" ? (
          <>
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              disabled={busy}
              onClick={() => onAct(r.id, "approve")}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Onayla
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
              disabled={busy}
              onClick={() => onAct(r.id, "reject")}
            >
              <X className="size-4" /> Reddet
            </Button>
          </>
        ) : (
          <StatusPill status={r.status} />
        )}
      </div>
    </SurfaceCard>
  );
}

function SentRow({ r }: { r: SentRequest }) {
  return (
    <SurfaceCard className="flex items-center justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <p className="flex items-center gap-1 text-sm">
          <MapPin className="size-3 text-gold" />
          {r.portfolio ? (
            <Link
              to="/dashboard/portfolios/$id"
              params={{ id: r.portfolio.id }}
              className="font-medium text-foreground hover:text-gold hover:underline"
            >
              {r.portfolio.title}
            </Link>
          ) : (
            <span className="text-foreground">Portföy</span>
          )}
        </p>
        <p className="text-[11px] text-muted-foreground">{fmtDate(r.created_at)}</p>
      </div>
      <div className="flex items-center gap-2">
        {r.status === "pending" && <Clock className="size-4 text-gold" />}
        <StatusPill status={r.status} />
      </div>
    </SurfaceCard>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Inbox;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
        active
          ? "bg-gradient-gold text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {children}
    </button>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-16">
      <Loader2 className="size-6 animate-spin text-gold" />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
