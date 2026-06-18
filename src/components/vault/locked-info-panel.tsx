import { Lock, MapPin, FileText, Phone, FileBadge, UserRound, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "./cards";

const lockedItems = [
  { icon: MapPin, label: "Tam Adres" },
  { icon: FileText, label: "PDF Portföy" },
  { icon: Phone, label: "Telefon" },
  { icon: FileBadge, label: "Tapu / Belgeler" },
  { icon: UserRound, label: "Malik / Özel Notlar" },
];

export function LockedInfoPanel({ onRequest }: { onRequest?: () => void }) {
  return (
    <SurfaceCard className="border-gold/25 bg-gold/[0.04] p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
          <Lock className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Kilitli Bilgiler</h3>
          <p className="text-xs text-muted-foreground">Erişim için detay talebi gönderin</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {lockedItems.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2 text-secondary-foreground">
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
            </span>
            <Lock className="size-3.5 text-muted-foreground" />
          </li>
        ))}
      </ul>
      <Button
        onClick={onRequest}
        className="mt-4 w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
      >
        <Send className="size-4" /> Detay Talebi Gönder
      </Button>
    </SurfaceCard>
  );
}
