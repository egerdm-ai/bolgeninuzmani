import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { VerificationGate } from "@/components/auth/pending-verification";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-gold" />
    </div>
  );
}

/**
 * Auth + verification guard for the whole /dashboard subtree (D27).
 *   - no session            → redirect to /login
 *   - session, status≠verified → VerificationGate (pending / suspended), no app
 *   - verified              → the app (AppShell + nested routes)
 *
 * Runs client-side; SSR shows the loader until auth resolves on hydration.
 */
function DashboardLayout() {
  const { loading, session, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || !session || !profile) return <FullScreenLoader />;

  if (profile.status !== "verified") {
    return <VerificationGate status={profile.status === "suspended" ? "suspended" : "pending"} />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
