import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

type FollowContextValue = {
  following: string[];
  isFollowing: (id: string) => boolean;
  toggleFollow: (id: string, name?: string) => void;
  /** Returns the live follower count (base count + local follow state). */
  followerCount: (id: string, base: number) => number;
};

const FollowContext = createContext<FollowContextValue | null>(null);

export function FollowProvider({ children }: { children: ReactNode }) {
  // TODO[backend]: seed from `follows` table where follower_id = auth.uid().
  const [following, setFollowing] = useState<string[]>(["b_003"]);

  const toggleFollow = useCallback((id: string, name?: string) => {
    setFollowing((prev) => {
      const exists = prev.includes(id);
      toast[exists ? "info" : "success"](
        exists ? "Takipten çıkarıldı" : "Profesyonel takip edildi",
        name ? { description: name } : undefined,
      );
      return exists ? prev.filter((x) => x !== id) : [...prev, id];
    });
  }, []);

  const value = useMemo(
    () => ({
      following,
      isFollowing: (id: string) => following.includes(id),
      toggleFollow,
      followerCount: (id: string, base: number) => base + (following.includes(id) ? 1 : 0),
    }),
    [following, toggleFollow],
  );

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}

export function useFollow() {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
}
