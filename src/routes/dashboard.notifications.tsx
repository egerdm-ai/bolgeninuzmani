import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/vault/cards";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/use-notifications";

export const Route = createFileRoute("/dashboard/notifications")({
  component: Notifications,
});

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Bildirimler"
        subtitle="Detay talepleri, onaylar ve ağ etkinlikleriniz."
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
        <EmptyStateCard
          icon={Bell}
          title="Henüz bildirim yok"
          description="Portföylerinize detay talebi geldiğinde veya talepleriniz yanıtlandığında burada görünür."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                markRead(n.id);
                if (n.link) navigate(n.link as never);
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                n.read
                  ? "border-border bg-surface hover:border-border-strong"
                  : "border-gold/30 bg-gold/[0.05] hover:border-gold/50",
              )}
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-gold">
                <Bell className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-gold" />}
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      n.read ? "text-secondary-foreground" : "text-foreground",
                    )}
                  >
                    {n.title}
                  </p>
                </div>
                {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                <p className="mt-0.5 text-[11px] text-muted-foreground">{fmt(n.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
