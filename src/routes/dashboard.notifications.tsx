import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, Inbox, X, Sparkles, type LucideIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/vault/cards";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/use-notifications";

export const Route = createFileRoute("/dashboard/notifications")({
  component: Notifications,
});

// kind → icon + tone (gold default; destructive for rejections; future kinds fall back).
function kindVisual(kind: string): { Icon: LucideIcon; tone: string } {
  const k = kind.toLowerCase();
  if (k.includes("reject")) return { Icon: X, tone: "bg-destructive/10 text-destructive" };
  if (k.includes("approv") || k.includes("grant") || k.includes("accept"))
    return { Icon: CheckCheck, tone: "bg-gold/10 text-gold" };
  if (k.includes("request")) return { Icon: Inbox, tone: "bg-surface-3 text-gold" };
  if (k.includes("match")) return { Icon: Sparkles, tone: "bg-gold/10 text-gold" };
  return { Icon: Bell, tone: "bg-surface-3 text-gold" };
}

function relTime(iso: string): string {
  const sec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (sec < 60) return "az önce";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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
          {notifications.map((n) => {
            const { Icon, tone } = kindVisual(n.kind);
            return (
              <button
                key={n.id}
                onClick={() => {
                  markRead(n.id);
                  if (n.link) navigate(n.link as never);
                }}
                className={cn(
                  "relative flex w-full items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 pl-5 text-left transition-colors",
                  n.read
                    ? "border-border bg-surface hover:border-border-strong"
                    : "border-gold/30 bg-gold/[0.05] hover:border-gold/50",
                )}
              >
                {/* unread accent bar */}
                {!n.read && <span className="absolute inset-y-0 left-0 w-1 bg-gradient-gold" />}
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                    tone,
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        n.read ? "text-secondary-foreground" : "text-foreground",
                      )}
                    >
                      {n.title}
                    </p>
                    <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">
                      {relTime(n.created_at)}
                    </span>
                  </div>
                  {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
