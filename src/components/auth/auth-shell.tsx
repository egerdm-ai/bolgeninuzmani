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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* ambient brand glow — subtle in both themes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-2 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-gold text-primary-foreground shadow-gold">
            <ShieldCheck className="size-5" />
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
            Bölgenin Uzmanı
          </span>
        </Link>
        <p className="mb-8 text-center text-xs tracking-wide text-muted-foreground">
          Doğrulanmış emlak profesyonelleri ağı
        </p>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-elegant">
          {/* gold top accent */}
          <div className="h-1 bg-gradient-gold" />
          <div className="p-6 sm:p-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
