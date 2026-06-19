import type { TeaserCardData } from "@/components/portfolio/teaser-card";
import {
  publicTeaserImageUrl,
  publicTeaserThumbUrl,
  type PublicProfile,
  type PublicAgentPortfolioCard,
} from "@/lib/data/public-portfolio";
import type { Database } from "@/lib/database.types";

type MembershipTier = Database["public"]["Enums"]["membership_tier"];

/**
 * View-model for the reconnected Lovable profile design (ProfessionalProfileView).
 *
 * SECURITY: the adapter's ONLY inputs are the public allow-list shapes
 * (PublicProfile + PublicAgentPortfolioCard) returned by the SECURITY DEFINER
 * RPCs. Sensitive/locked fields (exact_address, malik_info, documents, private_*)
 * are NOT part of those types, so they structurally cannot enter the VM — the
 * profile/teaser surfaces stay leak-free by construction (D13).
 *
 * Vision-only fields the Lovable mock had (followerCount, matchCount, views30d,
 * regionExpertise, buyer searches, similar pros) are intentionally OMITTED — never
 * fabricated. The view hides the sections that depend on them.
 */
export type ProfessionalVM = {
  username: string;
  fullName: string;
  title: string | null;
  companyName: string | null;
  location: string | null;
  avatarUrl: string | null;
  bio: string | null;
  membershipTier: MembershipTier;
  expertiseRegions: string[];
  expertiseTypes: string[];
  /** Open contact (public in the network). null fields are hidden, never faked. */
  contactPhone: string | null;
  contactEmail: string | null;
  contactWhatsapp: string | null;
  /** Derived from the real active-portfolio count (not a mock stat). */
  activePortfolios: number;
  /** Teaser-only cards — safe for any viewer. */
  portfolios: TeaserCardData[];
};

export function toProfessionalVM(
  profile: PublicProfile,
  portfolios: PublicAgentPortfolioCard[],
): ProfessionalVM {
  const cards: TeaserCardData[] = portfolios.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    currency: p.currency,
    transaction_type: p.transaction_type,
    category: p.category,
    mode: p.mode,
    ref_no: p.ref_no,
    city: p.city,
    district: p.district,
    neighborhood: p.neighborhood,
    coverThumb: p.cover_path ? publicTeaserThumbUrl(p.cover_path) : null,
    coverFull: p.cover_path ? publicTeaserImageUrl(p.cover_path) : null,
  }));

  return {
    username: profile.username,
    fullName: profile.full_name,
    title: profile.title,
    companyName: profile.company_name,
    location: profile.location,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    membershipTier: profile.membership_tier,
    expertiseRegions: profile.expertise_regions,
    expertiseTypes: profile.expertise_types,
    contactPhone: profile.contact_phone,
    contactEmail: profile.contact_email,
    contactWhatsapp: profile.contact_whatsapp,
    activePortfolios: cards.length,
    portfolios: cards,
  };
}
