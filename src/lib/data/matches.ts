import type { Database } from "@/lib/database.types";

// B8 Eşleşme data layer — SKELETON. The match_search RPC is drafted but NOT yet
// applied (see supabase/migrations/20260620120000_b8_match_search_DRAFT.sql), so the
// generated Database types do NOT contain it. To avoid a type-unsafe cast, the
// fetch is a stub returning [] for now. featureFlags.matches stays OFF.
//
// AFTER Ege pushes the migration + regenerates types, replace the stub body with:
//   const { data, error } = await supabase.rpc("match_search", { _search_id: searchId });
//   if (error) throw error;
//   return (data as unknown as MatchResult[]) ?? [];
// (and add searches/matches surfaces to the leak test if not already). The RPC
// returns TEASER-only cards (allow-list = get_public_agent_portfolios) + agent mini
// + score; never any D13 locked field.

type Category = Database["public"]["Enums"]["portfolio_category"];
type Txn = Database["public"]["Enums"]["transaction_type"];
type Currency = Database["public"]["Enums"]["currency"];
type Mode = Database["public"]["Enums"]["portfolio_mode"];

/** A single match: the SAME public teaser allow-list the match_search RPC returns. */
export type MatchResult = {
  id: string;
  slug: string;
  title: string;
  price: number | null;
  currency: Currency;
  transaction_type: Txn;
  category: Category;
  subcategory: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  approx_lat: number | null;
  approx_lng: number | null;
  mode: Mode;
  ref_no: string;
  created_at: string;
  cover_path: string | null;
  /** How many optional criteria (region/rooms) the portfolio additionally hit. */
  score: number;
  agent: { username: string; full_name: string; avatar_url: string | null } | null;
};

/**
 * Matches for a search. STUB until match_search RPC is pushed + types regenerated
 * (then this becomes a typed supabase.rpc call — see header). Returns [] for now;
 * the matches page stays behind featureFlags.matches (OFF).
 */
export async function matchSearch(_searchId: string): Promise<MatchResult[]> {
  // TODO(B8): wire to supabase.rpc("match_search", { _search_id }) post-push.
  return [];
}
