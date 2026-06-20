import { useEffect, useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { followAgent, unfollowAgent, isFollowing } from "@/lib/data/follows";

/**
 * B11 Takip Et — real, own-scoped. Hidden for anon viewers and on your OWN profile.
 * Resolves the target agent's user id from username (verified members may read
 * profiles), then toggles a follow edge. No D13 data.
 */
export function FollowButton({ username }: { username: string }) {
  const { user, profile } = useAuth();
  const [targetId, setTargetId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  const isSelf = profile?.username === username;

  useEffect(() => {
    if (!user || isSelf) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (!active || !data) return;
      setTargetId(data.id);
      const f = await isFollowing(user.id, data.id).catch(() => false);
      if (active) setFollowing(f);
    })();
    return () => {
      active = false;
    };
  }, [user, isSelf, username]);

  if (!user || isSelf || !targetId) return null;

  async function toggle() {
    if (!user || !targetId) return;
    setBusy(true);
    const next = !following;
    try {
      if (next) await followAgent(user.id, targetId);
      else await unfollowAgent(user.id, targetId);
      setFollowing(next);
      toast.success(next ? "Takip ediliyor." : "Takipten çıkıldı.");
    } catch (e) {
      toast.error("İşlem başarısız", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      onClick={toggle}
      disabled={busy}
      className={cn(
        "gap-1.5",
        !following && "bg-gradient-gold text-primary-foreground hover:opacity-90",
      )}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : following ? (
        <UserCheck className="size-4" />
      ) : (
        <UserPlus className="size-4" />
      )}
      {following ? "Takiptesin" : "Takip Et"}
    </Button>
  );
}
