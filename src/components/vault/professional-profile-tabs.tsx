import { cn } from "@/lib/utils";

export type ProfileTab = "portfolios" | "searches" | "about" | "regions" | "similar";

export const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: "portfolios", label: "Portföyleri" },
  { id: "searches", label: "Arayışları" },
  { id: "about", label: "Hakkında" },
  { id: "regions", label: "Uzmanlık Bölgeleri" },
  { id: "similar", label: "Benzer Profesyoneller" },
];

/**
 * Sticky tab bar shown below the professional hero. Switches the visible
 * profile section locally. Counts are optional pill badges per tab.
 */
export function ProfessionalProfileTabs({
  active,
  onChange,
  counts,
  tabs,
}: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  counts?: Partial<Record<ProfileTab, number>>;
  /** Optional subset/order of tabs to show (defaults to all). */
  tabs?: ProfileTab[];
}) {
  const visible = tabs ? profileTabs.filter((t) => tabs.includes(t.id)) : profileTabs;
  return (
    <div className="sticky top-16 z-20 -mx-1 mb-6 rounded-2xl border border-border bg-surface/80 p-1.5 shadow-elegant backdrop-blur-xl">
      <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visible.map((t) => {
          const isActive = active === t.id;
          const count = counts?.[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors sm:px-4",
                isActive
                  ? "bg-gradient-gold text-primary-foreground shadow-gold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
            >
              {t.label}
              {count != null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                    // active tab is gold → a solid token chip reads in both themes
                    isActive
                      ? "bg-background text-foreground"
                      : "bg-surface-3 text-secondary-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
