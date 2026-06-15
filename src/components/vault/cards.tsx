import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export function SurfaceCard({
  children,
  className,
  hover,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant",
        hover && "transition-colors hover:border-border-strong",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  deltaTone = "success",
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "danger" | "muted";
  icon?: LucideIcon;
}) {
  return (
    <SurfaceCard className="p-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "mt-1 text-xs font-medium",
            deltaTone === "success" && "text-success",
            deltaTone === "danger" && "text-destructive",
            deltaTone === "muted" && "text-muted-foreground",
          )}
        >
          {delta}
        </div>
      )}
    </SurfaceCard>
  );
}

export function QuickActionCard({
  label,
  description,
  icon: Icon,
  onClick,
  accent,
}: {
  label: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5",
        accent
          ? "border-gold/40 bg-gold/10 hover:shadow-gold"
          : "border-border bg-surface-2 hover:border-border-strong",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          accent ? "bg-gradient-gold text-primary-foreground" : "bg-surface-3 text-gold",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 font-semibold text-foreground">
          {label}
          <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        )}
      </span>
    </button>
  );
}

export function InfoPanel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SurfaceCard className={cn("p-0", className)}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </SurfaceCard>
  );
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-surface-3 text-gold">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
