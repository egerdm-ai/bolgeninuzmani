import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  return (
    <Button
      onClick={onClick}
      size={size}
      variant="outline"
      className={cn(
        "group relative gap-2 border-gold/40 bg-gold/5 text-gold hover:bg-gold/10 hover:text-gold-light",
        className,
      )}
    >
      <Sparkles className="size-4 transition-transform group-hover:scale-110" />
      {children}
    </Button>
  );
}
