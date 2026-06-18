import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// Typed auth + profile data access. Components/screens call these — no Supabase
// query logic lives in components. Reads run as the signed-in user under RLS.
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileStatus = Database["public"]["Enums"]["profile_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];

const emailRedirectTo = () =>
  typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;

/** Self-serve signup (email/password). The DB trigger creates a `pending` profile + `agent` role. */
export function signUpWithEmail(email: string, password: string, fullName?: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: emailRedirectTo(),
    },
  });
}

export function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signOut() {
  return supabase.auth.signOut();
}

/** Own profile row (RLS: profiles_select_self). Returns null if none yet. */
export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/** Own roles (RLS: user_roles_select). */
export async function fetchMyRoles(userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.role);
}
