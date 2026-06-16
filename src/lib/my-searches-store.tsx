import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { mySearches as seedMySearches } from "@/lib/mock/matching";
import { currentUser, professionals } from "@/lib/mock/data";
import type { BuyerSearch, NotificationFrequency } from "@/lib/mock/types";

// ---------------------------------------------------------------------------
// "Arayışlarım" local store — the current user's own saved buyer searches.
// Mock-only / in-memory. TODO[backend]: persist to `buyer_searches` for auth.uid().
// ---------------------------------------------------------------------------

const owner = professionals.find((p) => p.id === currentUser.id) ?? professionals[0];

let counter = 0;
const nextId = () => `my_${Date.now()}_${counter++}`;

export type CreateMySearchInput = Partial<BuyerSearch> & {
  title: string;
  region: string;
  city: string;
  type: BuyerSearch["type"];
};

type MySearchesContextValue = {
  searches: BuyerSearch[];
  getById: (id: string) => BuyerSearch | undefined;
  create: (input: CreateMySearchInput) => string;
  saveFromNetwork: (source: BuyerSearch) => string;
  update: (id: string, patch: Partial<BuyerSearch>) => void;
  setStatus: (id: string, status: BuyerSearch["status"]) => void;
  setNotify: (id: string, notify: NotificationFrequency) => void;
  savedNetworkIds: string[];
  isNetworkSaved: (networkId: string) => boolean;
};

const MySearchesContext = createContext<MySearchesContextValue | null>(null);

export function MySearchesProvider({ children }: { children: ReactNode }) {
  const [searches, setSearches] = useState<BuyerSearch[]>(seedMySearches);
  // network search id -> generated my-search id
  const [savedNetwork, setSavedNetwork] = useState<Record<string, string>>({});

  const getById = useCallback(
    (id: string) => searches.find((s) => s.id === id),
    [searches],
  );

  const create = useCallback((input: CreateMySearchInput) => {
    const id = nextId();
    const search: BuyerSearch = {
      id,
      title: input.title,
      clientType: input.clientType ?? "Bireysel Alıcı",
      city: input.city,
      region: input.region,
      type: input.type,
      budgetMin: input.budgetMin ?? 0,
      budgetMax: input.budgetMax ?? Number.MAX_SAFE_INTEGER,
      currency: input.currency ?? "TRY",
      rooms: input.rooms,
      minM2: input.minM2,
      mustHave: input.mustHave ?? [],
      niceToHave: input.niceToHave ?? [],
      urgency: input.urgency ?? "medium",
      notes: input.notes,
      visibility: input.visibility ?? "private",
      status: input.status ?? "active",
      matchCount: input.matchCount ?? 0,
      createdAt: "az önce",
      owner,
      views: 0,
      responses: 0,
      savedBy: 0,
      notify: input.notify ?? "instant",
      clientLabel: input.clientLabel,
      lastMatchAt: input.lastMatchAt ?? "az önce",
    };
    setSearches((prev) => [search, ...prev]);
    return id;
  }, []);

  const saveFromNetwork = useCallback(
    (source: BuyerSearch) => {
      const existing = savedNetwork[source.id];
      if (existing) {
        toast.info("Bu arayış zaten Arayışlarım'da kayıtlı");
        return existing;
      }
      const id = nextId();
      const copy: BuyerSearch = {
        ...source,
        id,
        owner,
        visibility: "private",
        status: "active",
        createdAt: "az önce",
        views: 0,
        responses: 0,
        savedBy: 0,
        notify: "instant",
        clientLabel: source.clientLabel ?? `${source.owner.fullName} arayışı`,
        notes: `Network arayışından kaydedildi (${source.owner.fullName}). ${source.notes ?? ""}`.trim(),
      };
      setSearches((prev) => [copy, ...prev]);
      setSavedNetwork((prev) => ({ ...prev, [source.id]: id }));
      toast.success("Arayışlarım'a kaydedildi", { description: source.title });
      return id;
    },
    [savedNetwork],
  );

  const update = useCallback((id: string, patch: Partial<BuyerSearch>) => {
    setSearches((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const setStatus = useCallback(
    (id: string, status: BuyerSearch["status"]) => {
      update(id, { status });
      toast.success(
        status === "closed" ? "Arayış pasifleştirildi" : "Arayış güncellendi",
      );
    },
    [update],
  );

  const setNotify = useCallback(
    (id: string, notify: NotificationFrequency) => {
      update(id, { notify });
    },
    [update],
  );

  const value = useMemo<MySearchesContextValue>(
    () => ({
      searches,
      getById,
      create,
      saveFromNetwork,
      update,
      setStatus,
      setNotify,
      savedNetworkIds: Object.keys(savedNetwork),
      isNetworkSaved: (networkId: string) => Boolean(savedNetwork[networkId]),
    }),
    [searches, getById, create, saveFromNetwork, update, setStatus, setNotify, savedNetwork],
  );

  return <MySearchesContext.Provider value={value}>{children}</MySearchesContext.Provider>;
}

export function useMySearches() {
  const ctx = useContext(MySearchesContext);
  if (!ctx) throw new Error("useMySearches must be used within MySearchesProvider");
  return ctx;
}
