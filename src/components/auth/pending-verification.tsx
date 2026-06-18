import { Clock, LogOut, ShieldCheck, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Shown by the dashboard guard when the signed-in user's profile.status is not
 * 'verified' (D27 verification gate). No network access; the user can only sign
 * out and wait for an admin to verify them. (Profile completion for pending
 * users is wired in a later step.)
 */
export function VerificationGate({ status }: { status: "pending" | "suspended" }) {
  const { user, signOut } = useAuth();
  const suspended = status === "suspended";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <span
          className={
            "mx-auto flex size-12 items-center justify-center rounded-xl " +
            (suspended ? "bg-destructive/15 text-destructive" : "bg-gold/15 text-gold")
          }
        >
          {suspended ? <Ban className="size-6" /> : <Clock className="size-6" />}
        </span>

        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
          {suspended ? "Hesabınız askıya alındı" : "Hesabınız doğrulama bekliyor"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {suspended
            ? "Erişiminiz şu anda kapalı. Bilgi için ekiple iletişime geçin."
            : "Başvurunuz alındı. Bir yönetici hesabınızı doğruladıktan sonra ağa erişebilecek, portföyleri keşfedebilecek ve kendi portföylerinizi paylaşabileceksiniz."}
        </p>

        {!suspended && (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-gold/25 bg-gold/[0.05] px-3 py-2 text-xs text-gold">
            <ShieldCheck className="size-4" /> Doğrulanmış üyeler kapalı ağa erişir.
          </div>
        )}

        {user?.email && (
          <p className="mt-4 text-xs text-muted-foreground">
            Giriş yapılan hesap: <span className="text-secondary-foreground">{user.email}</span>
          </p>
        )}

        <Button variant="outline" className="mt-6 w-full gap-1.5" onClick={() => signOut()}>
          <LogOut className="size-4" /> Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
