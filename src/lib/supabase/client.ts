import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Browser / anon Supabase client.
 *
 * Uses the PUBLIC project URL + publishable (anon) key — both safe to ship in
 * the client bundle. Every read/write through this client is subject to RLS.
 * Cookie-based session handling (via @supabase/ssr) makes the session readable
 * by server functions for RLS-scoped reads.
 *
 * NEVER import the service-role client (`admin.server.ts`) from anywhere that
 * reaches this module — the service-role key must never enter the client
 * bundle (Invariant #4).
 */
export const supabase = createBrowserClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
