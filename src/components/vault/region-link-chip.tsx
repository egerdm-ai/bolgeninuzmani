import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { regionSlugForName } from "@/lib/mock/matching";

/**
 * Region chip that links to /dashboard/regions/$slug when a region page exists,
 * otherwise renders a static chip. Used on professional cards & profile.
 */
export function RegionLinkChip({
  region,
  withIcon,
  className,
}: {
  region: string;
  withIcon?: boolean;
  className?: string;
}) {
  const slug = regionSlugForName(region);
  const base = cn(
    "inline-flex items-center gap-1 rounded-md bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold ring-1 ring-inset ring-gold/20 transition-colors",
    slug && "hover:bg-gold/20",
    className,
  );

  const inner = (
    <>
      {withIcon && <MapPin className="size-3" />}
      {region}
    </>
  );

  if (!slug) return <span className={base}>{inner}</span>;

  return (
    <Link
      to="/dashboard/regions/$slug"
      params={{ slug }}
      onClick={(e) => e.stopPropagation()}
      className={base}
    >
      {inner}
    </Link>
  );
}
