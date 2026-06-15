import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import type { Portfolio } from "@/lib/mock/types";
import { formatPrice } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DetailRequestModal({
  portfolio,
  open,
  onOpenChange,
}: {
  portfolio: Portfolio | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [message, setMessage] = useState("");

  if (!portfolio) return null;

  const submit = () => {
    onOpenChange(false);
    setMessage("");
    toast.success("Detay talebiniz gönderildi", {
      description: `${portfolio.title} için talebiniz portföy sahibine iletildi.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detay Talebi Gönder</DialogTitle>
          <DialogDescription>
            Kilitli bilgilere erişim için portföy sahibine talep gönderin.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
          <img src={portfolio.coverImage} alt="" className="h-12 w-16 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{portfolio.title}</p>
            <p className="text-sm text-gold">{formatPrice(portfolio.price, portfolio.currency)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Talep Amacı</Label>
            <Select defaultValue="client">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Müşterim için</SelectItem>
                <SelectItem value="self">Kendim için</SelectItem>
                <SelectItem value="investment">Yatırım</SelectItem>
                <SelectItem value="info">Bilgi amaçlı</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Alıcı / Müşteri özeti</Label>
              <Input placeholder="örn. İstanbul'dan yatırımcı" />
            </div>
            <div className="space-y-1.5">
              <Label>Bütçe (opsiyonel)</Label>
              <Input placeholder="örn. 60-70M TL" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Not</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Talebinizle ilgili kısa bir not yazın..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
          <Button onClick={submit} className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90">
            <Send className="size-4" /> Talebi Gönder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
