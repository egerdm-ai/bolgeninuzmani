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

/** Returns the region slug for a region NAME if a region page exists, else null. */
export function regionSlugForName(name: string): string | null {
  const s = slugify(name);
  return regions.some((r) => r.slug === s) ? s : null;
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
    notify: "daily",
    clientLabel: "Kurumsal Fon",
    lastMatchAt: "1 gün önce",
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
    notify: "weekly",
    clientLabel: "M. Demir",
    lastMatchAt: "4 gün önce",
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
    notify: "instant",
    clientLabel: "Aile (4 kişi)",
    lastMatchAt: "2 gün önce",
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
    notify: "off",
    clientLabel: "HNW Müşteri",
    lastMatchAt: "3 hafta önce",
  },
];

/**
 * "Arayışlarım" — the current user's own saved buyer searches (their customers).
 * Alias kept for clarity; `buyerSearches` rows are all owned by `currentUser`.
 * TODO[backend]: buyer_searches where owner_id = auth.uid().
 */
export const mySearches: BuyerSearch[] = buyerSearches;

export function getMySearchById(id: string) {
  return mySearches.find((b) => b.id === id);
}

// ---------------------------------------------------------------------------
// "Arayışlar" — network buyer searches created by OTHER professionals.
// These are discovery items: the current user browses them to find demand
// their own portfolios can satisfy.
// TODO[backend]: buyer_searches where owner_id != auth.uid() and visibility = 'network'.
// ---------------------------------------------------------------------------

export const networkSearches: BuyerSearch[] = [
  {
    id: "ns_001",
    title: "Yalıkavak Sonsuzluk Havuzlu Ultra Lüks Villa",
    clientType: "Yüksek Net Değer (HNW)",
    city: "Muğla",
    region: "Yalıkavak",
    type: "villa",
    budgetMin: 55000000,
    budgetMax: 80000000,
    currency: "TRY",
    rooms: "5+1",
    minM2: 350,
    mustHave: ["Deniz Manzarası", "Havuz", "5+1"],
    niceToHave: ["Marina Yakını", "Akıllı Ev"],
    urgency: "high",
    notes: "Yurt dışından dönen müşterim için Yalıkavak marina hattında sezon öncesi teslim villa.",
    visibility: "network",
    status: "active",
    matchCount: 7,
    createdAt: "5 saat önce",
    owner: professionals[1],
    views: 96,
    responses: 5,
    savedBy: 12,
    clientLabel: "HNW Müşteri",
    lastMatchAt: "2 saat önce",
  },
  {
    id: "ns_002",
    title: "Bebek Boğaz Manzaralı Yatırımlık Daire",
    clientType: "Kurumsal Yatırımcı",
    city: "İstanbul",
    region: "Bebek",
    type: "apartment",
    budgetMin: 42000000,
    budgetMax: 65000000,
    currency: "TRY",
    rooms: "3+1",
    minM2: 180,
    mustHave: ["Boğaz Manzarası", "Concierge"],
    niceToHave: ["Otopark", "Site İçi"],
    urgency: "medium",
    notes: "Kurumsal fon için Bebek hattında kira getirisi yüksek daire aranıyor.",
    visibility: "network",
    status: "active",
    matchCount: 4,
    createdAt: "1 gün önce",
    owner: professionals[2],
    views: 74,
    responses: 3,
    savedBy: 8,
    clientLabel: "Kurumsal Fon",
    lastMatchAt: "6 saat önce",
  },
  {
    id: "ns_003",
    title: "Türkbükü Denize Sıfır Tasarım Villa",
    clientType: "Bireysel Alıcı",
    city: "Muğla",
    region: "Türkbükü",
    type: "villa",
    budgetMin: 85000000,
    budgetMax: 120000000,
    currency: "TRY",
    rooms: "6+1",
    minM2: 420,
    mustHave: ["Denize Sıfır", "Havuz"],
    niceToHave: ["Özel İskele", "Misafir Evi"],
    urgency: "high",
    notes: "Acil — peşin alıcı, denize sıfır tasarım villa, özel iskele tercih sebebi.",
    visibility: "network",
    status: "active",
    matchCount: 3,
    createdAt: "2 gün önce",
    owner: professionals[1],
    views: 130,
    responses: 6,
    savedBy: 15,
    clientLabel: "Peşin Alıcı",
    lastMatchAt: "1 gün önce",
  },
  {
    id: "ns_004",
    title: "Çeşme / Alaçatı Yatırımlık Arsa",
    clientType: "Geliştirici",
    city: "İzmir",
    region: "Çeşme",
    type: "land",
    budgetMin: 20000000,
    budgetMax: 40000000,
    currency: "TRY",
    mustHave: ["İmarlı", "Yatırımlık"],
    niceToHave: ["Deniz Yakını", "Köşe Parsel"],
    urgency: "medium",
    notes: "Butik konut projesi için imarlı arsa; Alaçatı çevresi öncelikli.",
    visibility: "network",
    status: "active",
    matchCount: 2,
    createdAt: "3 gün önce",
    owner: professionals[4],
    views: 58,
    responses: 2,
    savedBy: 5,
    clientLabel: "Geliştirici",
    lastMatchAt: "2 gün önce",
  },
  {
    id: "ns_005",
    title: "Göcek Marina Çevresi Korunaklı Villa",
    clientType: "Aile",
    city: "Muğla",
    region: "Göcek",
    type: "villa",
    budgetMin: 45000000,
    budgetMax: 70000000,
    currency: "TRY",
    rooms: "4+1",
    minM2: 300,
    mustHave: ["Deniz Manzarası", "Site İçi"],
    niceToHave: ["Marina Yakını", "Orman İçi"],
    urgency: "low",
    notes: "Yazlık kullanım için Göcek marina çevresinde güvenlikli sitede villa.",
    visibility: "network",
    status: "active",
    matchCount: 2,
    createdAt: "4 gün önce",
    owner: professionals[3],
    views: 41,
    responses: 1,
    savedBy: 3,
    clientLabel: "Aile (5 kişi)",
    lastMatchAt: "3 gün önce",
  },
  {
    id: "ns_006",
    title: "Etiler Bahçeli Lüks Müstakil Villa",
    clientType: "Yüksek Net Değer (HNW)",
    city: "İstanbul",
    region: "Etiler",
    type: "villa",
    budgetMin: 75000000,
    budgetMax: 110000000,
    currency: "TRY",
    rooms: "6+1",
    minM2: 450,
    mustHave: ["Bahçe", "Müstakil"],
    niceToHave: ["Havuz", "Akıllı Ev"],
    urgency: "medium",
    notes: "Şehir içinde bahçeli, müstakil yaşam isteyen aile için Etiler / Levent çevresi.",
    visibility: "network",
    status: "active",
    matchCount: 1,
    createdAt: "6 gün önce",
    owner: professionals[2],
    views: 88,
    responses: 4,
    savedBy: 9,
    clientLabel: "HNW Aile",
    lastMatchAt: "5 gün önce",
  },
];

export function getNetworkSearchById(id: string) {
  return networkSearches.find((b) => b.id === id);
}

/** Looks up a search across both network and my-search collections. */
export function getBuyerSearchById(id: string) {
  return networkSearches.find((b) => b.id === id) ?? mySearches.find((b) => b.id === id);
}

/**
 * Mock-only: network buyer searches created by a given professional, shown on
 * their public profile. Falls back to region overlap, then first two searches.
 * TODO[backend]: query buyer_searches where owner_id = professional.id.
 */
export function getBuyerSearchesByProfessional(pro: {
  id?: string;
  expertiseRegions: string[];
}): BuyerSearch[] {
  if (pro.id) {
    const owned = networkSearches.filter((b) => b.owner.id === pro.id);
    if (owned.length) return owned;
  }
  const regions = new Set(pro.expertiseRegions.map((r) => r.toLocaleLowerCase("tr")));
  const matched = networkSearches.filter((b) =>
    regions.has(b.region.toLocaleLowerCase("tr")),
  );
  return matched.length ? matched : networkSearches.slice(0, 2);
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

/** Matches restricted to the current user's OWN portfolios (for network searches). */
export function getMyMatchesForSearch(q: MatchInput): MatchResult[] {
  const mine = new Set(myPortfolios.map((p) => p.id));
  return getMatchesForSearch(q).filter((m) => mine.has(m.portfolio.id));
}

/** Convenience: my matching portfolios for a given network buyer search. */
export function getMyMatchesForBuyerSearch(bs: BuyerSearch): MatchResult[] {
  return getMyMatchesForSearch({
    region: bs.region,
    city: bs.city,
    type: bs.type,
    budgetMin: bs.budgetMin,
    budgetMax: bs.budgetMax,
    rooms: bs.rooms,
    minM2: bs.minM2,
    mustHave: bs.mustHave,
  });
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

/** Network buyer searches (created by others) that a given portfolio matches. */
export function getMatchingSearchesForPortfolio(p: Portfolio): BuyerSearch[] {
  return networkSearches.filter((bs) => {
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
