import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save, Rocket, ShieldCheck, MapPin, ImagePlus, Lock, X } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth/auth-context";
import {
  createPortfolio,
  type PortfolioCategory,
  type TransactionType,
  type Currency,
} from "@/lib/data/portfolios";
import { CATEGORY_LABELS, TRANSACTION_LABELS, CURRENCY_OPTIONS } from "@/lib/portfolio-labels";

export const Route = createFileRoute("/dashboard/portfolios/new")({
  component: NewPortfolio,
});

const toNum = (s: string): number | null => (s.trim() === "" ? null : Number(s));
const toList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

function NewPortfolio() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [t, setT] = useState({
    title: "",
    public_description: "",
    category: "konut" as PortfolioCategory,
    subcategory: "",
    transaction_type: "satilik" as TransactionType,
    price: "",
    currency: "TRY" as Currency,
    city: "",
    district: "",
    neighborhood: "",
    room_count: "",
    gross_m2: "",
    net_m2: "",
    land_m2: "",
    features: "",
  });
  const [pv, setPv] = useState({
    exact_address: "",
    exact_lat: "",
    exact_lng: "",
    malik_name: "",
    malik_contact: "",
    private_description: "",
    private_notes: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const setField = (k: keyof typeof t) => (v: string) => setT((p) => ({ ...p, [k]: v }));
  const setPriv = (k: keyof typeof pv) => (v: string) => setPv((p) => ({ ...p, [k]: v }));

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 20));
  }

  async function submit(e: FormEvent, status: "draft" | "active") {
    e.preventDefault();
    if (!user) return;
    if (!t.title.trim()) {
      toast.error("Portföy başlığı zorunlu");
      return;
    }
    setSaving(true);
    const malik =
      t && (pv.malik_name.trim() || pv.malik_contact.trim())
        ? { name: pv.malik_name.trim() || null, contact: pv.malik_contact.trim() || null }
        : null;
    try {
      const { id } = await createPortfolio(
        user.id,
        {
          title: t.title.trim(),
          public_description: t.public_description.trim() || null,
          category: t.category,
          subcategory: t.subcategory.trim() || null,
          transaction_type: t.transaction_type,
          price: toNum(t.price),
          currency: t.currency,
          city: t.city.trim() || null,
          district: t.district.trim() || null,
          neighborhood: t.neighborhood.trim() || null,
          room_count: t.room_count.trim() || null,
          gross_m2: toNum(t.gross_m2),
          net_m2: toNum(t.net_m2),
          land_m2: toNum(t.land_m2),
          features: toList(t.features),
          status,
        },
        {
          exact_address: pv.exact_address.trim() || null,
          exact_lat: toNum(pv.exact_lat),
          exact_lng: toNum(pv.exact_lng),
          malik_info: malik,
          private_description: pv.private_description.trim() || null,
          private_notes: pv.private_notes.trim() || null,
        },
        files,
      );
      toast.success(status === "active" ? "Portföy yayınlandı" : "Taslak kaydedildi");
      navigate({ to: "/dashboard/portfolios/$id", params: { id } });
    } catch (err) {
      toast.error("Portföy oluşturulamadı", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Yeni Portföy Ekle"
        breadcrumbs={[
          { label: "Portföylerim", to: "/dashboard/portfolios" },
          { label: "Yeni Portföy Ekle" },
        ]}
      />

      <form onSubmit={(e) => submit(e, "active")} className="space-y-6">
        {/* Temel bilgiler */}
        <SurfaceCard className="space-y-4">
          <SectionTitle icon={ShieldCheck} title="Temel Bilgiler" />
          <Field label="Portföy Başlığı" required>
            <Input value={t.title} onChange={(e) => setField("title")(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Kategori">
              <Select value={t.category} onValueChange={(v) => setField("category")(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Alt Kategori">
              <Input
                value={t.subcategory}
                onChange={(e) => setField("subcategory")(e.target.value)}
                placeholder="Villa, Daire…"
              />
            </Field>
            <Field label="İşlem Tipi">
              <Select
                value={t.transaction_type}
                onValueChange={(v) => setField("transaction_type")(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRANSACTION_LABELS).map(([v, label]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Kısa Açıklama (herkese açık)">
            <Textarea
              rows={3}
              value={t.public_description}
              onChange={(e) => setField("public_description")(e.target.value)}
            />
          </Field>
        </SurfaceCard>

        {/* Konum & fiyat */}
        <SurfaceCard className="space-y-4">
          <SectionTitle icon={MapPin} title="Konum & Fiyat" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Şehir">
              <Input value={t.city} onChange={(e) => setField("city")(e.target.value)} />
            </Field>
            <Field label="İlçe">
              <Input value={t.district} onChange={(e) => setField("district")(e.target.value)} />
            </Field>
            <Field label="Mahalle">
              <Input
                value={t.neighborhood}
                onChange={(e) => setField("neighborhood")(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fiyat">
              <Input
                type="number"
                value={t.price}
                onChange={(e) => setField("price")(e.target.value)}
              />
            </Field>
            <Field label="Para Birimi">
              <Select value={t.currency} onValueChange={(v) => setField("currency")(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </SurfaceCard>

        {/* Detaylar */}
        <SurfaceCard className="space-y-4">
          <SectionTitle icon={ShieldCheck} title="Detaylar" />
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Oda (5+1)">
              <Input
                value={t.room_count}
                onChange={(e) => setField("room_count")(e.target.value)}
              />
            </Field>
            <Field label="Brüt m²">
              <Input
                type="number"
                value={t.gross_m2}
                onChange={(e) => setField("gross_m2")(e.target.value)}
              />
            </Field>
            <Field label="Net m²">
              <Input
                type="number"
                value={t.net_m2}
                onChange={(e) => setField("net_m2")(e.target.value)}
              />
            </Field>
            <Field label="Arsa m²">
              <Input
                type="number"
                value={t.land_m2}
                onChange={(e) => setField("land_m2")(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Özellikler (virgülle)">
            <Input
              value={t.features}
              onChange={(e) => setField("features")(e.target.value)}
              placeholder="Havuz, Deniz manzarası, Otopark"
            />
          </Field>
        </SurfaceCard>

        {/* Görseller */}
        <SurfaceCard className="space-y-4">
          <SectionTitle icon={ImagePlus} title="Görseller (ilk görsel kapak olur)" />
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-6 py-8 text-center hover:border-gold/40">
            <ImagePlus className="size-7 text-gold" />
            <span className="mt-2 text-sm font-medium text-foreground">Fotoğraf seç</span>
            <span className="text-xs text-muted-foreground">JPG/PNG · maks. 20</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {files.map((f, i) => (
                <div
                  key={i}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg border ${i === 0 ? "border-gold" : "border-border"}`}
                >
                  <img src={URL.createObjectURL(f)} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      Kapak
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>

        {/* Kilitli bilgiler (D20) — yalnızca sahibe + onaylı erişime görünür */}
        <SurfaceCard className="space-y-4 border-gold/25">
          <SectionTitle icon={Lock} title="Kilitli Bilgiler" />
          <p className="-mt-2 flex items-center gap-1.5 text-xs text-gold">
            <Lock className="size-3.5" /> Bu alanlar teaser'da GÖRÜNMEZ; yalnızca size ve erişim
            onayladığınız emlakçılara açılır. Tam koordinattan ~yaklaşık harita pini otomatik
            üretilir.
          </p>
          <Field label="Tam Adres">
            <Input
              value={pv.exact_address}
              onChange={(e) => setPriv("exact_address")(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tam Enlem (lat)">
              <Input
                type="number"
                value={pv.exact_lat}
                onChange={(e) => setPriv("exact_lat")(e.target.value)}
                placeholder="37.1234"
              />
            </Field>
            <Field label="Tam Boylam (lng)">
              <Input
                type="number"
                value={pv.exact_lng}
                onChange={(e) => setPriv("exact_lng")(e.target.value)}
                placeholder="27.4321"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Malik Adı">
              <Input
                value={pv.malik_name}
                onChange={(e) => setPriv("malik_name")(e.target.value)}
              />
            </Field>
            <Field label="Malik İletişim">
              <Input
                value={pv.malik_contact}
                onChange={(e) => setPriv("malik_contact")(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Özel Açıklama">
            <Textarea
              rows={3}
              value={pv.private_description}
              onChange={(e) => setPriv("private_description")(e.target.value)}
            />
          </Field>
          <Field label="Özel Notlar">
            <Textarea
              rows={2}
              value={pv.private_notes}
              onChange={(e) => setPriv("private_notes")(e.target.value)}
            />
          </Field>
        </SurfaceCard>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={saving}
            onClick={(e) => submit(e, "draft")}
          >
            <Save className="size-4" /> Taslak Kaydet
          </Button>
          <Button
            type="submit"
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            disabled={saving}
          >
            <Rocket className="size-4" /> {saving ? "Kaydediliyor…" : "Yayınla"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Lock; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-gold" />
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-gold"> *</span>}
      </Label>
      {children}
    </div>
  );
}
