import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { listSavedIds, savePortfolio, unsavePortfolio } from "@/lib/data/saved";

/**
 * B11 Kaydet — real bookmark state for the logged-in user. Loads saved ids once,
 * exposes isSaved + an optimistic toggle. `enabled` is false for anon (no bookmarks).
 */
export function useSavedPortfolios() {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    let active = true;
    listSavedIds(user.id)
      .then((a) => active && setIds(new Set(a)))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  const isSaved = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(
    async (id: string) => {
      if (!user) return;
      const had = ids.has(id);
      setIds((prev) => {
        const n = new Set(prev);
        if (had) n.delete(id);
        else n.add(id);
        return n;
      });
      try {
        if (had) await unsavePortfolio(user.id, id);
        else await savePortfolio(user.id, id);
      } catch (e) {
        // revert on failure
        setIds((prev) => {
          const n = new Set(prev);
          if (had) n.add(id);
          else n.delete(id);
          return n;
        });
        toast.error("Kaydedilemedi", { description: e instanceof Error ? e.message : String(e) });
      }
    },
    [user, ids],
  );

  return { isSaved, toggle, enabled: !!user };
}
