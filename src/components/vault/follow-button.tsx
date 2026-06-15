import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFollow } from "@/lib/follow-store";

export function FollowButton({
  id,
  name,
  size,
  className,
  fullWidth,
}: {
  id: string;
  name?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  fullWidth?: boolean;
}) {
  const { isFollowing, toggleFollow } = useFollow();
  const following = isFollowing(id);

  return (
    <Button
      size={size}
      variant={following ? "outline" : "default"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFollow(id, name);
      }}
      className={cn(
        "gap-1.5",
        fullWidth && "w-full",
        following
          ? "border-gold/40 bg-gold/10 text-gold hover:bg-gold/15"
          : "bg-gradient-gold text-primary-foreground hover:opacity-90",
        className,
      )}
    >
      {following ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
      {following ? "Takip Ediliyor" : "Takip Et"}
    </Button>
  );
}
