import { useState } from "react";
import { cn } from "@/lib/utils";

export function PortfolioGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-surface">
        <img src={main} alt={title} className="size-full object-cover" />
        <div className="absolute bottom-3 right-3 rounded-md bg-background/70 px-2 py-1 text-xs text-secondary-foreground ring-1 ring-inset ring-border-strong backdrop-blur">
          {active + 1} / {images.length}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === active ? "border-gold" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={img} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
