import { MapPin, Layers } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

function priceLabel(price: number, currency: string) {
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
  if (price >= 1_000_000) return `${(price / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}M ${sym}`;
  return `${(price / 1000).toFixed(0)}K ${sym}`;
}

export function MapCanvasMock({
  portfolios,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  className,
}: {
  portfolios: Portfolio[];
  selectedId?: string;
  hoveredId?: string | null;
  onSelect?: (p: Portfolio) => void;
  onHover?: (p: Portfolio | null) => void;
  className?: string;
}) {
  // Mock clustering: show the first ~14 as individual bubbles, collapse the
  // remainder into a single cluster marker.
  const MAX_PINS = 14;
  const pins = portfolios.slice(0, MAX_PINS);
  const clustered = portfolios.length - pins.length;

  return (
    <div
      className={cn("relative size-full overflow-hidden rounded-2xl border border-border", className)}
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 25% 30%, oklch(0.24 0.03 250 / 0.7), transparent 50%), radial-gradient(ellipse at 75% 65%, oklch(0.2 0.035 245 / 0.6), transparent 45%), linear-gradient(160deg, oklch(0.17 0.018 252), oklch(0.13 0.012 250))",
      }}
    >
      {/* grid */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* mock coastline */}
      <svg className="absolute inset-0 size-full opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path
          d="M0,62 C18,55 30,70 46,60 C60,52 70,66 84,58 C92,54 100,60 100,60 L100,100 L0,100 Z"
          fill="oklch(0.16 0.03 245 / 0.6)"
          stroke="oklch(0.759 0.129 84.1 / 0.25)"
          strokeWidth="0.4"
        />
      </svg>

      {pins.map((p) => {
        const selected = p.id === selectedId;
        const hovered = p.id === hoveredId;
        return (
          <button
            key={p.id}
            onClick={() => onSelect?.(p)}
            onMouseEnter={() => onHover?.(p)}
            onMouseLeave={() => onHover?.(null)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:z-20 hover:scale-110",
              (selected || hovered) && "z-20 scale-110",
            )}
            style={{ left: `${p.mapX}%`, top: `${p.mapY}%` }}
          >
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-elegant ring-1 ring-inset transition-colors",
                selected
                  ? "bg-gradient-gold text-primary-foreground ring-gold"
                  : hovered
                    ? "bg-surface-3 text-gold ring-gold/50"
                    : "bg-surface text-gold ring-border-strong hover:bg-surface-3",
              )}
            >
              <MapPin className="size-3" />
              {priceLabel(p.price, p.currency)}
            </span>
          </button>
        );
      })}

      {/* Cluster marker */}
      {clustered > 0 && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: "62%", top: "42%" }}
        >
          <span className="flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-bold text-gold shadow-elegant ring-1 ring-inset ring-gold/40 backdrop-blur">
            <Layers className="size-3.5" />+{clustered}
          </span>
        </div>
      )}

      <div className="absolute bottom-3 left-3 rounded-md bg-background/70 px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-inset ring-border-strong backdrop-blur">
        Yaklaşık konumlar gösterilmektedir
      </div>
    </div>
  );
}
