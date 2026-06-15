import { Lock, Phone, Mail, MapPin } from "lucide-react";
import { SurfaceCard } from "./cards";

const fields = [
  { label: "Telefon", icon: Phone },
  { label: "E-posta", icon: Mail },
  { label: "Ofis Adresi", icon: MapPin },
];

/**
 * Locked contact panel for a professional profile. Real contact details are
 * only revealed after a detail request / mutual approval (mock-only here).
 */
export function LockedContactCard() {
  return (
    <SurfaceCard className="border-border-strong">
      <div className="flex items-center gap-2">
        <Lock className="size-4 text-gold" />
        <h3 className="text-sm font-semibold text-foreground">İletişim Bilgileri</h3>
      </div>
      <div className="mt-3 space-y-2">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2"
          >
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <f.icon className="size-3.5 text-gold/70" /> {f.label}
            </span>
            <span className="flex items-center gap-1 rounded-md bg-background/60 px-2 py-0.5 text-xs text-secondary-foreground ring-1 ring-inset ring-border-strong">
              <Lock className="size-3" /> Kilitli
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        İletişim bilgileri yalnızca detay talebi veya karşılıklı onay sonrası paylaşılır.
      </p>
    </SurfaceCard>
  );
}
