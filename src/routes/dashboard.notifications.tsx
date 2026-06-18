import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, Sparkles, Map, FolderLock, Inbox, Target } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/vault/cards";
import { useNotifications } from "@/lib/notification-store";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationKind } from "@/lib/mock/types";

export const Route = createFileRoute("/dashboard/notifications")({
  component: Notifications,
});

const kindIcon: Record<NotificationKind, typeof Bell> = {
  match: Sparkles,
  region: Map,
  portfolio: FolderLock,
  request: Inbox,
  search: Target,
};

function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Bildirimler"
        subtitle="Yeni eşleşmeler, takip ettiğiniz bölgelerdeki portföyler ve detay talepleriyle ilgili güncellemeler."
        actions={
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-4" /> Tümünü okundu işaretle
          </Button>
        }
      />

      {notifications.length === 0 ? (
        <EmptyStateCard icon={Bell} title="Bildirim yok" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={() => markRead(n.id)} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function NotificationRow({ n, onRead }: { n: AppNotification; onRead: () => void }) {
  const Icon = kindIcon[n.kind];
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        onRead();
        // Typed union of route targets; cast keeps TanStack navigate happy.
        navigate(n.link as never);
      }}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-elegant transition-colors",
        n.read
          ? "border-border bg-surface/50 hover:border-border-strong"
          : "border-gold/30 bg-gold/[0.05] hover:border-gold/50",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          n.read ? "bg-surface-3 text-muted-foreground" : "bg-gold/15 text-gold",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground">{n.title}</p>
          {!n.read && <span className="size-2 shrink-0 rounded-full bg-gold" />}
        </div>
        <p className="mt-0.5 text-sm text-secondary-foreground">{n.body}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
      </div>
    </button>
  );
}
