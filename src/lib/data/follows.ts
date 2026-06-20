import { supabase } from "@/lib/supabase/client";

// B11 Takip Et. follows is own-scoped (RLS: follower_id = auth.uid()); a member can
// only read/write their OWN follow edges. No D13 data. NOTE: follower counts (how
// many follow agent X) need a definer aggregate RPC (the SELECT policy is
// follower-only), so they are intentionally omitted here.

export async function followAgent(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

export async function unfollowAgent(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) throw error;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

/** Ids of agents the user follows. */
export async function listFollowing(followerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", followerId);
  if (error) throw error;
  return (data ?? []).map((r) => r.following_id);
}
