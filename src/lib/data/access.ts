import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// ---------------------------------------------------------------------------
// Controlled access (M3) data layer. WRITES GO THROUGH RPCs ONLY — the client
// never inserts/updates detail_requests or portfolio_access_grants directly
// (those tables have FORCE RLS + no write policies; only the SECURITY DEFINER
// RPCs request_detail / approve_detail_request / reject_detail_request mutate
// them after validating the caller). Reads are RLS-gated SELECTs.
//
// D5: only verified members request. D6: grant is bulk. D7: grant is permanent.
// Invariant #2: locked visibility is decided on GRANTS via has_portfolio_access,
// never on detail_requests.status.
// ---------------------------------------------------------------------------

export type DetailRequest = Database["public"]["Tables"]["detail_requests"]["Row"];
export type AccessGrant = Database["public"]["Tables"]["portfolio_access_grants"]["Row"];
export type DetailRequestStatus = Database["public"]["Enums"]["detail_request_status"];

/** Teaser-safe portfolio reference embedded in request/grant lists. */
export type RequestPortfolioRef = {
  id: string;
  slug: string;
  title: string;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
};

/** Public profile reference for the inbox (who is asking). */
export type RequesterRef = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  title: string | null;
  company_name: string | null;
};

export type SentRequest = DetailRequest & { portfolio: RequestPortfolioRef | null };
export type InboxRequest = DetailRequest & {
  portfolio: RequestPortfolioRef | null;
  requester: RequesterRef | null;
};
export type AccessGrantWithPortfolio = AccessGrant & { portfolio: RequestPortfolioRef | null };

const PORTFOLIO_REF = "id, slug, title, city, district, neighborhood";
const REQUESTER_REF = "id, full_name, username, avatar_url, title, company_name";

// ---------------------------------------------------------------------------
// Writes — RPC ONLY
// ---------------------------------------------------------------------------

/** D5: a verified non-owner requests access to an active portfolio. Idempotent. */
export async function requestDetail(portfolioId: string, message?: string): Promise<DetailRequest> {
  const { data, error } = await supabase.rpc("request_detail", {
    _portfolio_id: portfolioId,
    _message: message?.trim() || undefined,
  });
  if (error) throw error;
  return data as unknown as DetailRequest;
}

/** Owner approves → one bulk (D6) + permanent (D7) grant is created. */
export async function approveRequest(requestId: string): Promise<AccessGrant> {
  const { data, error } = await supabase.rpc("approve_detail_request", { _request_id: requestId });
  if (error) throw error;
  return data as unknown as AccessGrant;
}

/** Owner rejects → no grant. */
export async function rejectRequest(requestId: string): Promise<DetailRequest> {
  const { data, error } = await supabase.rpc("reject_detail_request", { _request_id: requestId });
  if (error) throw error;
  return data as unknown as DetailRequest;
}

// ---------------------------------------------------------------------------
// Reads — RLS-gated
// ---------------------------------------------------------------------------

/** Requests I have SENT (requester side), newest first. */
export async function listMyRequests(userId: string): Promise<SentRequest[]> {
  const { data, error } = await supabase
    .from("detail_requests")
    .select(`*, portfolio:portfolios(${PORTFOLIO_REF})`)
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SentRequest[];
}

/** Inbox: requests on portfolios I OWN, newest first (with requester profile). */
export async function listInbox(userId: string): Promise<InboxRequest[]> {
  const { data, error } = await supabase
    .from("detail_requests")
    .select(
      `*, portfolio:portfolios(${PORTFOLIO_REF}), requester:profiles!detail_requests_requester_id_fkey(${REQUESTER_REF})`,
    )
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as InboxRequest[];
}

/** Active grants where I am the grantee (portfolios I can now unlock). */
export async function myAccessGrants(userId: string): Promise<AccessGrantWithPortfolio[]> {
  const { data, error } = await supabase
    .from("portfolio_access_grants")
    .select(`*, portfolio:portfolios(${PORTFOLIO_REF})`)
    .eq("grantee_id", userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AccessGrantWithPortfolio[];
}

/** My latest request for one portfolio (drives the request-button state). */
export async function myRequestForPortfolio(
  portfolioId: string,
  userId: string,
): Promise<DetailRequest | null> {
  const { data, error } = await supabase
    .from("detail_requests")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("requester_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/** Grant-aware access check (owner OR active grant) via the security-definer hook. */
export async function hasPortfolioAccess(portfolioId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_portfolio_access", {
    _portfolio_id: portfolioId,
  });
  if (error) throw error;
  return data === true;
}
