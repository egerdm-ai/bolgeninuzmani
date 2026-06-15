import { MapPin } from "lucide-react";
import type { RegionExpertise } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

/** Mocked dark map highlighting a professional's approximate expertise areas. */
export function ExpertiseMap({
  regions,
  activeRegion,
  onSelectRegion,
  className,
}: {
  regions: RegionExpertise[];
  activeRegion?: string | null;
  onSelectRegion?: (region: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[16/9] overflow-hidden rounded-xl border border-border",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 20%, oklch(0.22 0.02 254 / 0.6), transparent 45%), radial-gradient(circle at 80% 70%, oklch(0.2 0.03 250 / 0.5), transparent 40%), linear-gradient(160deg, oklch(0.18 0.017 253), oklch(0.14 0.012 250))",
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {regions.map((r) => {
        const active = activeRegion === r.region;
        return (
          <button
            key={r.region}
            type="button"
            onClick={() => onSelectRegion?.(r.region)}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-full transition-all",
                active
                  ? "size-10 bg-gradient-gold text-primary-foreground shadow-gold ring-2 ring-gold/40"
                  : "size-8 bg-background/80 text-gold ring-1 ring-gold/40 backdrop-blur group-hover:scale-110",
              )}
            >
              <MapPin className="size-4" />
            </span>
            <span
              className={cn(
                "mt-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-medium backdrop-blur",
                active
                  ? "bg-gold/20 text-gold"
                  : "bg-background/70 text-secondary-foreground",
              )}
            >
              {r.region}
            </span>
          </button>
        );
      })}
      <div className="absolute bottom-3 left-3 rounded-md bg-background/70 px-2.5 py-1 text-xs text-secondary-foreground ring-1 ring-inset ring-border-strong backdrop-blur">
        Uzmanlık bölgeleri · yaklaşık alan
      </div>
    </div>
  );
}
