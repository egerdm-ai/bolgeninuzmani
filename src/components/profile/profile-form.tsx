import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth/auth-context";
import { updateMyProfile, type EditableProfile } from "@/lib/data/profile";

const toList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/**
 * Editable profile form bound to the signed-in user's own profile
 * (profiles_update_self RLS). Reused by Profilim (verified) and the pending
 * verification screen (so a `pending` user can complete their profile — D27).
 * username is editable here; uniqueness errors surface inline.
 */
export function ProfileForm({ onSaved }: { onSaved?: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    username: profile?.username ?? "",
    title: profile?.title ?? "",
    company_name: profile?.company_name ?? "",
    location: profile?.location ?? "",
    bio: profile?.bio ?? "",
    contact_phone: profile?.contact_phone ?? "",
    contact_email: profile?.contact_email ?? "",
    contact_whatsapp: profile?.contact_whatsapp ?? "",
    expertise_regions: (profile?.expertise_regions ?? []).join(", "),
    expertise_types: (profile?.expertise_types ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name.trim() || !form.username.trim()) {
      toast.error("Ad Soyad ve kullanıcı adı zorunludur");
      return;
    }
    setSaving(true);
    const patch: Partial<EditableProfile> = {
      full_name: form.full_name.trim(),
      username: form.username.trim(),
      title: form.title.trim() || null,
      company_name: form.company_name.trim() || null,
      location: form.location.trim() || null,
      bio: form.bio.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      contact_email: form.contact_email.trim() || null,
      contact_whatsapp: form.contact_whatsapp.trim() || null,
      expertise_regions: toList(form.expertise_regions),
      expertise_types: toList(form.expertise_types),
    };
    const { error } = await updateMyProfile(user.id, patch);
    setSaving(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("Bu kullanıcı adı alınmış", { description: "Lütfen başka bir ad deneyin." });
      } else {
        toast.error("Profil kaydedilemedi", { description: error.message });
      }
      return;
    }
    await refreshProfile();
    toast.success("Profil güncellendi");
    onSaved?.();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Profil Bilgileri</h3>
        <Field label="Ad Soyad" required value={form.full_name} onChange={set("full_name")} />
        <Field
          label="Kullanıcı Adı"
          required
          value={form.username}
          onChange={set("username")}
          hint="Profil bağlantınızda görünür; benzersiz olmalı."
        />
        <Field label="Ünvan" value={form.title} onChange={set("title")} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Şirket" value={form.company_name} onChange={set("company_name")} />
          <Field label="Konum" value={form.location} onChange={set("location")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Hakkında</Label>
          <Textarea id="bio" rows={4} value={form.bio} onChange={set("bio")} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">İletişim & Uzmanlık</h3>
        <p className="text-xs text-muted-foreground">
          İletişim bilgileriniz müşterilere açıktır (paylaşılan portföy bağlantısında görünür).
        </p>
        <Field label="Telefon" value={form.contact_phone} onChange={set("contact_phone")} />
        <Field
          label="İletişim E-postası"
          value={form.contact_email}
          onChange={set("contact_email")}
        />
        <Field label="WhatsApp" value={form.contact_whatsapp} onChange={set("contact_whatsapp")} />
        <Field
          label="Uzmanlık Bölgeleri"
          value={form.expertise_regions}
          onChange={set("expertise_regions")}
          hint="Virgülle ayırın: Bodrum, Yalıkavak"
        />
        <Field
          label="Uzmanlık Tipleri"
          value={form.expertise_types}
          onChange={set("expertise_types")}
          hint="Virgülle ayırın: Villa, Arsa"
        />
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-gold text-primary-foreground hover:opacity-90"
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-gold"> *</span>}
      </Label>
      <Input value={value} onChange={onChange} />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
