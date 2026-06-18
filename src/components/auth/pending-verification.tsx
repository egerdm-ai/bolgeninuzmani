import { Clock, LogOut, ShieldCheck, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { ProfileForm } from "@/components/profile/profile-form";

/**
 * Shown by the dashboard guard when the signed-in user's profile.status is not
 * 'verified' (D27 verification gate).
 *   - pending   → verification notice + a profile-completion form (D27 lets a
 *                 pending user read/complete their own profile) + sign out.
 *   - suspended → notice + sign out only.
 * No network access either way.
 */
export function VerificationGate({ status }: { status: "pending" | "suspended" }) {
  const { user, signOut } = useAuth();

  if (status === "suspended") {
    return (
      <Centered>
        <Notice suspended email={user?.email} onSignOut={() => signOut()} />
      </Centered>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Notice email={user?.email} onSignOut={() => signOut()} />
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Profilinizi tamamlayın
          </h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Doğrulama beklerken profil bilgilerinizi hazırlayabilirsiniz; doğrulandığınızda ağda
            böyle görüneceksiniz.
          </p>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {children}
    </div>
  );
}

function Notice({
  suspended,
  email,
  onSignOut,
}: {
  suspended?: boolean;
  email?: string;
  onSignOut: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center">
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
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {suspended
          ? "Erişiminiz şu anda kapalı. Bilgi için ekiple iletişime geçin."
          : "Başvurunuz alındı. Bir yönetici hesabınızı doğruladıktan sonra ağa erişebilecek, portföyleri keşfedebilecek ve kendi portföylerinizi paylaşabileceksiniz."}
      </p>
      {!suspended && (
        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-lg border border-gold/25 bg-gold/[0.05] px-3 py-2 text-xs text-gold">
          <ShieldCheck className="size-4" /> Doğrulanmış üyeler kapalı ağa erişir.
        </div>
      )}
      {email && (
        <p className="mt-4 text-xs text-muted-foreground">
          Giriş yapılan hesap: <span className="text-secondary-foreground">{email}</span>
        </p>
      )}
      <Button variant="outline" className="mt-6 gap-1.5" onClick={onSignOut}>
        <LogOut className="size-4" /> Çıkış Yap
      </Button>
    </div>
  );
}
