import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";

export function BrokerAvatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-12 text-base",
    xl: "size-16 text-lg",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-gold font-semibold text-primary-foreground ring-1 ring-border-strong",
        sizes[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="size-full rounded-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
