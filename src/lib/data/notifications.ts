import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// B11 Bildirimler. notifications is per-user (RLS: user_id = auth.uid()), system-
// WRITTEN: clients have NO insert policy/grant — they may only SELECT own rows and
// UPDATE the read flag. Rows are created server-side (notify-writer; see the B11
// notify migration draft). Until that is pushed the list is simply empty.

export type AppNotification = Database["public"]["Tables"]["notifications"]["Row"];

export async function listMyNotifications(userId: string, limit = 30): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function unreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
  return count ?? 0;
}

export async function markRead(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}
