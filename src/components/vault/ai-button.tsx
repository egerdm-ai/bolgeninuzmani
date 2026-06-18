import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { featureFlags } from "@/lib/feature-flags";

export function AIButton({
  children = "AI ile Portföy Oluştur",
  className,
  onClick,
  size = "default",
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  size?: "sm" | "default" | "lg";
}) {
  // AI (Asistan + içe aktarma) is deferred (D18). Hide all AI entry points until enabled.
  if (!featureFlags.assistant && !featureFlags.aiImport) return null;

  const classes = cn(
    "group relative gap-2 border-gold/40 bg-gold/5 text-gold hover:bg-gold/10 hover:text-gold-light",
    className,
  );

  // When no explicit handler is supplied, default to the Asistan import flow.
  if (!onClick) {
    return (
      <Button asChild size={size} variant="outline" className={classes}>
        <Link to="/dashboard/assistant">
          <Sparkles className="size-4 transition-transform group-hover:scale-110" />
          {children}
        </Link>
      </Button>
    );
  }

  return (
    <Button onClick={onClick} size={size} variant="outline" className={classes}>
      <Sparkles className="size-4 transition-transform group-hover:scale-110" />
      {children}
    </Button>
  );
}
