import { useState } from "react";
import {
  ShieldCheck,
  Instagram,
  Linkedin,
  Globe,
  MessageCircle,
  CreditCard,
  FileText,
  Building2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { Professional } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type LinkDef = {
  label: string;
  description: string;
  icon: typeof Globe;
  href?: string;
  copyValue?: string;
};

/** "Diğer Linkler" — compact link hub. Public profile copies; others open. */
export function ProfessionalLinksSection({ professional }: { professional: Professional }) {
  const [copied, setCopied] = useState(false);
  const publicPath = `/v/${professional.username}`;

  const copyPublic = () => {
    const full =
      typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : publicPath;
    try {
      navigator.clipboard?.writeText(full);
    } catch {
      /* mock-only: clipboard may be unavailable */
    }
    setCopied(true);
    toast.success("Public VAULT profil bağlantısı kopyalandı", { description: publicPath });
    setTimeout(() => setCopied(false), 2000);
  };

  const links: LinkDef[] = [
    {
      label: "Public VAULT Profili",
      description: publicPath,
      icon: ShieldCheck,
      copyValue: publicPath,
    },
    {
      label: "Instagram",
      description: "Güncel portföy hikâyeleri",
      icon: Instagram,
      href: `https://instagram.com/${professional.username}`,
    },
    {
      label: "LinkedIn",
      description: "Profesyonel geçmiş",
      icon: Linkedin,
      href: `https://linkedin.com/in/${professional.username}`,
    },
    {
      label: "Website",
      description: "Kişisel danışman sitesi",
      icon: Globe,
      href: `https://${professional.username.replace(/-/g, "")}.vault.estate`,
    },
    {
      label: "WhatsApp Katalog",
      description: "Portföy kataloğu",
      icon: MessageCircle,
      href: `https://wa.me/c/${professional.username}`,
    },
    {
      label: "Dijital Kartvizit",
      description: "Tek dokunuşla iletişim",
      icon: CreditCard,
      href: `https://vault.estate/card/${professional.username}`,
    },
    {
      label: "PDF Portföy Sunumu",
      description: "Marka kapaklı sunum",
      icon: FileText,
      href: "#",
    },
    {
      label: "Şirket Sayfası",
      description: professional.companyName,
      icon: Building2,
      href: "#",
    },
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Diğer Linkler</h2>
        <p className="text-sm text-muted-foreground">
          Bu profesyonele ait herkese açık bağlantılar ve dijital varlıklar.
        </p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => {
          const isCopy = !!l.copyValue;
          const content = (
            <>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-gold">
                <l.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground group-hover:text-gold">
                  {l.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{l.description}</span>
              </span>
              {isCopy ? (
                copied ? (
                  <Check className="size-4 shrink-0 text-gold" />
                ) : (
                  <Copy className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                )
              ) : (
                <ExternalLink className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
              )}
            </>
          );
          const className = cn(
            "group flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-3 text-left transition-colors hover:border-gold/40",
          );

          if (isCopy) {
            return (
              <button key={l.label} onClick={copyPublic} className={className}>
                {content}
              </button>
            );
          }
          return (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={className}>
              {content}
            </a>
          );
        })}
      </div>
    </section>
  );
}
