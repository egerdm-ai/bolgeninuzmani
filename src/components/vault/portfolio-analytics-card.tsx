import { Eye, Send, Share2, Download, Sparkles, Bookmark, Clock } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { getPortfolioAnalytics } from "@/lib/mock/matching";
import { SurfaceCard } from "./cards";
import { formatNumber } from "@/lib/format";

export function PortfolioAnalyticsCard({ portfolio }: { portfolio: Portfolio }) {
  const a = getPortfolioAnalytics(portfolio);
  const items = [
    { icon: Eye, label: "Görüntülenme", value: formatNumber(a.views) },
    { icon: Send, label: "Detay talebi", value: formatNumber(a.detailRequests) },
    { icon: Share2, label: "Paylaşım", value: formatNumber(a.shares) },
    { icon: Download, label: "PDF indirme", value: formatNumber(a.pdfDownloads) },
    { icon: Sparkles, label: "Eşleşen arayış", value: formatNumber(a.matchingSearches) },
    { icon: Bookmark, label: "Kaydeden", value: formatNumber(a.savedBy) },
  ];

  return (
    <SurfaceCard className="p-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Portföy Analitiği</h3>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" /> {a.lastUpdated}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border">
        {items.map((it) => (
          <div key={it.label} className="bg-surface px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <it.icon className="size-3 text-gold" /> {it.label}
            </div>
            <div className="mt-1 font-display text-xl font-semibold text-foreground">{it.value}</div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
