import type { Portfolio, Professional } from "./types";

// ---------------------------------------------------------------------------
// Portföy Veri Skoru (data completeness) — mock, UI-only. No real valuation.
// TODO[backend]: compute from real portfolio columns / document presence.
// ---------------------------------------------------------------------------

export type DataScore = {
  score: number;
  level: "low" | "medium" | "high";
  completed: string[];
  missing: string[];
};

export function getPortfolioDataScore(p: Portfolio): DataScore {
  const checks: { label: string; ok: boolean }[] = [
    { label: "Başlık", ok: !!p.title && p.title.length > 8 },
    { label: "Detaylı açıklama", ok: !!p.shortDescription && p.shortDescription.length > 40 },
    { label: "Fiyat bilgisi", ok: p.price > 0 },
    { label: "Oda bilgisi", ok: !!p.rooms },
    { label: "Brüt / Net m²", ok: !!p.grossM2 && !!p.netM2 },
    { label: "Arsa m²", ok: !!p.landM2 },
    { label: "Öne çıkan özellikler", ok: p.features.length >= 4 },
    { label: "Görseller (4+)", ok: p.images.length >= 4 },
    { label: "Belgeler", ok: p.documents.length >= 3 },
    { label: "Konum detayı", ok: !!p.exactAddress },
  ];
  const completed = checks.filter((c) => c.ok).map((c) => c.label);
  const missing = checks.filter((c) => !c.ok).map((c) => c.label);
  const score = Math.round((completed.length / checks.length) * 100);
  const level = score >= 80 ? "high" : score >= 55 ? "medium" : "low";
  return { score, level, completed, missing };
}

export const dataScoreLabels: Record<DataScore["level"], string> = {
  high: "Güçlü",
  medium: "Geliştirilebilir",
  low: "Eksik",
};

// ---------------------------------------------------------------------------
// Market context (mock placeholder — no real market data yet).
// ---------------------------------------------------------------------------

export type MarketContext = {
  region: string;
  similarRange: string;
  lastUpdated: string;
  priceUpdated: string;
  demandLabel: string;
  demandLevel: "low" | "medium" | "high";
};

function toM(n: number) {
  return `${Math.round(n / 1_000_000)}M`;
}

export function getMarketContext(p: Portfolio): MarketContext {
  const low = p.price * 0.86;
  const high = p.price * 1.19;
  const demandScore = (p.requestCount + p.viewCount / 50) % 100;
  const demandLevel: MarketContext["demandLevel"] =
    demandScore > 60 ? "high" : demandScore > 30 ? "medium" : "low";
  const demandLabel =
    demandLevel === "high" ? "Yüksek talep" : demandLevel === "medium" ? "Orta talep" : "Düşük talep";
  return {
    region: p.regionLabel,
    similarRange: `${toM(low)} – ${toM(high)} ${p.currency === "TRY" ? "TL" : p.currency}`,
    lastUpdated: "4 gün önce",
    priceUpdated: "2 hafta önce",
    demandLabel,
    demandLevel,
  };
}

// ---------------------------------------------------------------------------
// Portfolio activity timeline (Fizbot-style "son güncelleme" / "fiyat güncellendi").
// ---------------------------------------------------------------------------

export type PortfolioEvent = {
  id: string;
  type: "created" | "updated" | "price" | "photo" | "request";
  text: string;
  time: string;
};

export function getPortfolioTimeline(p: Portfolio): PortfolioEvent[] {
  return [
    { id: `${p.id}-e1`, type: "request", text: `${p.requestCount} detay talebi alındı`, time: "Bugün" },
    { id: `${p.id}-e2`, type: "updated", text: "Portföy bilgileri güncellendi", time: "4 gün önce" },
    { id: `${p.id}-e3`, type: "price", text: `Fiyat güncellendi → ${toM(p.price)} ${p.currency === "TRY" ? "TL" : p.currency}`, time: "2 hafta önce" },
    { id: `${p.id}-e4`, type: "photo", text: "Yeni görseller eklendi", time: "3 hafta önce" },
    { id: `${p.id}-e5`, type: "created", text: "Portföy oluşturuldu", time: p.createdAt },
  ];
}

// ---------------------------------------------------------------------------
// Region expertise helpers (Endeksa-style "Bölge Uzmanı" badges).
// ---------------------------------------------------------------------------

export function isRegionExpert(pro: Professional, region: string) {
  const r = region.toLowerCase();
  return (
    pro.expertiseRegions.some((x) => r.includes(x.toLowerCase()) || x.toLowerCase().includes(r)) ||
    pro.regionExpertise.some((x) => x.portfolioCount >= 5)
  );
}

/** A professional's strongest region (mock — highest portfolio count). */
export function topExpertRegion(pro: Professional) {
  if (pro.regionExpertise.length === 0) return pro.expertiseRegions[0];
  return [...pro.regionExpertise].sort((a, b) => b.portfolioCount - a.portfolioCount)[0].region;
}

// ---------------------------------------------------------------------------
// Share Studio analytics (mock placeholders).
// ---------------------------------------------------------------------------

export type ShareAnalytics = {
  views: number;
  uniqueViewers: number;
  whatsappClicks: number;
  detailRequests: number;
};

export function getShareAnalytics(p: Portfolio): ShareAnalytics {
  return {
    views: p.viewCount,
    uniqueViewers: Math.round(p.viewCount * 0.62),
    whatsappClicks: Math.round(p.requestCount * 2.4),
    detailRequests: p.requestCount,
  };
}
