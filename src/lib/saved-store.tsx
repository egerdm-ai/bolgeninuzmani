import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

type SavedContextValue = {
  savedPortfolios: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  savedSearchIds: string[];
  saveSearch: (label: string) => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedPortfolios, setSavedPortfolios] = useState<string[]>(["p_003"]);
  const [savedSearchIds, setSavedSearchIds] = useState<string[]>([]);

  const toggleSave = useCallback((id: string) => {
    setSavedPortfolios((prev) => {
      const exists = prev.includes(id);
      toast[exists ? "info" : "success"](
        exists ? "Kaydedilenlerden çıkarıldı" : "Portföy kaydedildi",
      );
      return exists ? prev.filter((x) => x !== id) : [...prev, id];
    });
  }, []);

  const saveSearch = useCallback((label: string) => {
    setSavedSearchIds((prev) => [...prev, label]);
    toast.success("Arama kaydedildi", { description: label });
  }, []);

  const value = useMemo(
    () => ({
      savedPortfolios,
      isSaved: (id: string) => savedPortfolios.includes(id),
      toggleSave,
      savedSearchIds,
      saveSearch,
    }),
    [savedPortfolios, toggleSave, savedSearchIds, saveSearch],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
