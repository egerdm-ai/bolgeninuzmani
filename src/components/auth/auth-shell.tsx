import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

/**
 * Centered auth layout (login / signup) in the dark-luxury system. Brand
 * wordmark on top, a surface card holding the form. No redesign — reuses the
 * existing tokens (background, surface, gold).
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
            Bölgenin Uzmanı
          </span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
