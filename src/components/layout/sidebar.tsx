import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Search,
  FolderLock,
  Inbox,
  UserRound,
  Settings,
  ShieldCheck,
  Crown,
  ChevronLeft,
  ChevronDown,
  Bell,
  Compass,
  Target,
  Radar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { featureFlags } from "@/lib/feature-flags";
import { useAuth } from "@/lib/auth/auth-context";
import { pendingInboxCount } from "@/lib/data/access";
import { appNotifications } from "@/lib/mock/notifications";
import { BrokerAvatar } from "@/components/vault/broker-avatar";
import { MembershipBadge } from "@/components/vault/badges";

// Notifications are still mock (M5); detail-request count is real (see component).
const unreadNotifications = appNotifications.filter((n) => !n.read).length;

const primaryNav = [
  { label: "Ana Sayfa", to: "/dashboard", icon: LayoutDashboard, exact: true },
] as const;

// Keşfet (discovery) — network / public areas the user browses.
// NOTE: Bölgeler (regions), Arayışlar (searches) and Profesyoneller (professionals)
// are quarantined (deferred — D18). Routes still exist behind feature flags; see
// docs/route-quarantine.md.
type NavItem = {
  label: string;
  to: string;
  icon: typeof Search;
  count?: number;
  exact?: boolean;
};

// Keşfet (discovery) — Portföyler + (Arayış açıkken) Ağ Arayışları.
const discoverChildren: NavItem[] = [
  { label: "Portföyler", to: "/dashboard/search", icon: Search },
  ...(featureFlags.arayis
    ? [{ label: "Ağ Arayışları", to: "/dashboard/searches", icon: Radar }]
    : []),
];

// Main workspace — items that belong to the current user.
// NOTE: Eşleşmeler (/dashboard/matches) and Asistan (/dashboard/assistant) are
// quarantined (deferred — D18); see docs/route-quarantine.md.
const workNav: NavItem[] = [
  { label: "Portföylerim", to: "/dashboard/portfolios", icon: FolderLock },
  ...(featureFlags.arayis
    ? [{ label: "Arayışlarım", to: "/dashboard/my-searches", icon: Target }]
    : []),
  ...(featureFlags.matches
    ? [{ label: "Eşleşmeler", to: "/dashboard/matches", icon: Sparkles }]
    : []),
  { label: "Detay Talepleri", to: "/dashboard/detail-requests", icon: Inbox },
  { label: "Bildirimler", to: "/dashboard/notifications", icon: Bell, count: unreadNotifications },
];

const accountNav = [
  { label: "Profilim", to: "/dashboard/profile", icon: UserRound },
  { label: "Ayarlar", to: "/dashboard/settings", icon: Settings },
] as const;

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (!user) return;
    pendingInboxCount(user.id)
      .then(setPendingRequests)
      .catch(() => {});
  }, [user, pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const discoverActive = discoverChildren.some((c) => isActive(c.to));
  const [discoverOpen, setDiscoverOpen] = useState(discoverActive);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground">
          <ShieldCheck className="size-5" />
        </span>
        {!collapsed && (
          <Link
            to="/dashboard"
            className="font-display text-sm font-bold uppercase tracking-tight whitespace-nowrap text-foreground"
          >
            Bölgenin Uzmanı
          </Link>
        )}
        <button
          onClick={onToggle}
          className="ml-auto hidden size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground lg:flex"
          aria-label="Menüyü daralt"
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Menü
            </p>
          )}
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              active={isActive(item.to, "exact" in item && item.exact)}
              collapsed={collapsed}
            />
          ))}

          {/* Keşfet group */}
          {collapsed ? (
            discoverChildren.map((item) => (
              <NavLink key={item.to} item={item} active={isActive(item.to)} collapsed={collapsed} />
            ))
          ) : (
            <div>
              <button
                onClick={() => setDiscoverOpen((o) => !o)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  discoverActive
                    ? "text-gold"
                    : "text-sidebar-foreground hover:bg-surface-3 hover:text-foreground",
                )}
              >
                <Compass className="size-[18px] shrink-0" />
                <span className="flex-1 truncate text-left">Keşfet</span>
                <ChevronDown
                  className={cn("size-4 transition-transform", discoverOpen && "rotate-180")}
                />
              </button>
              {discoverOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l border-border pl-2">
                  {discoverChildren.map((item) => (
                    <NavLink
                      key={item.to}
                      item={item}
                      active={isActive(item.to)}
                      collapsed={collapsed}
                      sub
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {workNav.map((item) => (
            <NavLink
              key={item.to}
              item={
                item.to === "/dashboard/detail-requests"
                  ? { ...item, count: pendingRequests }
                  : item
              }
              active={isActive(item.to)}
              collapsed={collapsed}
            />
          ))}
        </div>
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Hesap
            </p>
          )}
          {accountNav.map((item) => (
            <NavLink key={item.to} item={item} active={isActive(item.to)} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* Membership + user */}
      <div className="space-y-3 border-t border-border p-3">
        {!collapsed && (
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-gold" />
              <span className="text-sm font-semibold text-foreground">Bölgenin Uzmanı PRO</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sınırsız portföy, öncelikli görünürlük ve gelişmiş AI araçları.
            </p>
            <button className="mt-2.5 w-full rounded-lg bg-gradient-gold py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Yükselt
            </button>
          </div>
        )}
        <Link
          to="/dashboard/profile"
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 p-2 transition-colors hover:border-border-strong",
            collapsed && "justify-center",
          )}
        >
          <BrokerAvatar
            name={profile?.full_name ?? ""}
            src={profile?.avatar_url ?? undefined}
            size="sm"
          />
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="truncate text-xs font-semibold text-foreground">
                  {profile?.full_name}
                </span>
                {profile && <MembershipBadge tier={profile.membership_tier} />}
              </div>
              {profile?.company_name && (
                <span className="truncate text-[11px] text-muted-foreground">
                  {profile.company_name}
                </span>
              )}
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  sub,
}: {
  item: { label: string; to: string; icon: typeof Search; count?: number; accent?: boolean };
  active: boolean;
  collapsed: boolean;
  sub?: boolean;
}) {
  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        sub ? "py-2" : "py-2.5",
        active
          ? "bg-gold/10 text-gold"
          : "text-sidebar-foreground hover:bg-surface-3 hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {active && !sub && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold" />
      )}
      <item.icon
        className={cn(
          "size-[18px] shrink-0",
          sub && "size-4",
          item.accent && !active && "text-gold",
        )}
      />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.count ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-primary-foreground">
          {item.count}
        </span>
      ) : null}
      {collapsed && item.count ? (
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold" />
      ) : null}
    </Link>
  );
}
