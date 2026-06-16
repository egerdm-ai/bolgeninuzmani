import { Link } from "@tanstack/react-router";
import { Search, Bell, Plus, Menu, ChevronDown, UserRound, Settings, LogOut, CheckCheck } from "lucide-react";
import { currentUser } from "@/lib/mock/data";
import { Button } from "@/components/ui/button";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { AIButton } from "@/components/vault/ai-button";
import { useNotifications } from "@/lib/notification-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({
  onOpenMobileNav,
  searchPlaceholder = "Lokasyon, portföy başlığı veya ID ara...",
}: {
  onOpenMobileNav?: () => void;
  searchPlaceholder?: string;
}) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onOpenMobileNav}
        className="flex size-9 items-center justify-center rounded-lg border border-border text-secondary-foreground lg:hidden"
        aria-label="Menü"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <AIButton size="default" className="hidden md:inline-flex" />
        <Button asChild className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
          <Link to="/dashboard/portfolios/new">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Portföy Oluştur</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative" aria-label="Bildirimler">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-semibold text-foreground">Bildirimler</span>
              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1 text-[11px] text-gold transition-colors hover:underline disabled:opacity-40"
              >
                <CheckCheck className="size-3" /> Tümünü oku
              </button>
            </div>
            <DropdownMenuSeparator className="my-0" />
            <div className="max-h-80 overflow-y-auto py-1">
              {notifications.slice(0, 5).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="cursor-pointer flex-col items-start gap-0.5 px-3 py-2"
                  onSelect={() => {
                    markRead(n.id);
                    navigate(n.link as never);
                  }}
                >
                  <span className="flex w-full items-center gap-2">
                    {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-gold" />}
                    <span className={cn("text-xs font-semibold", n.read ? "text-secondary-foreground" : "text-foreground")}>
                      {n.title}
                    </span>
                  </span>
                  <span className="line-clamp-2 text-[11px] text-muted-foreground">{n.body}</span>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem asChild className="cursor-pointer justify-center">
              <Link to="/dashboard/notifications" className="py-2 text-xs font-medium text-gold">
                Tüm bildirimleri gör
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 py-1 pl-1 pr-2 transition-colors hover:border-border-strong">
              <BrokerAvatar name={currentUser.fullName} size="sm" />
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-semibold">{currentUser.fullName}</div>
              <div className="text-xs font-normal text-muted-foreground">{currentUser.title}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/dashboard/profile"><UserRound className="size-4" /> Profilim</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/dashboard/settings"><Settings className="size-4" /> Ayarlar</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/"><LogOut className="size-4" /> Çıkış Yap</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
