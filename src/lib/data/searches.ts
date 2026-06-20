import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// B7 Arayış data layer. searches is MEMBER-ONLY (RLS: is_verified + active/own);
// owner-scoped writes are plain RLS (no definer RPC). The table holds NO D13 locked
// fields (no exact address, no malik/customer PII, no documents) — just search
// criteria + the agent's own note shared for matching. So nothing here is a
// teaser/anon leak surface; the leak test still asserts it names no locked token.

export type Search = Database["public"]["Tables"]["searches"]["Row"];
export type SearchStatus = Database["public"]["Enums"]["search_status"];
export type SearchUrgency = Database["public"]["Enums"]["search_urgency"];
type TxnType = Database["public"]["Enums"]["transaction_type"];
type Category = Database["public"]["Enums"]["portfolio_category"];
type Currency = Database["public"]["Enums"]["currency"];

export type SearchOwner = { username: string; full_name: string; avatar_url: string | null };
export type NetworkSearch = Search & { owner: SearchOwner | null };

export type SearchInput = {
  title: string;
  transaction_type: TxnType;
  category: Category;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: Currency;
  room_count: string | null;
  min_m2: number | null;
  features: string[];
  urgency: SearchUrgency;
  notes: string | null;
};

export type NetworkSearchFilters = {
  q?: string;
  category?: Category;
  transaction_type?: TxnType;
  city?: string;
  budgetMax?: number;
};

/** Own searches (any status), newest-updated first. */
export async function listMySearches(ownerId: string): Promise<Search[]> {
  const { data, error } = await supabase
    .from("searches")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Network ACTIVE searches (RLS already enforces is_verified + active) + owner mini. */
export async function listNetworkSearches(
  filters: NetworkSearchFilters = {},
): Promise<NetworkSearch[]> {
  let qb = supabase
    .from("searches")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (filters.category) qb = qb.eq("category", filters.category);
  if (filters.transaction_type) qb = qb.eq("transaction_type", filters.transaction_type);
  if (filters.city) qb = qb.ilike("city", `%${filters.city}%`);
  // budget overlap: keep searches whose lower bound is at/under the buyer's ceiling.
  if (filters.budgetMax != null)
    qb = qb.or(`budget_min.is.null,budget_min.lte.${filters.budgetMax}`);

  const { data, error } = await qb;
  if (error) throw error;
  const rows = data ?? [];

  // Owner mini (public profile fields) — verified members may read profiles (RLS).
  const ownerIds = [...new Set(rows.map((r) => r.owner_id))];
  const owners: Record<string, SearchOwner> = {};
  if (ownerIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", ownerIds);
    for (const p of profs ?? []) {
      owners[p.id] = { username: p.username, full_name: p.full_name, avatar_url: p.avatar_url };
    }
  }

  let result: NetworkSearch[] = rows.map((r) => ({ ...r, owner: owners[r.owner_id] ?? null }));
  if (filters.q) {
    const q = filters.q.toLocaleLowerCase("tr");
    result = result.filter((r) =>
      `${r.title} ${r.city ?? ""} ${r.district ?? ""} ${r.neighborhood ?? ""} ${r.notes ?? ""}`
        .toLocaleLowerCase("tr")
        .includes(q),
    );
  }
  return result;
}

export async function getMySearch(id: string): Promise<Search | null> {
  const { data, error } = await supabase.from("searches").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function createSearch(ownerId: string, input: SearchInput): Promise<Search> {
  const { data, error } = await supabase
    .from("searches")
    .insert({ ...input, owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateSearch(id: string, input: Partial<SearchInput>): Promise<Search> {
  const { data, error } = await supabase
    .from("searches")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function setSearchStatus(id: string, status: SearchStatus): Promise<void> {
  const { error } = await supabase
    .from("searches")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export const closeSearch = (id: string) => setSearchStatus(id, "closed");
