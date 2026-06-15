import { useState } from "react";
import { toast } from "sonner";
import { FileText, Lock, Download, Send } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { SurfaceCard } from "./cards";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PdfCtaCard({
  portfolio,
  mode,
  onRequest,
}: {
  portfolio: Portfolio;
  mode: "public" | "member" | "owner";
  onRequest?: () => void;
}) {
  const [view, setView] = useState<"teaser" | "full">("teaser");
  const fullUnlocked = mode === "owner";

  return (
    <SurfaceCard className="p-0">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <FileText className="size-4 text-gold" />
        <h3 className="text-sm font-semibold text-foreground">Portföy PDF</h3>
      </div>
      <div className="p-4">
        {/* Teaser / Full toggle */}
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface-2 p-1">
          <button
            onClick={() => setView("teaser")}
            className={cn(
              "rounded-md py-1.5 text-xs font-medium transition-colors",
              view === "teaser" ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Teaser PDF
          </button>
          <button
            onClick={() => setView("full")}
            className={cn(
              "flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors",
              view === "full" ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {!fullUnlocked && <Lock className="size-3" />} Full PDF
          </button>
        </div>

        {view === "teaser" ? (
          <>
            <p className="text-xs text-muted-foreground">
              Yaklaşık konum, temel bilgiler ve görsellerin yer aldığı paylaşıma uygun teaser sürümü.
            </p>
            <Button
              onClick={() => toast.success("Teaser PDF indiriliyor", { description: portfolio.title })}
              className="mt-3 w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <Download className="size-4" /> Teaser PDF İndir
            </Button>
          </>
        ) : fullUnlocked ? (
          <>
            <p className="text-xs text-muted-foreground">
              Tam adres, tapu durumu, belgeler ve iletişim bilgilerini içeren tam sürüm.
            </p>
            <Button
              onClick={() => toast.success("Full PDF indiriliyor", { description: portfolio.title })}
              className="mt-3 w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <Download className="size-4" /> Full PDF İndir
            </Button>
          </>
        ) : (
          <>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0 text-gold" />
              Full PDF için detay talebi gereklidir. Onay sonrası tüm belgelere erişebilirsiniz.
            </p>
            <Button
              onClick={onRequest}
              variant="outline"
              className="mt-3 w-full gap-1.5 border-gold/30 text-gold hover:bg-gold/10"
            >
              <Send className="size-4" /> Full PDF için Detay Talebi
            </Button>
          </>
        )}
      </div>
    </SurfaceCard>
  );
}
