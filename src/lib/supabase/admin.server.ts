import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * SERVER-ONLY service-role Supabase client.
 *
 * The `.server.ts` suffix keeps this file out of the client bundle. It uses the
 * SERVICE_ROLE key, which BYPASSES RLS and has full DB access — only ever use it
 * inside TanStack Start server functions for privileged writes (e.g. admin
 * verify/suspend, application triage). NEVER import this from a client component
 * (Invariant #4).
 *
 * Read env INSIDE the function (per-request), never at module scope — on
 * request-time-bound runtimes module-scope reads resolve to undefined.
 */
export function getServiceRoleClient() {
  if (typeof window !== "undefined") {
    throw new Error("admin.server.ts must never be imported on the client");
  }
  const url = import.meta.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (server-only env)");
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
