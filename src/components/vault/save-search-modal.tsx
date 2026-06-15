import { useState } from "react";
import { BookmarkPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { notificationFrequencyLabels } from "@/lib/mock/types";
import type { NotificationFrequency } from "@/lib/mock/types";

const freqOptions: NotificationFrequency[] = ["instant", "daily", "weekly", "off"];

export interface SaveSearchPayload {
  name: string;
  note: string;
  frequency: NotificationFrequency;
  notifyNewMatches: boolean;
}

export function SaveSearchModal({
  open,
  onOpenChange,
  defaultName = "Yeni Arayış",
  activeCount,
  resultCount,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultName?: string;
  activeCount: number;
  resultCount: number;
  onSave: (payload: SaveSearchPayload) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState<NotificationFrequency>("instant");
  const [notifyNewMatches, setNotifyNewMatches] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border-strong bg-surface">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Arayış Olarak Kaydet</DialogTitle>
          <DialogDescription>
            Bu aramayı kaydedin; uygun yeni portföyler eklendiğinde bildirim alın.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Arayış adı</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="örn. Bodrum Deniz Manzaralı Villa" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Müşteri notu</Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="örn. A. Yılmaz (VIP) — yalnızca müstakil"
            />
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
            {activeCount} aktif filtre · {resultCount} mevcut sonuç kaydedilecek.
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Bildirim sıklığı</Label>
            <div className="grid grid-cols-2 gap-2">
              {freqOptions.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                    frequency === f
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {notificationFrequencyLabels[f]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5">
            <Label className="text-sm text-secondary-foreground">Yeni eşleşmelerde bildir</Label>
            <Switch checked={notifyNewMatches} onCheckedChange={setNotifyNewMatches} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            onClick={() => onSave({ name, note, frequency, notifyNewMatches })}
          >
            <BookmarkPlus className="size-4" /> Arayışı Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
