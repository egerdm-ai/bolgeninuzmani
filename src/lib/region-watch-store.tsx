import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { NotificationFrequency, RegionWatch } from "./mock/types";

type RegionWatchContextValue = {
  watches: RegionWatch[];
  isWatching: (slug: string) => boolean;
  frequencyFor: (slug: string) => NotificationFrequency | null;
  toggleWatch: (slug: string, name?: string) => void;
  setFrequency: (slug: string, frequency: NotificationFrequency) => void;
};

const RegionWatchContext = createContext<RegionWatchContextValue | null>(null);

export function RegionWatchProvider({ children }: { children: ReactNode }) {
  // TODO[backend]: seed from `region_watches` where user_id = auth.uid().
  const [watches, setWatches] = useState<RegionWatch[]>([
    { slug: "bebek", frequency: "instant" },
    { slug: "bodrum", frequency: "daily" },
  ]);

  const toggleWatch = useCallback((slug: string, name?: string) => {
    setWatches((prev) => {
      const exists = prev.some((w) => w.slug === slug);
      toast[exists ? "info" : "success"](
        exists ? "Bölge takibi bırakıldı" : "Bölge takibe alındı",
        name ? { description: name } : undefined,
      );
      return exists
        ? prev.filter((w) => w.slug !== slug)
        : [...prev, { slug, frequency: "instant" }];
    });
  }, []);

  const setFrequency = useCallback(
    (slug: string, frequency: NotificationFrequency) => {
      setWatches((prev) =>
        prev.map((w) => (w.slug === slug ? { ...w, frequency } : w)),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      watches,
      isWatching: (slug: string) => watches.some((w) => w.slug === slug),
      frequencyFor: (slug: string) =>
        watches.find((w) => w.slug === slug)?.frequency ?? null,
      toggleWatch,
      setFrequency,
    }),
    [watches, toggleWatch, setFrequency],
  );

  return (
    <RegionWatchContext.Provider value={value}>
      {children}
    </RegionWatchContext.Provider>
  );
}

export function useRegionWatch() {
  const ctx = useContext(RegionWatchContext);
  if (!ctx)
    throw new Error("useRegionWatch must be used within RegionWatchProvider");
  return ctx;
}
