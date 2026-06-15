import {
  Lock,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Languages as LanguagesIcon,
  Compass,
  Instagram,
  Linkedin,
  Globe,
  CreditCard,
} from "lucide-react";
import type { Professional } from "@/lib/mock/types";
import { SurfaceCard, InfoPanel } from "./cards";
import { RegionLinkChip } from "./region-link-chip";

const lockedFields = [
  { label: "Telefon", icon: Phone },
  { label: "E-posta", icon: Mail },
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Ofis Adresi", icon: MapPin },
];

/** Mock languages — elite advisors get an extra language. */
function languagesFor(pro: Professional): string[] {
  const base = ["Türkçe", "İngilizce"];
  if (pro.membershipTier === "elite") base.push("Rusça");
  return base;
}

function socialLinksFor(pro: Professional) {
  return [
    { label: "Instagram", icon: Instagram, href: `https://instagram.com/${pro.username}` },
    { label: "LinkedIn", icon: Linkedin, href: `https://linkedin.com/in/${pro.username}` },
    {
      label: "Website",
      icon: Globe,
      href: `https://${pro.username.replace(/-/g, "")}.vault.estate`,
    },
    { label: "WhatsApp Katalog", icon: MessageCircle, href: `https://wa.me/c/${pro.username}` },
    { label: "Dijital Kart", icon: CreditCard, href: `https://vault.estate/card/${pro.username}` },
  ];
}

/** "Hakkında" — bio, specialty summary, languages, regions, locked contact, socials. */
export function ProfessionalAboutSection({ professional }: { professional: Professional }) {
  const languages = languagesFor(professional);
  const socials = socialLinksFor(professional);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <InfoPanel title="Hakkında" className="self-start">
          <p className="text-sm leading-relaxed text-secondary-foreground">{professional.bio}</p>

          <div className="mt-4 space-y-3">
            <Row icon={Compass} label="Uzmanlık">
              {professional.expertiseTypes.join(", ")}
            </Row>
            <Row icon={LanguagesIcon} label="Diller">
              {languages.join(", ")}
            </Row>
            <Row icon={MapPin} label="Çalışma Bölgeleri">
              <span className="flex flex-wrap gap-1.5">
                {professional.expertiseRegions.map((r) => (
                  <RegionLinkChip key={r} region={r} withIcon />
                ))}
              </span>
            </Row>
          </div>
        </InfoPanel>

        {/* Locked contact */}
        <SurfaceCard className="border-border-strong">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-gold" />
            <h3 className="text-sm font-semibold text-foreground">İletişim Bilgileri</h3>
          </div>
          <div className="mt-3 space-y-2">
            {lockedFields.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <f.icon className="size-3.5 text-gold/70" /> {f.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-background/60 px-2 py-0.5 text-xs text-secondary-foreground ring-1 ring-inset ring-border-strong">
                  <Lock className="size-3" /> Kilitli
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Detay talebi veya karşılıklı onay sonrası görünür.
          </p>
        </SurfaceCard>
      </div>

      {/* Social / contact area */}
      <InfoPanel title="Sosyal & Bağlantılar" className="self-start">
        <p className="text-sm text-muted-foreground">
          Bu profesyonelin herkese açık dijital bağlantıları.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5 transition-colors hover:border-gold/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-gold">
                <s.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground group-hover:text-gold">
                  {s.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{s.href}</span>
              </span>
            </a>
          ))}
        </div>
      </InfoPanel>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Compass;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-gold" />
      <div className="min-w-0">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className="text-secondary-foreground">{children}</div>
      </div>
    </div>
  );
}
