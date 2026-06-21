import { useState } from "react";
import { Share2, Copy, Check, MessageCircle, Mail, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { publicUrl } from "@/lib/public-origin";

export function ShareProfileButton({
  username,
  variant = "outline",
  className,
}: {
  username: string;
  variant?: "outline" | "default" | "ghost";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const path = `/v/${username}`;
  const fullLink = publicUrl(path);

  const copy = () => {
    try {
      navigator.clipboard?.writeText(fullLink);
    } catch {
      /* mock-only: clipboard may be unavailable */
    }
    setCopied(true);
    toast.success("Profil bağlantısı kopyalandı", { description: path });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={variant} className={cn("gap-1.5", className)}>
          <Share2 className="size-4" /> Profili Paylaş
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-gold" />
          <p className="text-sm font-semibold text-foreground">Profil Bağlantısı</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Bu bağlantıyı paylaşarak profesyonelin profilini gösterebilirsiniz.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
          <span className="truncate text-sm text-secondary-foreground">{path}</span>
          <button
            onClick={copy}
            className={cn(
              "ml-auto flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
              copied ? "text-gold" : "text-muted-foreground hover:text-foreground",
            )}
            aria-label="Bağlantıyı kopyala"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Doğrulanmış emlak profesyoneli profili: ${fullLink}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a
              href={`mailto:?subject=${encodeURIComponent("Bölgenin Uzmanı — Profil")}&body=${encodeURIComponent(`Doğrulanmış emlak profesyoneli profili:\n${fullLink}`)}`}
            >
              <Mail className="size-4" /> E-posta
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Alias kept for the component naming used across docs / profile pages. */
export const ProfileShareButton = ShareProfileButton;
