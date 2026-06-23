import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/data/auth";
import { processAvatarImage } from "@/lib/image-resize";

const AVATARS_BUCKET = "avatars";

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

/**
 * Upload an avatar to the public `avatars` bucket at `<userId>/<uuid>.webp`
 * (path prefix = uid so storage RLS can gate writes) and return its public URL.
 * The caller stores the URL on profiles.avatar_url via updateMyProfile.
 * REQUIRES the `avatars` bucket + storage policies (see the avatars migration).
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const blob = await processAvatarImage(file);
  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(path, blob, {
    cacheControl: "3600",
    upsert: false,
    contentType: "image/webp",
  });
  if (error) throw error;
  return supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path).data.publicUrl;
}
