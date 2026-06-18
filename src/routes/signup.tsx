import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmail } from "@/lib/data/auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await signUpWithEmail(
      email.trim(),
      password,
      fullName.trim() || undefined,
    );
    setLoading(false);
    if (error) {
      toast.error("Kayıt başarısız", { description: error.message });
      return;
    }
    // Email-confirmation ON → no session yet; OFF → session present, go straight in.
    if (data.session) {
      toast.success("Hesabınız oluşturuldu");
      navigate({ to: "/dashboard" });
    } else {
      setConfirmSent(true);
    }
  }

  if (confirmSent) {
    return (
      <AuthShell
        title="E-postanızı onaylayın"
        subtitle="Hesabınızı etkinleştirmek için son bir adım."
        footer={
          <Link to="/login" className="font-medium text-gold hover:underline">
            Giriş ekranına dön
          </Link>
        }
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <MailCheck className="size-6" />
          </span>
          <p className="mt-4 text-sm text-secondary-foreground">
            <span className="font-medium text-foreground">{email}</span> adresine bir onay
            bağlantısı gönderdik. Bağlantıya tıkladıktan sonra giriş yapın; hesabınız bir yönetici
            doğrulayana kadar <span className="text-gold">doğrulama bekliyor</span> durumunda olur.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Kayıt Ol"
      subtitle="Kapalı ağ için hesap oluşturun. Erişim, yönetici doğrulamasından sonra açılır."
      footer={
        <>
          Zaten hesabınız var mı?{" "}
          <Link to="/login" className="font-medium text-gold hover:underline">
            Giriş yapın
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Ad Soyad</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Adınız Soyadınız"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="En az 6 karakter"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
        >
          {loading ? "Hesap oluşturuluyor…" : "Kayıt Ol"}
        </Button>
      </form>
    </AuthShell>
  );
}
