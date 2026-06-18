import { Lock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "muted" | "info" | "danger" | "gold";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/15 text-success ring-success/25",
  warning: "bg-warning/15 text-warning ring-warning/25",
  info: "bg-info/15 text-info ring-info/25",
  danger: "bg-destructive/15 text-destructive ring-destructive/25",
  muted: "bg-muted text-muted-foreground ring-border",
  gold: "bg-gold/15 text-gold ring-gold/30",
};

export function StatusBadge({
  label,
  tone = "muted",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
    >
      {tone === "success" && <span className="size-1.5 rounded-full bg-success" />}
      {label}
    </span>
  );
}

export function FeatureChip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs text-secondary-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function CategoryChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold ring-1 ring-inset ring-gold/20">
      {label}
    </span>
  );
}

export function LockedBadge({ label = "Kilitli" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-background/70 px-2 py-0.5 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-border-strong backdrop-blur">
      <Lock className="size-3" />
      {label}
    </span>
  );
}

export function VisibilityBadge({
  visibility,
}: {
  visibility: "verified_members" | "invite_only";
}) {
  return (
    <StatusBadge
      tone={visibility === "invite_only" ? "gold" : "info"}
      label={visibility === "invite_only" ? "Sadece Davetle" : "Üyelere Açık"}
    />
  );
}

export function RegionExpertBadge({ region, className }: { region?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold ring-1 ring-inset ring-gold/30",
        className,
      )}
    >
      <Award className="size-3" />
      {region ? (region.endsWith("Uzmanı") ? region : `${region} Uzmanı`) : "Bölge Uzmanı"}
    </span>
  );
}

export function MembershipBadge({
  tier,
  label,
  className,
}: {
  tier: "standard" | "pro" | "elite";
  label?: string;
  className?: string;
}) {
  const text = label ?? (tier === "standard" ? null : tier);
  if (!text) return null;
  const muted =
    text.toLocaleLowerCase("tr") === "private beta" || text.toLocaleLowerCase("tr") === "pro";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        muted
          ? "bg-surface-3 text-secondary-foreground ring-1 ring-inset ring-border-strong"
          : "bg-gradient-gold text-primary-foreground",
        className,
      )}
    >
      {text}
    </span>
  );
}
