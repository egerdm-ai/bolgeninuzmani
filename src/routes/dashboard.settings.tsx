import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/settings")({
  component: Settings,
});

const tabs = [
  { key: "account", label: "Hesap" },
  { key: "privacy", label: "Gizlilik" },
  { key: "prefs", label: "Tercihler" },
];

function Settings() {
  const [tab, setTab] = useState("account");

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Ayarlar" subtitle="Hesap, gizlilik ve tercih ayarlarınız." />

      <div className="flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-gradient-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <SurfaceCard className="max-w-2xl space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Hesap Bilgileri</h3>
          <div className="space-y-1.5"><Label>E-posta</Label><Input defaultValue="taylan@bodrumluxury.com" /></div>
          <div className="space-y-1.5"><Label>Telefon</Label><Input defaultValue="+90 532 000 00 00" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Yeni Şifre</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="space-y-1.5"><Label>Şifre Tekrar</Label><Input type="password" placeholder="••••••••" /></div>
          </div>
          <Button onClick={() => toast.success("Hesap güncellendi")} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Kaydet</Button>
        </SurfaceCard>
      )}

      {tab === "privacy" && (
        <SurfaceCard className="max-w-2xl space-y-2">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Gizlilik</h3>
          <ToggleRow label="Profil görünürlüğü" desc="Profiliniz tüm doğrulanmış üyelere açık" defaultChecked />
          <ToggleRow label="İletişim bilgilerini gizle" desc="Telefon ve e-posta yalnızca erişim onayında görünür" defaultChecked />
          <ToggleRow label="Çevrimiçi durumu göster" desc="Aktiflik durumunuz görünsün" />
          <div className="space-y-1.5 pt-2">
            <Label>Varsayılan portföy görünürlüğü</Label>
            <Select defaultValue="members">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="members">Platform Üyelerine Açık</SelectItem>
                <SelectItem value="invite">Sadece Davetle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SurfaceCard>
      )}

      {tab === "prefs" && (
        <SurfaceCard className="max-w-2xl space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Tercihler</h3>
          <ToggleRow label="E-posta bildirimleri" desc="Yeni detay talepleri için e-posta al" defaultChecked />
          <ToggleRow label="Push bildirimleri" desc="Anlık bildirimler" defaultChecked />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>Dil</Label>
              <Select defaultValue="tr"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tr">Türkçe</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-1.5">
              <Label>Para Birimi</Label>
              <Select defaultValue="TRY"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TRY">TRY</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-1.5">
              <Label>Alan Birimi</Label>
              <Select defaultValue="m2"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="m2">m²</SelectItem><SelectItem value="ft">ft²</SelectItem></SelectContent></Select>
            </div>
          </div>
          <Button onClick={() => toast.success("Tercihler kaydedildi")} className="bg-gradient-gold text-primary-foreground hover:opacity-90">Kaydet</Button>
        </SurfaceCard>
      )}
    </PageContainer>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
