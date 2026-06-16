import * as React from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * ApplicationForm — private beta / waitlist application.
 * Local/mock submit only. No backend.
 * TODO[backend]: POST to `applications` table + notify VAULT team (email).
 */
export function ApplicationForm() {
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO[backend]: send form payload to server function / Lovable Cloud.
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
          VAULT ekibi başvurunuzu inceleyip kısa süre içinde sizinle iletişime geçecek.
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
        <Field id="company" label="Şirket" placeholder="Çalıştığınız şirket" />
        <Field id="phone" label="Telefon" placeholder="+90 5xx xxx xx xx" type="tel" required />
        <Field id="email" label="E-posta" placeholder="ornek@firma.com" type="email" required />
        <Field
          id="regions"
          label="Çalıştığınız bölgeler"
          placeholder="Bodrum, Yalıkavak, Bebek…"
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Label htmlFor="ptype" className="text-xs text-muted-foreground">
            Portföy tipi
          </Label>
          <select
            id="ptype"
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm text-foreground outline-none focus:border-gold/50"
            defaultValue=""
          >
            <option value="" disabled>
              Seçin
            </option>
            <option>Villa</option>
            <option>Yalı</option>
            <option>Daire / Rezidans</option>
            <option>Arsa</option>
            <option>Ticari</option>
            <option>Karma</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="note" className="text-xs text-muted-foreground">
            Not
          </Label>
          <Textarea
            id="note"
            placeholder="VAULT'tan beklentileriniz veya eklemek istedikleriniz…"
            className="mt-1.5 min-h-[90px] bg-background/60"
          />
        </div>
      </div>
      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
      >
        Başvurumu Gönder <Send className="size-4" />
      </Button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Başvurular davetli ve doğrulanmış profesyonel kriterlerine göre değerlendirilir.
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
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 bg-background/60"
      />
    </div>
  );
}
