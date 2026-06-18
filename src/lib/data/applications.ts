import { supabase } from "@/lib/supabase/client";

/**
 * Landing application intake (D28). Inserts as the anon client — RLS
 * `applications_insert_public` allows anon INSERT with status='new'.
 * An application is NOT an account; an admin reviews and then invites (D14).
 */
export async function submitApplication(payload: {
  full_name: string;
  phone: string;
  email: string;
  company?: string | null;
  regions?: string[];
  message?: string | null;
}) {
  const { error } = await supabase.from("applications").insert({
    full_name: payload.full_name,
    phone: payload.phone,
    email: payload.email,
    company: payload.company ?? null,
    regions: payload.regions ?? [],
    message: payload.message ?? null,
    status: "new",
  });

  // TODO[P1][Resend]: notify admins by email on a new application (D28).
  //   Wire via an Edge Function / DB webhook + Resend once the API key + domain
  //   are ready. MUST NOT block this insert or the UI — fire-and-forget later.
  return { error };
}
