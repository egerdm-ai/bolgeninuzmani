import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DetailRequestModal } from "@/components/vault/detail-request-modal";
import { getPortfolioById } from "@/lib/mock/data";
import type { Portfolio } from "@/lib/mock/types";

type DetailRequestContextValue = {
  /** Open the detail-request modal for a portfolio id. */
  open: (portfolioId: string) => void;
  /** Open the modal for a full portfolio object. */
  openPortfolio: (portfolio: Portfolio) => void;
};

const DetailRequestContext = createContext<DetailRequestContextValue | null>(null);

export function DetailRequestProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Portfolio | null>(null);

  const open = useCallback((portfolioId: string) => {
    const p = getPortfolioById(portfolioId);
    if (p) setTarget(p);
  }, []);

  const openPortfolio = useCallback((portfolio: Portfolio) => setTarget(portfolio), []);

  const value = useMemo(() => ({ open, openPortfolio }), [open, openPortfolio]);

  return (
    <DetailRequestContext.Provider value={value}>
      {children}
      <DetailRequestModal
        portfolio={target}
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
      />
    </DetailRequestContext.Provider>
  );
}

export function useDetailRequest() {
  const ctx = useContext(DetailRequestContext);
  if (!ctx) throw new Error("useDetailRequest must be used within DetailRequestProvider");
  return ctx;
}
