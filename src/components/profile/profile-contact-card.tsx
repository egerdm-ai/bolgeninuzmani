import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { SurfaceCard } from "@/components/vault/cards";

/**
 * Open contact panel for a profile — REAL data only. Unlike the old mock
 * ContactCard (which derived a fake phone/email from the id), every row here
 * comes from a real profile field; null fields are simply hidden (never faked).
 * All values are public network contact info (D8) — no locked data.
 */
export function ProfileContactCard({
  phone,
  email,
  whatsapp,
  location,
}: {
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  location: string | null;
}) {
  const wa = whatsapp?.replace(/\D/g, "");
  const rows = [
    wa && {
      label: "WhatsApp",
      value: "Mesaj gönder",
      icon: MessageCircle,
      href: `https://wa.me/${wa}`,
    },
    phone && { label: "Telefon", value: phone, icon: Phone, href: `tel:${phone}` },
    email && { label: "E-posta", value: email, icon: Mail, href: `mailto:${email}` },
    location && { label: "Ofis", value: location, icon: MapPin, href: undefined },
  ].filter(Boolean) as {
    label: string;
    value: string;
    icon: typeof Phone;
    href?: string;
  }[];

  return (
    <SurfaceCard className="border-border-strong">
      <h3 className="text-sm font-semibold text-foreground">İletişim Bilgileri</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">İletişim bilgisi paylaşılmamış.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((r) => {
            const inner = (
              <>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-gold">
                  <r.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                    {r.label}
                  </span>
                  <span className="block truncate text-sm font-medium text-foreground">
                    {r.value}
                  </span>
                </span>
              </>
            );
            return r.href ? (
              <a
                key={r.label}
                href={r.href}
                target={r.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2 transition-colors hover:border-gold/40"
              >
                {inner}
              </a>
            ) : (
              <div
                key={r.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2"
              >
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </SurfaceCard>
  );
}
