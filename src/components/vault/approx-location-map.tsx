import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mocked dark map with an approximate location radius. */
export function ApproxLocationMap({
  label,
  radiusKm = 1.5,
  x = 50,
  y = 50,
  className,
}: {
  label: string;
  radiusKm?: number;
  x?: number;
  y?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[16/9] overflow-hidden rounded-xl border border-border bg-surface-2",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 20%, oklch(0.22 0.02 254 / 0.6), transparent 45%), radial-gradient(circle at 80% 70%, oklch(0.2 0.03 250 / 0.5), transparent 40%), linear-gradient(160deg, oklch(0.18 0.017 253), oklch(0.14 0.012 250))",
      }}
    >
      {/* grid lines */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* approximate radius */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/40 bg-gold/10"
        style={{ left: `${x}%`, top: `${y}%`, width: "44%", height: "62%" }}
      />
      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold">
          <MapPin className="size-4" />
        </span>
      </div>
      <div className="absolute bottom-3 left-3 rounded-md bg-background/70 px-2.5 py-1 text-xs text-secondary-foreground ring-1 ring-inset ring-border-strong backdrop-blur">
        ~{label} · {radiusKm} km yaklaşık alan
      </div>
    </div>
  );
}
