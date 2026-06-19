import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type Mode = Database["public"]["Enums"]["portfolio_mode"];

/**
 * "Kapalı Portföy" badge for call_only portfolios (D36 — display only; the
 * contact-only flow change lands in 3C). Renders nothing for 'controlled'.
 */
export function ClosedModeBadge({ mode, className }: { mode: Mode; className?: string }) {
  if (mode !== "call_only") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold ring-1 ring-inset ring-gold/30 backdrop-blur",
        className,
      )}
    >
      <Phone className="size-3" /> Kapalı Portföy
    </span>
  );
}

/** Human-readable portfolio number (D39), small + secondary. */
export function RefNoText({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("text-[11px] text-muted-foreground", className)}>Portföy No: {value}</span>
  );
}

/**
 * D37 locked transparency — shows WHAT unlocks after an approved Detay Talebi
 * (static labels, NOT values) + optional locked-photo COUNT (a non-identifying
 * number; values never shown). Controlled portfolios only.
 */
export function LockedRevealList({ photoCount }: { photoCount?: number | null }) {
  const items = ["Tam adres", "Malik bilgisi", "Tapu / belgeler", "Özel notlar"];
  return (
    <div className="space-y-1.5 text-left">
      <p className="text-[11px] font-medium text-muted-foreground">Onay sonrası açılır:</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span
            key={i}
            className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-secondary-foreground"
          >
            {i}
          </span>
        ))}
        {photoCount != null && photoCount > 0 && (
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-secondary-foreground">
            🔒 {photoCount} kilitli fotoğraf
          </span>
        )}
      </div>
    </div>
  );
}
