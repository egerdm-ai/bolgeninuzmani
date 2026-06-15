import type {
  BuyerSearch,
  MatchResult,
  Portfolio,
  Professional,
  Region,
} from "./types";
import { portfolios, professionals, currentUser } from "./data";
import { portfolioTypeLabels } from "@/lib/format";

// ---------------------------------------------------------------------------
// Regions ("Bölgeler")
// TODO[backend]: derive counts from portfolios / buyer_searches / region_experts.
// ---------------------------------------------------------------------------

export const regions: Region[] = [
  {
    slug: "bodrum",
    name: "Bodrum",
    city: "Muğla",
    blurb: "Ege'nin lüks gayrimenkul başkenti. Denize sıfır villalar ve butik yatırımlar.",
    activePortfolios: 42,
    buyerSearchCount: 18,
    expertCount: 6,
    priceRange: "40M – 165M TL",
    demandLevel: "high",
    topFeatures: ["Deniz Manzarası", "Havuz", "Denize Sıfır", "Akıllı Ev"],
    expertIds: ["b_001", "b_006"],
    mapX: 54,
    mapY: 56,
  },
  {
    slug: "yalikavak",
    name: "Yalıkavak",
    city: "Muğla",
    blurb: "Bodrum'un en prestijli marina hattı. Ultra lüks villa talebinin merkezi.",
    activePortfolios: 24,
    buyerSearchCount: 12,
    expertCount: 4,
    priceRange: "55M – 140M TL",
    demandLevel: "high",
    topFeatures: ["Deniz Manzarası", "Sonsuzluk Havuzu", "Marina Yakını"],
    expertIds: ["b_001"],
    mapX: 40,
    mapY: 38,
  },
  {
    slug: "turkbuku",
    name: "Türkbükü",
    city: "Muğla",
    blurb: "Denize sıfır tasarım villalar ve özel iskeleli mülkler.",
    activePortfolios: 16,
    buyerSearchCount: 9,
    expertCount: 3,
    priceRange: "70M – 150M TL",
    demandLevel: "high",
    topFeatures: ["Denize Sıfır", "Özel İskele", "Havuz"],
    expertIds: ["b_001"],
    mapX: 64,
    mapY: 30,
  },
  {
    slug: "bebek",
    name: "Bebek",
    city: "İstanbul",
    blurb: "Boğaz hattının en değerli yalı ve daire portföyleri.",
    activePortfolios: 28,
    buyerSearchCount: 14,
    expertCount: 4,
    priceRange: "45M – 220M TL",
    demandLevel: "high",
    topFeatures: ["Boğaz Manzarası", "Denize Sıfır", "Concierge"],
    expertIds: ["b_003"],
    mapX: 44,
    mapY: 50,
  },
  {
    slug: "riva",
    name: "Riva",
    city: "İstanbul",
    blurb: "İstanbul'un kuzeyinde gelişen arsa ve müstakil villa yatırımları.",
    activePortfolios: 19,
    buyerSearchCount: 7,
    expertCount: 3,
    priceRange: "30M – 80M TL",
    demandLevel: "medium",
    topFeatures: ["Geniş Bahçe", "Müstakil", "Yatırımlık"],
    expertIds: ["b_004"],
    mapX: 58,
    mapY: 28,
  },
  {
    slug: "cesme",
    name: "Çeşme",
    city: "İzmir",
    blurb: "Sezonluk lüks konut ve butik yatırımların gözde bölgesi.",
    activePortfolios: 21,
    buyerSearchCount: 10,
    expertCount: 4,
    priceRange: "28M – 95M TL",
    demandLevel: "medium",
    topFeatures: ["Deniz Manzarası", "Havuz", "Yazlık"],
    expertIds: ["b_005"],
    mapX: 36,
    mapY: 48,
  },
  {
    slug: "alacati",
    name: "Alaçatı",
    city: "İzmir",
    blurb: "Taş mimari yazlık villalar ve denize yakın yatırımlık arsalar.",
    activePortfolios: 14,
    buyerSearchCount: 6,
    expertCount: 3,
    priceRange: "25M – 75M TL",
    demandLevel: "medium",
    topFeatures: ["Taş Mimari", "Havuz", "İmarlı Arsa"],
    expertIds: ["b_005"],
    mapX: 56,
    mapY: 40,
  },
  {
    slug: "gocek",
    name: "Göcek",
    city: "Muğla",
    blurb: "Marina çevresinde doğa ile iç içe, korunaklı villa siteleri.",
    activePortfolios: 11,
    buyerSearchCount: 4,
    expertCount: 2,
    priceRange: "35M – 90M TL",
    demandLevel: "low",
    topFeatures: ["Deniz Manzarası", "Marina Yakını", "Orman İçi"],
    expertIds: ["b_001"],
    mapX: 70,
    mapY: 52,
  },
];

export function getRegionBySlug(slug: string) {
  return regions.find((r) => r.slug === slug);
}

const slugify = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Portfolios whose neighborhood/district/region matches a region name. */
export function getPortfoliosByRegion(name: string): Portfolio[] {
  const key = name.toLocaleLowerCase("tr-TR");
  return portfolios.filter(
    (p) =>
      (p.neighborhood && p.neighborhood.toLocaleLowerCase("tr-TR") === key) ||
      p.district.toLocaleLowerCase("tr-TR") === key ||
      p.regionLabel.toLocaleLowerCase("tr-TR").includes(key),
  );
}

export function getExpertsForRegion(region: Region): Professional[] {
  const byId = professionals.filter((pro) => region.expertIds.includes(pro.id));
  const byExpertise = professionals.filter((pro) =>
    pro.expertiseRegions.some((r) => slugify(r) === region.slug),
  );
  return Array.from(new Set([...byId, ...byExpertise]));
}

// ---------------------------------------------------------------------------
// Buyer Searches ("Arayışlar")
// TODO[backend]: replace with `buyer_searches` rows where owner_id = auth.uid().
// ---------------------------------------------------------------------------

const me = professionals[0];

export const buyerSearches: BuyerSearch[] = [
  {
    id: "bs_001",
    title: "Bodrum Deniz Manzaralı Havuzlu Villa",
    clientType: "Bireysel Alıcı",
    city: "Muğla",
    region: "Bodrum",
    type: "villa",
    budgetMin: 60000000,
    budgetMax: 100000000,
    currency: "TRY",
    rooms: "5+1",
    minM2: 350,
    mustHave: ["Deniz Manzarası", "Havuz", "5+1"],
    niceToHave: ["Akıllı Ev", "Denize Sıfır", "Özel İskele"],
    urgency: "high",
    notes:
      "Bodrum'da deniz manzaralı, 5+1, havuzlu, 100M TL altı villa arıyorum. Yalıkavak ve Türkbükü öncelikli.",
    visibility: "network",
    status: "matched",
    matchCount: 6,
    createdAt: "2 gün önce",
    owner: me,
    views: 142,
    responses: 4,
    savedBy: 9,
    notify: "instant",
    clientLabel: "A. Yılmaz (VIP)",
    lastMatchAt: "3 saat önce",
  },
  {
    id: "bs_002",
    title: "Bebek Boğaz Manzaralı Yatırımlık Daire",
    clientType: "Kurumsal Yatırımcı",
    city: "İstanbul",
    region: "Bebek",
    type: "apartment",
    budgetMin: 40000000,
    budgetMax: 70000000,
    currency: "TRY",
    rooms: "4+1",
    minM2: 200,
    mustHave: ["Boğaz Manzarası", "Concierge"],
    niceToHave: ["Otopark", "Spor Salonu"],
    urgency: "medium",
    notes: "Boğaz hattında concierge hizmetli, yatırım amaçlı daire.",
    visibility: "private",
    status: "active",
    matchCount: 2,
    createdAt: "4 gün önce",
    owner: me,
    views: 88,
    responses: 1,
    savedBy: 3,
  },
  {
    id: "bs_003",
    title: "Çeşme / Alaçatı Yazlık Villa",
    clientType: "Bireysel Alıcı",
    city: "İzmir",
    region: "Çeşme",
    type: "villa",
    budgetMin: 35000000,
    budgetMax: 60000000,
    currency: "TRY",
    rooms: "4+1",
    minM2: 280,
    mustHave: ["Havuz"],
    niceToHave: ["Taş Mimari", "Deniz Manzarası", "Site İçi"],
    urgency: "low",
    notes: "Sezonluk kullanım için Alaçatı çevresinde butik villa.",
    visibility: "network",
    status: "awaiting",
    matchCount: 3,
    createdAt: "1 hafta önce",
    owner: me,
    views: 64,
    responses: 0,
    savedBy: 2,
  },
  {
    id: "bs_004",
    title: "Riva Geniş Arsalı Müstakil Villa",
    clientType: "Aile",
    city: "İstanbul",
    region: "Riva",
    type: "villa",
    budgetMin: 30000000,
    budgetMax: 55000000,
    currency: "TRY",
    rooms: "5+1",
    minM2: 380,
    mustHave: ["Geniş Bahçe", "Müstakil"],
    niceToHave: ["Havuz", "Doğa İçi"],
    urgency: "medium",
    notes: "Doğa ile iç içe, geniş bahçeli müstakil yaşam.",
    visibility: "network",
    status: "matched",
    matchCount: 2,
    createdAt: "1 hafta önce",
    owner: me,
    views: 51,
    responses: 2,
    savedBy: 4,
  },
  {
    id: "bs_005",
    title: "Türkbükü Denize Sıfır Tasarım Villa",
    clientType: "Yüksek Net Değer (HNW)",
    city: "Muğla",
    region: "Türkbükü",
    type: "villa",
    budgetMin: 80000000,
    budgetMax: 130000000,
    currency: "TRY",
    rooms: "6+1",
    minM2: 450,
    mustHave: ["Denize Sıfır", "Havuz"],
    niceToHave: ["Özel İskele", "Misafir Evi", "Akıllı Ev"],
    urgency: "high",
    notes: "Ultra lüks, denize sıfır, özel iskeleli tasarım villa.",
    visibility: "private",
    status: "closed",
    matchCount: 1,
    createdAt: "3 hafta önce",
    owner: me,
    views: 120,
    responses: 3,
    savedBy: 6,
  },
];

export function getBuyerSearchById(id: string) {
  return buyerSearches.find((b) => b.id === id);
}

// ---------------------------------------------------------------------------
// Matching engine (mock, UI-only, fully explainable).
// TODO[backend]: replace with real vector / rule-based matching service.
// ---------------------------------------------------------------------------

type MatchInput = {
  region: string;
  city?: string;
  type: BuyerSearch["type"];
  budgetMin: number;
  budgetMax: number;
  rooms?: string;
  minM2?: number;
  mustHave: string[];
  niceToHave?: string[];
};

const toM = (n: number) => `${Math.round(n / 1_000_000)}M`;

function scorePortfolio(p: Portfolio, q: MatchInput): MatchResult | null {
  const matched: string[] = [];
  const missing: string[] = [];
  let score = 0;

  // Region (30)
  const regionKey = q.region.toLocaleLowerCase("tr-TR");
  const regionHit =
    (p.neighborhood && p.neighborhood.toLocaleLowerCase("tr-TR") === regionKey) ||
    p.regionLabel.toLocaleLowerCase("tr-TR").includes(regionKey) ||
    (q.city && p.city.toLocaleLowerCase("tr-TR") === q.city.toLocaleLowerCase("tr-TR"));
  if (regionHit) {
    score += 30;
    matched.push(`${q.region} bölgesi`);
  } else {
    missing.push(`${q.region} dışı konum`);
  }

  // Type (20)
  if (p.type === q.type) {
    score += 20;
    matched.push(portfolioTypeLabels[p.type]);
  } else {
    missing.push(`Farklı tip (${portfolioTypeLabels[p.type]})`);
  }

  // Budget (25)
  if (p.price <= q.budgetMax && p.price >= q.budgetMin * 0.85) {
    score += 25;
    matched.push(`${toM(p.price)} TL, bütçe içinde`);
  } else if (p.price <= q.budgetMax * 1.1) {
    score += 12;
    missing.push(`Fiyat bütçeye yakın (${toM(p.price)} TL)`);
  } else {
    missing.push(`Bütçe üzeri (${toM(p.price)} TL)`);
  }

  // Rooms (10)
  if (q.rooms) {
    if (p.rooms === q.rooms) {
      score += 10;
      matched.push(q.rooms);
    } else {
      missing.push(`Oda farkı (${p.rooms ?? "?"})`);
    }
  }

  // Features (must-have weighted) (15)
  const feats = p.features.map((f) => f.toLocaleLowerCase("tr-TR"));
  const matchedFeatures = q.mustHave.filter((f) =>
    feats.some((pf) => pf.includes(f.toLocaleLowerCase("tr-TR")) || f.toLocaleLowerCase("tr-TR").includes(pf)),
  );
  if (q.mustHave.length > 0) {
    score += Math.round((matchedFeatures.length / q.mustHave.length) * 15);
  } else {
    score += 8;
  }
  matchedFeatures.forEach((f) => matched.push(f));
  q.mustHave
    .filter((f) => !matchedFeatures.includes(f) && f !== q.rooms && !matched.includes(f))
    .forEach((f) => missing.push(`${f} (belirtilmemiş)`));

  // Locked-info reminders
  if (p.locationMode !== "exact_visible") missing.push("Tam adres kilitli");
  if (p.documents.some((d) => d.isLocked)) missing.push("PDF / belgeler detay talebi sonrası");

  if (score < 35) return null;

  const explanation =
    score >= 85
      ? "Bu portföy bölge, tip, fiyat ve özellik kriterlerinin neredeyse tamamını karşıladığı için çok yüksek uyumludur."
      : score >= 65
        ? "Bu portföy bölge, tip ve fiyat kriterlerinin çoğunu karşıladığı için yüksek uyumludur."
        : "Bu portföy bazı temel kriterleri karşılıyor; eksik kriterler için detay talebi önerilir.";

  return { portfolio: p, score: Math.min(99, score), matched, missing, explanation };
}

export function getMatchesForSearch(q: MatchInput): MatchResult[] {
  return portfolios
    .filter((p) => p.status === "active" || p.status === "passive")
    .map((p) => scorePortfolio(p, q))
    .filter((m): m is MatchResult => m !== null)
    .sort((a, b) => b.score - a.score);
}

export function getExpertsForSearch(q: MatchInput): Professional[] {
  const regionKey = q.region.toLocaleLowerCase("tr-TR");
  return professionals
    .filter((pro) =>
      pro.expertiseRegions.some(
        (r) =>
          r.toLocaleLowerCase("tr-TR").includes(regionKey) ||
          regionKey.includes(r.toLocaleLowerCase("tr-TR")),
      ),
    )
    .slice(0, 4);
}

/** Buyer searches (across the network) that a given portfolio matches. */
export function getMatchingSearchesForPortfolio(p: Portfolio): BuyerSearch[] {
  return buyerSearches.filter((bs) => {
    const m = scorePortfolio(p, {
      region: bs.region,
      city: bs.city,
      type: bs.type,
      budgetMin: bs.budgetMin,
      budgetMax: bs.budgetMax,
      rooms: bs.rooms,
      minM2: bs.minM2,
      mustHave: bs.mustHave,
    });
    return m !== null && m.score >= 55;
  });
}

// ---------------------------------------------------------------------------
// Valuation insight (mock, UI-only — NOT a real valuation).
// TODO[backend]: replace with valuation model / comparable sales service.
// ---------------------------------------------------------------------------

export type ValuationInsight = {
  region: string;
  similarRange: string;
  thisPrice: string;
  position: "below" | "fair" | "above";
  positionLabel: string;
  demandLabel: string;
  confidence: "low" | "medium" | "high";
  confidenceLabel: string;
};

export function getValuationInsight(p: Portfolio): ValuationInsight {
  const low = p.price * 0.85;
  const high = p.price * 1.22;
  const mid = (low + high) / 2;
  const position: ValuationInsight["position"] =
    p.price < mid * 0.95 ? "below" : p.price > mid * 1.05 ? "above" : "fair";
  return {
    region: p.regionLabel,
    similarRange: `${toM(low)} – ${toM(high)} TL`,
    thisPrice: `${toM(p.price)} TL`,
    position,
    positionLabel:
      position === "below"
        ? "Bölge ortalamasının altında"
        : position === "above"
          ? "Bölge ortalamasının üzerinde"
          : "Bölge ortalamasıyla uyumlu",
    demandLabel: p.requestCount > 25 ? "Yüksek" : p.requestCount > 10 ? "Orta" : "Düşük",
    confidence: p.documents.length >= 3 ? "high" : p.documents.length >= 1 ? "medium" : "low",
    confidenceLabel:
      p.documents.length >= 3 ? "Yüksek" : p.documents.length >= 1 ? "Orta" : "Düşük",
  };
}

// ---------------------------------------------------------------------------
// Portfolio analytics (owner view) — mock placeholders.
// ---------------------------------------------------------------------------

export type PortfolioAnalytics = {
  views: number;
  detailRequests: number;
  shares: number;
  pdfDownloads: number;
  matchingSearches: number;
  savedBy: number;
  lastUpdated: string;
};

export function getPortfolioAnalytics(p: Portfolio): PortfolioAnalytics {
  return {
    views: p.viewCount,
    detailRequests: p.requestCount,
    shares: Math.round(p.viewCount * 0.08),
    pdfDownloads: Math.round(p.requestCount * 1.6),
    matchingSearches: getMatchingSearchesForPortfolio(p).length,
    savedBy: Math.round(p.requestCount * 0.7),
    lastUpdated: "4 gün önce",
  };
}

// ---------------------------------------------------------------------------
// Dashboard-level analytics (mock).
// ---------------------------------------------------------------------------

export const networkAnalytics = {
  activePortfolios: 24,
  activeSearches: buyerSearches.filter((b) => b.status !== "closed").length,
  matchedSearches: buyerSearches.filter((b) => b.status === "matched").length,
  detailRequests: 37,
  pdfDownloads: 184,
  profileViews: 2940,
  topRegion: "Yalıkavak",
};

// reference to keep currentUser import meaningful for future backend swap
void currentUser;
