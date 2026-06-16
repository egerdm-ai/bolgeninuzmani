import type { ReactNode } from "react";
import { ShieldCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrokerAvatar } from "./broker-avatar";

/**
 * ProfessionalIdentityHeader — the single source of truth for the professional
 * identity composition (cover + avatar + name/role/company/location).
 *
 * Core layout rule that fixes the historical overlap bug:
 *   - The COVER is a purely decorative/atmospheric band at the top.
 *   - Only the AVATAR overlaps the lower edge of the cover (controlled, via a
 *     negative margin). The avatar lives in its own `z-10` layer so it is never
 *     clipped behind the cover.
 *   - The IDENTITY TEXT (name, role, company, location) ALWAYS sits in the safe
 *     content zone *below* the cover. It never floats over the cover image and
 *     never collides with the avatar.
 *
 * Used by: ProfessionalCard (variant="card"), ProfessionalProfile hero
 * (variant="hero") and the landing "Profesyonel Ağ" mockup.
 */

type Variant = "card" | "hero";

const VARIANT = {
  card: {
    cover: "h-28",
    avatar: "size-20",
    pull: "-mt-12",
    px: "px-5",
    name: "font-display text-lg font-semibold",
    role: "text-sm",
    gap: "mt-3",
  },
  hero: {
    cover: "h-28 sm:h-36",
    avatar: "size-24 text-2xl",
    pull: "-mt-14",
    px: "px-5 sm:px-7",
    name: "font-display text-2xl font-semibold tracking-tight sm:text-3xl",
    role: "text-sm",
    gap: "mt-4",
  },
} satisfies Record<Variant, Record<string, string>>;

export function ProfessionalIdentityHeader({
  name,
  title,
  company,
  location,
  avatarSrc,
  coverSrc,
  variant = "card",
  verified = true,
  nameSlot,
  coverBadge,
  badges,
  actions,
  className,
}: {
  name: string;
  title?: string;
  company?: string;
  location?: string;
  avatarSrc?: string;
  coverSrc?: string;
  variant?: Variant;
  verified?: boolean;
  /** Custom name node (e.g. a Link). Falls back to plain text. */
  nameSlot?: ReactNode;
  /** Rendered top-right of the cover band (e.g. membership badge). */
  coverBadge?: ReactNode;
  /** Badge / chip row rendered directly under the identity text. */
  badges?: ReactNode;
  /** Action buttons (hero only) rendered to the right of identity on desktop. */
  actions?: ReactNode;
  className?: string;
}) {
  const v = VARIANT[variant];

  const identity = (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        {nameSlot ?? (
          <span className={cn("truncate text-foreground", v.name)}>{name}</span>
        )}
        {verified && (
          <ShieldCheck className="size-4 shrink-0 text-gold" aria-label="Doğrulanmış" />
        )}
      </div>
      {(title || company) && (
        <p className={cn("mt-0.5 truncate text-muted-foreground", v.role)}>
          {title}
          {title && company && <span className="text-border-strong"> · </span>}
          {company && <span className="font-medium text-gold">{company}</span>}
        </p>
      )}
      {location && (
        <p className={cn("mt-1 flex items-center gap-1 text-xs text-muted-foreground")}>
          <MapPin className="size-3 shrink-0 text-gold" /> {location}
        </p>
      )}
    </div>
  );

  return (
    <div className={className}>
      {/* Cover band — decorative atmospheric layer only */}
      <div className={cn("relative overflow-hidden", v.cover)}>
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            loading="lazy"
            className="size-full object-cover opacity-55 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-gradient-surface" />
        )}
        {/* strong bottom protection so the avatar/content edge reads cleanly */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, oklch(0.78 0.12 85 / 0.18), transparent 45%)",
          }}
        />
        {coverBadge && <div className="absolute right-3 top-3 z-10">{coverBadge}</div>}
      </div>

      {/* Content zone — text always lives here, never over the cover */}
      <div className={v.px}>
        {variant === "hero" ? (
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
              <div className={cn("relative z-10 inline-flex", v.pull)}>
                <BrokerAvatar
                  name={name}
                  src={avatarSrc}
                  size="xl"
                  className={cn("ring-4 ring-surface", v.avatar)}
                />
              </div>
              <div className={v.gap}>{identity}</div>
              {badges && <div className="mt-3 flex flex-wrap items-center gap-1.5">{badges}</div>}
            </div>
            {actions && (
              <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div>
            )}
          </div>
        ) : (
          <>
            <div className={cn("relative z-10 inline-flex", v.pull)}>
              <BrokerAvatar
                name={name}
                src={avatarSrc}
                size="xl"
                className={cn("ring-4 ring-surface", v.avatar)}
              />
            </div>
            <div className={v.gap}>{identity}</div>
            {badges && <div className="mt-3 flex flex-wrap items-center gap-1.5">{badges}</div>}
          </>
        )}
      </div>
    </div>
  );
}
