import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitApplication } from "@/lib/data/applications";

/**
 * ApplicationForm — Kurucu Üyelik başvuru formu (D28).
 * Submits (anon) to the `applications` table. Extra fields (portfolio type,
 * license, socials, referral) are folded into `message` since the table has a
 * fixed column set. Admin email notice is a P1 Resend TODO (see data/applications).
 */
export function ApplicationForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => ((fd.get(k) as string | null) ?? "").trim();
    const regions = get("regions")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const extras = [
      get("ptype") && `Portföy tipi: ${get("ptype")}`,
      get("license") && `Yetki belgesi: ${get("license")}`,
      get("social") && `Sosyal: ${get("social")}`,
      get("referral") && `Referans: ${get("referral")}`,
    ]
      .filter(Boolean)
      .join("\n");
    const message = [get("note"), extras].filter(Boolean).join("\n\n") || null;

    setSubmitting(true);
    const { error } = await submitApplication({
      full_name: get("name"),
      phone: get("phone"),
      email: get("email"),
      company: get("company") || null,
      regions,
      message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Başvuru gönderilemedi", { description: error.message });
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-gradient-surface p-8 text-center shadow-gold">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">
          Başvurunuz alındı
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Ekibimiz başvurunuzu inceleyip kısa süre içinde sizinle iletişime geçecek.
        </p>
        <Button
          variant="outline"
          className="mt-6 border-border-strong bg-surface/50 text-foreground hover:bg-surface"
          onClick={() => setSubmitted(false)}
        >
          Yeni başvuru
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border-strong bg-surface/60 p-6 shadow-elegant backdrop-blur-xl sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Ad Soyad" placeholder="Adınız ve soyadınız" required />
        <Field id="company" label="Şirket / Ofis" placeholder="Çalıştığınız şirket / ofis" />
        <Field id="phone" label="Telefon" placeholder="+90 5xx xxx xx xx" type="tel" required />
        <Field id="email" label="E-posta" placeholder="ornek@firma.com" type="email" required />
        <Field
          id="regions"
          label="Uzmanlık bölgeleri"
          placeholder="Bodrum, Yalıkavak, Tuzla…"
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Label htmlFor="ptype" className="text-xs text-muted-foreground">
            En çok çalıştığınız portföy tipi
          </Label>
          <select
            id="ptype"
            name="ptype"
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm text-foreground outline-none focus:border-gold/50"
            defaultValue=""
          >
            <option value="" disabled>
              Seçin
            </option>
            <option>Konut / Daire</option>
            <option>Villa / Yalı</option>
            <option>Arsa</option>
            <option>Ticari mülk</option>
            <option>Fabrika / Depo</option>
            <option>Otel / Restoran</option>
            <option>İşletme devri</option>
            <option>Yatırım varlığı</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="license" className="text-xs text-muted-foreground">
            Yetki belgeniz var mı?
          </Label>
          <select
            id="license"
            name="license"
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm text-foreground outline-none focus:border-gold/50"
            defaultValue=""
          >
            <option value="" disabled>
              Seçin
            </option>
            <option>Evet, taşınmaz ticareti yetki belgem var</option>
            <option>Başvuru sürecinde</option>
            <option>Hayır</option>
          </select>
        </div>
        <Field
          id="social"
          label="LinkedIn veya Instagram profiliniz"
          placeholder="linkedin.com/in/… veya @kullaniciadi"
          className="sm:col-span-2"
        />
        <Field
          id="referral"
          label="Davet eden kişi / referans"
          placeholder="Sizi yönlendiren profesyonel (opsiyonel)"
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Label htmlFor="note" className="text-xs text-muted-foreground">
            Notunuz
          </Label>
          <Textarea
            id="note"
            name="note"
            placeholder="Beklentileriniz veya eklemek istedikleriniz…"
            className="mt-1.5 min-h-[90px] bg-background/60"
          />
        </div>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="mt-6 w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
      >
        {submitting ? "Gönderiliyor…" : "Başvurumu Gönder"} <Send className="size-4" />
      </Button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Başvurular doğrulanmış emlak profesyonelleri arasından değerlendirilir.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  placeholder,
  type = "text",
  required = false,
  className = "",
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 bg-background/60"
      />
    </div>
  );
}
