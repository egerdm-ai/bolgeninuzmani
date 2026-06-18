import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { fetchMyProfile, fetchMyRoles, type AppRole, type Profile } from "@/lib/data/auth";

type AuthValue = {
  /** True until the initial session + profile resolve. */
  loading: boolean;
  session: Session | null;
  user: User | null;
  /** Own profile row (null while loading or if not yet created). */
  profile: Profile | null;
  roles: AppRole[];
  isAdmin: boolean;
  /** Re-fetch the profile (e.g. after editing it, or after admin verification). */
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setRoles([]);
      return;
    }
    try {
      const [p, r] = await Promise.all([fetchMyProfile(userId), fetchMyRoles(userId)]);
      setProfile(p);
      setRoles(r);
    } catch {
      // RLS/network error — treat as no profile rather than crashing the shell.
      setProfile(null);
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      await loadProfile(nextSession?.user.id);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      roles,
      isAdmin: roles.includes("admin"),
      refreshProfile: () => loadProfile(session?.user.id),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, session, profile, roles, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
