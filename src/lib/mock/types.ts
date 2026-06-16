export type MembershipTier = "standard" | "pro" | "elite";

export type User = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  title: string;
  companyName?: string;
  location: string;
  membershipTier: MembershipTier;
  isVerified: boolean;
};

export type Broker = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  title: string;
  companyName: string;
  membershipTier: MembershipTier;
  location: string;
  expertiseRegions: string[];
  expertiseTypes: string[];
  portfolioCount: number;
  responseTimeLabel?: string;
  approvalRate?: number;
};

export type RegionExpertise = {
  region: string;
  portfolioCount: number;
  primaryTypes: string[];
  /** mock map pin position 0-100 */
  x: number;
  y: number;
};

export type ProfessionalActivity = {
  id: string;
  type: "publish" | "update" | "photo" | "request";
  text: string;
  time: string;
};

/** Membership badge label shown on cards & profile (separate from RLS tier). */
export type MembershipBadgeLabel = "Elite" | "Pro" | "Private Beta";

/** Rich public profile data, extends Broker so it can be used as a portfolio owner. */
export type Professional = Broker & {
  bio: string;
  coverImage: string;
  /** Region-expert headline badge, e.g. "Bodrum Uzmanı". */
  expertBadge: string;
  membershipBadge: MembershipBadgeLabel;
  followerCount: number;
  views30d: number;
  activePortfolios: number;
  /** How many curated region lists this professional appears in. */
  regionListCount: number;
  /** Mock 30-day match count surfaced on the profile hero. */
  matchCount: number;
  regionExpertise: RegionExpertise[];
  activity: ProfessionalActivity[];
};

export type PortfolioType =
  | "villa"
  | "apartment"
  | "land"
  | "commercial"
  | "hotel"
  | "factory"
  | "office"
  | "restaurant";

export type PortfolioCategory =
  | "konut"
  | "ticari"
  | "arsa"
  | "turizm"
  | "isletme"
  | "ozel_varlik";

export type PortfolioStatus = "draft" | "active" | "passive" | "sold_or_rented";
export type Purpose = "satilik" | "kiralik";
export type Currency = "TRY" | "USD" | "EUR";
export type LocationMode = "approximate" | "exact_locked" | "exact_visible";
export type Visibility = "verified_members" | "invite_only";

export type PortfolioDocument = {
  id: string;
  name: string;
  type: "pdf" | "deed" | "permit" | "other";
  isLocked: boolean;
};

export type Portfolio = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  type: PortfolioType;
  category: PortfolioCategory;
  status: PortfolioStatus;
  purpose: Purpose;
  price: number;
  currency: Currency;
  city: string;
  district: string;
  neighborhood?: string;
  regionLabel: string;
  locationMode: LocationMode;
  approxRadiusKm: number;
  exactAddress?: string;
  rooms?: string;
  grossM2?: number;
  netM2?: number;
  landM2?: number;
  bathrooms?: number;
  parkingCapacity?: number;
  features: string[];
  tags: string[];
  coverImage: string;
  images: string[];
  documents: PortfolioDocument[];
  owner: Broker;
  visibility: Visibility;
  requestRequired: boolean;
  viewCount: number;
  requestCount: number;
  createdAt: string;
  mapX: number; // 0-100 percentage for mock map pin
  mapY: number;
};

export type DetailRequestStatus =
  | "new"
  | "read"
  | "answered"
  | "approved"
  | "rejected";

export type DetailRequest = {
  id: string;
  portfolio: Portfolio;
  requester: Broker;
  status: DetailRequestStatus;
  message: string;
  purpose: string;
  budgetLabel?: string;
  createdAt: string;
};

export type SavedSearch = {
  id: string;
  label: string;
  query: string;
  filters: string[];
  resultCount: number;
  createdAt: string;
};

export type ActivityType =
  | "view"
  | "request"
  | "save"
  | "publish"
  | "approve";

export type Activity = {
  id: string;
  type: ActivityType;
  text: string;
  time: string;
};

// ---------------------------------------------------------------------------
// Buyer Search ("Arayış") — what a professional is looking for on behalf of a buyer.
// ---------------------------------------------------------------------------

export type BuyerSearchStatus = "active" | "matched" | "awaiting" | "closed";
export type Urgency = "low" | "medium" | "high";
export type SearchVisibility = "private" | "network";

export type BuyerSearch = {
  id: string;
  title: string;
  clientType: string;
  city: string;
  region: string;
  type: PortfolioType;
  budgetMin: number;
  budgetMax: number;
  currency: Currency;
  rooms?: string;
  minM2?: number;
  mustHave: string[];
  niceToHave: string[];
  urgency: Urgency;
  notes?: string;
  visibility: SearchVisibility;
  status: BuyerSearchStatus;
  matchCount: number;
  createdAt: string;
  owner: Broker;
  views: number;
  responses: number;
  savedBy: number;
  /** Notification setting for new matches on this saved search. */
  notify?: NotificationFrequency;
  /** Friendly customer label / nickname shown on the search card. */
  clientLabel?: string;
  /** Latest match relative time, e.g. "3 saat önce". */
  lastMatchAt?: string;
};

/** A portfolio matched against a buyer search, with explanation. */
export type MatchResult = {
  portfolio: Portfolio;
  score: number;
  matched: string[];
  missing: string[];
  explanation: string;
};

// ---------------------------------------------------------------------------
// Region ("Bölge") — area-level expertise + market context.
// ---------------------------------------------------------------------------

export type Region = {
  slug: string;
  name: string;
  city: string;
  blurb: string;
  activePortfolios: number;
  buyerSearchCount: number;
  expertCount: number;
  priceRange: string;
  demandLevel: "low" | "medium" | "high";
  topFeatures: string[];
  expertIds: string[];
  mapX: number;
  mapY: number;
};

// ---------------------------------------------------------------------------
// Notifications, region watches, saved-search notification settings.
// ---------------------------------------------------------------------------

export type NotificationFrequency = "instant" | "daily" | "weekly" | "off";

export const notificationFrequencyLabels: Record<NotificationFrequency, string> = {
  instant: "Anında",
  daily: "Günlük Özet",
  weekly: "Haftalık Özet",
  off: "Kapalı",
};

export type NotificationKind =
  | "match"
  | "region"
  | "portfolio"
  | "request"
  | "search";

/** Typed navigation target for a notification (route + params/search). */
export type NotificationLink =
  | { to: "/dashboard/my-searches/$id"; params: { id: string }; search?: { tab?: "matches" } }
  | { to: "/dashboard/my-searches" }
  | { to: "/dashboard/searches/$id"; params: { id: string } }
  | { to: "/dashboard/searches"; search?: { region?: string } }
  | { to: "/dashboard/search"; search?: { region?: string } }
  | { to: "/dashboard/matches"; search?: { portfolioId?: string } }
  | { to: "/dashboard/regions" }
  | { to: "/dashboard/detail-requests" }
  | { to: "/dashboard/portfolios" };

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  link: NotificationLink;
};

export type RegionWatch = {
  slug: string;
  frequency: NotificationFrequency;
};
