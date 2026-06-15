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

        <Button variant="outline" size="icon" className="relative" aria-label="Bildirimler">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold ring-2 ring-background" />
        </Button>

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
