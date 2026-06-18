import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/data/auth";

/** Fields a user may edit on their own profile (status/role/tier are NOT here). */
export type EditableProfile = Pick<
  Profile,
  | "full_name"
  | "username"
  | "title"
  | "company_name"
  | "location"
  | "bio"
  | "avatar_url"
  | "contact_phone"
  | "contact_email"
  | "contact_whatsapp"
  | "expertise_regions"
  | "expertise_types"
>;

/**
 * Update the signed-in user's own profile (RLS: profiles_update_self).
 * `status` is deliberately excluded — it is admin-only (guard_profile_status, D27).
 * Username uniqueness is enforced by the DB; callers handle the 23505 error.
 */
export async function updateMyProfile(userId: string, patch: Partial<EditableProfile>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select()
    .single();
  return { data, error };
}
