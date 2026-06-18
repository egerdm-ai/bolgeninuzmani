import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail } from "@/lib/data/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) {
      toast.error("Giriş başarısız", { description: error.message });
      return;
    }
    toast.success("Giriş yapıldı");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      title="Giriş Yap"
      subtitle="Bölgenin Uzmanı hesabınıza erişin."
      footer={
        <>
          Hesabınız yok mu?{" "}
          <Link to="/signup" className="font-medium text-gold hover:underline">
            Kayıt olun
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@eposta.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
        >
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </Button>
      </form>
    </AuthShell>
  );
}
