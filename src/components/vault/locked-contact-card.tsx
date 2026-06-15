import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import type { Professional } from "@/lib/mock/types";
import { SurfaceCard } from "./cards";

/** Deterministic mock phone number derived from the professional id. */
function mockPhone(seed: string): string {
  let n = 0;
  for (const c of seed) n = (n * 31 + c.charCodeAt(0)) % 100000000;
  const d = n.toString().padStart(8, "0");
  return `+90 53${d[0]} ${d.slice(1, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)}`;
}

function mockEmail(pro: Professional): string {
  const domain = (pro.companyName ?? "vault")
    .toLocaleLowerCase("tr")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18) || "vault";
  return `${pro.username.replace(/-/g, ".")}@${domain}.com`;
}

/**
 * Open contact panel for a professional profile. Contact details are public in
 * the network and immediately actionable (mock data, no backend).
 */
export function ContactCard({ professional }: { professional: Professional }) {
  const phone = mockPhone(professional.id);
  const email = mockEmail(professional);
  const waNumber = phone.replace(/[^0-9]/g, "");

  const rows = [
    { label: "Telefon", value: phone, icon: Phone, href: `tel:${waNumber}` },
    { label: "E-posta", value: email, icon: Mail, href: `mailto:${email}` },
    {
      label: "WhatsApp",
      value: "Mesaj gönder",
      icon: MessageCircle,
      href: `https://wa.me/${waNumber}`,
    },
    {
      label: "Ofis",
      value: professional.location,
      icon: MapPin,
      href: undefined,
    },
  ];

  return (
    <SurfaceCard className="border-border-strong">
      <h3 className="text-sm font-semibold text-foreground">İletişim Bilgileri</h3>
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
    </SurfaceCard>
  );
}
