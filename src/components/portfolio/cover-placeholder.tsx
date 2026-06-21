import { Home, Store, Map, Hotel, Briefcase, Gem, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/portfolio-labels";
import type { Database } from "@/lib/database.types";

type Category = Database["public"]["Enums"]["portfolio_category"];

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  konut: Home,
  ticari: Store,
  arsa: Map,
  turizm: Hotel,
  isletme: Briefcase,
  ozel_varlik: Gem,
};

const SIZE = {
  sm: { icon: "size-5", pad: "p-2", label: false },
  md: { icon: "size-6", pad: "p-3", label: true },
  lg: { icon: "size-9", pad: "p-4", label: true },
} as const;

/**
 * Branded cover fallback for portfolios without a photo — a navy→gold gradient with the
 * category icon (gold ring) + a faint watermark + label. Theme-aware (bu-* tokens), so it
 * never reads as a cheap black box. Used by every card/gallery surface so cover-less
 * portfolios still look "full".
 */
export function CoverPlaceholder({
  category,
  size = "md",
  className,
}: {
  category: Category;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const Icon = CATEGORY_ICON[category];
  const s = SIZE[size];
  return (
    <div
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden bg-gradient-to-br from-bu-card-raised via-bu-card to-bu-gold-muted",
        className,
      )}
    >
      {/* corner watermark for brand texture */}
      <Icon className="pointer-events-none absolute -bottom-4 -right-4 size-28 text-bu-gold/[0.06]" />
      <div className="relative flex flex-col items-center gap-2">
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-bu-gold/10 ring-1 ring-inset ring-bu-gold/25",
            s.pad,
          )}
        >
          <Icon className={cn("text-bu-gold", s.icon)} />
        </span>
        {s.label && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-bu-text-3">
            {CATEGORY_LABELS[category]}
          </span>
        )}
      </div>
    </div>
  );
}
