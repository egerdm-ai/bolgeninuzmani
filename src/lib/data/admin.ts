import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// Admin verification data layer. Reads use admin-only RLS (profiles_select_admin,
// applications_select_admin) — no special RPC needed. The ONLY status write path is the
// admin-validated SECURITY DEFINER RPC admin_set_profile_status (is_admin gate inside;
// a non-admin caller is rejected). The client never writes profiles.status directly.

export type PendingProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  | "id"
  | "full_name"
  | "username"
  | "title"
  | "company_name"
  | "location"
  | "bio"
  | "contact_phone"
  | "contact_email"
  | "contact_whatsapp"
  | "expertise_regions"
  | "expertise_types"
  | "created_at"
>;

export type Application = Pick<
  Database["public"]["Tables"]["applications"]["Row"],
  | "id"
  | "full_name"
  | "phone"
  | "email"
  | "company"
  | "regions"
  | "message"
  | "status"
  | "created_at"
>;

/** Pending agents awaiting verification (admin RLS). Oldest first (FIFO review). */
export async function listPendingProfiles(): Promise<PendingProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, username, title, company_name, location, bio, contact_phone, contact_email, contact_whatsapp, expertise_regions, expertise_types, created_at",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Landing lead applications (admin RLS, read-only). Newest first. */
export async function listApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("id, full_name, phone, email, company, regions, message, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Verify (onayla) or suspend (reddet, reversible) a profile — admin-validated RPC. */
export async function setProfileStatus(
  userId: string,
  status: "verified" | "suspended",
): Promise<void> {
  const { error } = await supabase.rpc("admin_set_profile_status", {
    _user_id: userId,
    _status: status,
  });
  if (error) throw error;
}
