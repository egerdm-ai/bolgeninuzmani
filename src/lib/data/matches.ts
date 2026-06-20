import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// B8 Eşleşme data layer. match_search is a SECURITY DEFINER RPC (applied) that
// returns a TEASER-only allow-list (same columns as get_public_agent_portfolios) +
// agent mini + a score. It NEVER returns a D13 locked field (no exact_address /
// malik / private_* / documents / locked images). The RPC types as Json (jsonb), so
// we cast the validated payload to MatchResult[] — the RPC's allow-list is the real
// contract (same pattern as public-portfolio.ts).

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

/** TEASER-only matches for a search (verified caller + own/active search; RLS-safe). */
export async function matchSearch(searchId: string): Promise<MatchResult[]> {
  const { data, error } = await supabase.rpc("match_search", { _search_id: searchId });
  if (error) throw error;
  return (data as unknown as MatchResult[] | null) ?? [];
}
