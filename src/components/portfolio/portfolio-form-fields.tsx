import { useState, type ReactNode } from "react";
import {
  ShieldCheck,
  MapPin,
  ImagePlus,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { SurfaceCard } from "@/components/vault/cards";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { attributesForCategory, ROOM_COUNTS, type AttributeDef } from "@/lib/portfolio-attributes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRANSACTION_LABELS } from "@/lib/portfolio-labels";
import { RegionSelect } from "@/components/geo/region-select";
import { CategorySelect } from "@/components/portfolio/category-select";
import { FeatureMultiSelect } from "@/components/portfolio/feature-multi-select";
import { PriceInput } from "@/components/ui/price-input";
import { MultiSelect } from "@/components/ui/multi-select";
import { LocationPicker, type LocationValue } from "@/components/portfolio/location-picker";
import type {
  PortfolioCategory,
  TransactionType,
  Currency,
  PortfolioTeaserInput,
  PortfolioPrivateInput,
  PortfolioStatus,
  PortfolioMode,
  PendingImage,
  PendingDoc,
  DocumentKind,
} from "@/lib/data/portfolios";
import { DOCUMENT_KIND_LABELS } from "@/lib/portfolio-labels";
import type { Json } from "@/lib/database.types";

// Belge tipi seçim sırası (Kat Planı birincil; Tapu default değil). Labels canonical.
const DOC_KIND_ORDER: DocumentKind[] = [
  "kat_plani",
  "ruhsat",
  "imar_plani",
  "proje",
  "tapu",
  "pdf",
  "diger",
];

// Form state is all-strings (controlled inputs); converted on submit.
export type TeaserFormState = {
  title: string;
  public_description: string;
  category: PortfolioCategory;
  subcategory: string;
  transaction_type: TransactionType;
  price: string;
  currency: Currency;
  city: string;
  district: string;
  neighborhood: string;
  room_count: string;
  gross_m2: string;
  net_m2: string;
  land_m2: string;
  features: string;
  video_url: string;
  mode: PortfolioMode;
};

export type PrivateFormState = {
  exact_address: string;
  exact_lat: string;
  exact_lng: string;
  malik_name: string;
  malik_contact: string;
  private_description: string;
  private_notes: string;
};

export const emptyTeaser: TeaserFormState = {
  title: "",
  public_description: "",
  category: "konut",
  subcategory: "",
  transaction_type: "satilik",
  price: "",
  currency: "TRY",
  city: "",
  district: "",
  neighborhood: "",
  room_count: "",
  gross_m2: "",
  net_m2: "",
  land_m2: "",
  features: "",
  video_url: "",
  mode: "controlled",
};

export const emptyPrivate: PrivateFormState = {
  exact_address: "",
  exact_lat: "",
  exact_lng: "",
  malik_name: "",
  malik_contact: "",
  private_description: "",
  private_notes: "",
};

// Flat attribute form state keyed by registry key (D33). Split on submit.
export type AttrFormState = Record<string, string | boolean>;
export const emptyAttrs: AttrFormState = {};

// Faz 2.2 location step state (exact pin → portfolio_private; precision/radius → teaser).
export type { LocationValue };
export const emptyLocation: LocationValue = {
  lat: null,
  lng: null,
  precision: "approx",
  radiusKm: 1,
};

const toNum = (s: string): number | null => (s.trim() === "" ? null : Number(s));
const toList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/** Convert form state → typed teaser input for create/update. */
export function buildTeaserInput(
  t: TeaserFormState,
  status: PortfolioStatus,
): PortfolioTeaserInput {
  return {
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
    video_url: t.video_url.trim() || null,
    status,
    mode: t.mode,
  };
}

export function buildPrivateInput(pv: PrivateFormState): PortfolioPrivateInput {
  const malik =
    pv.malik_name.trim() || pv.malik_contact.trim()
      ? ({ name: pv.malik_name.trim() || null, contact: pv.malik_contact.trim() || null } as Json)
      : null;
  return {
    exact_address: pv.exact_address.trim() || null,
    exact_lat: toNum(pv.exact_lat),
    exact_lng: toNum(pv.exact_lng),
    malik_info: malik,
    private_description: pv.private_description.trim() || null,
    private_notes: pv.private_notes.trim() || null,
  };
}

/**
 * Shared portfolio form fields (create + edit). Presentational: parent owns
 * state + submit/actions. Locked section maps to portfolio_private (D20).
 */
export function PortfolioFormFields({
  teaser,
  setTeaser,
  location = emptyLocation,
  setLocation = () => {},
  images = [],
  setImages = () => {},
  docs = [],
  setDocs = () => {},
  attrs,
  setAttrs,
  existingImages = [],
  hideImages = false,
}: {
  teaser: TeaserFormState;
  setTeaser: (t: TeaserFormState) => void;
  location?: LocationValue;
  setLocation?: (l: LocationValue) => void;
  images?: PendingImage[];
  setImages?: (i: PendingImage[]) => void;
  /** Create-wizard pending documents (edit uses the full media manager instead). */
  docs?: PendingDoc[];
  setDocs?: (d: PendingDoc[]) => void;
  attrs: AttrFormState;
  setAttrs: (a: AttrFormState) => void;
  existingImages?: { url: string; is_cover: boolean }[];
  /** Hide the inline image upload card (edit uses the full media manager instead). */
  hideImages?: boolean;
}) {
  const sf = (k: keyof TeaserFormState) => (v: string) => setTeaser({ ...teaser, [k]: v });
  const setAttr = (k: string, v: string | boolean) => setAttrs({ ...attrs, [k]: v });
  const [docKind, setDocKind] = useState<DocumentKind>("kat_plani");

  const callOnly = teaser.mode === "call_only";

  // Only the selected category's PUBLIC standard fields (Detaylar). K1 (Faz 2.1):
  // the locked model is konum/fotolar/belgeler — there are NO locked attribute fields,
  // so the old "Kilitli Bilgiler" form card is gone.
  const catPublicAttrs = attributesForCategory(teaser.category).filter(
    (a) => a.visibility === "public",
  );

  // 3F: inline pending-photo management (order / cover / visibility / delete).
  const moveImage = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    setImages(next);
  };
  const setCover = (i: number) => setImages(images.map((it, j) => ({ ...it, isCover: j === i })));
  const toggleVisibility = (i: number) =>
    setImages(
      images.map((it, j) => {
        if (j !== i) return it;
        const nv = it.visibility === "locked" ? "public" : "locked";
        return { ...it, visibility: nv, isCover: nv === "public" ? it.isCover : false };
      }),
    );

  return (
    <>
      <SurfaceCard className="space-y-4">
        <SectionTitle icon={ShieldCheck} title="Temel Bilgiler" />
        <Field label="Portföy Başlığı" required>
          <Input value={teaser.title} onChange={(e) => sf("title")(e.target.value)} />
        </Field>
        {/* 2.3: Kategori + dependent Alt Kategori → canonical CategorySelect (1.2). */}
        <CategorySelect
          value={{ category: teaser.category, subcategory: teaser.subcategory || null }}
          onChange={(v) =>
            setTeaser({ ...teaser, category: v.category, subcategory: v.subcategory ?? "" })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="İşlem Tipi">
            <Select value={teaser.transaction_type} onValueChange={sf("transaction_type")}>
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
            value={teaser.public_description}
            onChange={(e) => sf("public_description")(e.target.value)}
          />
        </Field>
        {/* 2.4: video ekleme (opsiyonel public link). */}
        <Field label="Video Bağlantısı (YouTube/Vimeo — opsiyonel)">
          <Input
            value={teaser.video_url}
            onChange={(e) => sf("video_url")(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
          />
        </Field>
      </SurfaceCard>

      {/* Portföy modu (D36) */}
      <SurfaceCard className="space-y-3">
        <SectionTitle icon={ShieldCheck} title="Portföy Modu" />
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeOption
            active={!callOnly}
            onClick={() => sf("mode")("controlled")}
            title="Kontrollü Paylaşım"
            desc="Konum, fotoğraflar ve belgeler alan bazında kilitlenebilir + Detay Talebi akışı. Diğer emlakçılar onay alarak erişir."
          />
          <ModeOption
            active={callOnly}
            onClick={() => sf("mode")("call_only")}
            title="Kapalı Portföy — sadece ara"
            desc="Kilitli alan yok. Teaser'da 'detaylar için arayın' + telefonunuz görünür; Detay Talebi akışı kapalı."
          />
        </div>
        {!callOnly && (
          <p className="text-xs text-muted-foreground">
            İpucu: konum, fotoğraf veya belge kilitlemeyecekseniz “Kapalı Portföy” modunu
            seçebilirsiniz.
          </p>
        )}
      </SurfaceCard>

      <SurfaceCard className="space-y-4">
        <SectionTitle icon={MapPin} title="Konum & Fiyat" />
        <RegionSelect
          value={{
            city: teaser.city || null,
            district: teaser.district || null,
            neighborhood: teaser.neighborhood || null,
          }}
          onChange={(v) =>
            setTeaser({
              ...teaser,
              city: v.city ?? "",
              district: v.district ?? "",
              neighborhood: v.neighborhood ?? "",
            })
          }
        />
        {/* 2.2: harita pini + tam/yaklaşık + çap. Exact koordinat portfolio_private'a
            gider (kilitli); teaser yalnızca approx pin/çapı görür (D30). */}
        {!callOnly && (
          <div className="space-y-1.5">
            <Label>Harita Konumu</Label>
            <LocationPicker value={location} onChange={setLocation} />
          </div>
        )}
        {/* 2.3: Fiyat + para birimi → PriceInput (1.5) with thousand separators. */}
        <Field label="Fiyat">
          <PriceInput
            value={teaser.price === "" ? null : Number(teaser.price)}
            onChange={(n) => sf("price")(n == null ? "" : String(n))}
            currency={teaser.currency}
            onCurrencyChange={(c) => sf("currency")(c)}
          />
        </Field>
      </SurfaceCard>

      <SurfaceCard className="space-y-4">
        <SectionTitle icon={ShieldCheck} title="Detaylar" />
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Oda Sayısı" required>
            <Select value={teaser.room_count} onValueChange={sf("room_count")}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_COUNTS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Brüt m²">
            <Input
              type="number"
              value={teaser.gross_m2}
              onChange={(e) => sf("gross_m2")(e.target.value)}
            />
          </Field>
          <Field label="Net m²">
            <Input
              type="number"
              value={teaser.net_m2}
              onChange={(e) => sf("net_m2")(e.target.value)}
            />
          </Field>
          <Field label="Arsa m²">
            <Input
              type="number"
              value={teaser.land_m2}
              onChange={(e) => sf("land_m2")(e.target.value)}
            />
          </Field>
        </div>
        {/* 2.3: "virgülle yaz" yerine gruplu çoktan-seçmeli (1.4). */}
        <Field label="Özellikler">
          <FeatureMultiSelect
            value={
              teaser.features
                ? teaser.features
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : []
            }
            onChange={(arr) => sf("features")(arr.join(","))}
          />
        </Field>
        <AttrGrid defs={catPublicAttrs} attrs={attrs} onChange={setAttr} />
      </SurfaceCard>

      {!hideImages && (
        <SurfaceCard className="space-y-4">
          <SectionTitle icon={ImagePlus} title="Görseller (ilk görsel kapak olur)" />
          {existingImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {existingImages.map((img, i) => (
                <div
                  key={i}
                  className={`relative aspect-[4/3] overflow-hidden rounded-lg border ${img.is_cover ? "border-gold" : "border-border"}`}
                >
                  <img src={img.url} alt="" className="size-full object-cover" />
                  {img.is_cover && (
                    <span className="absolute bottom-1 left-1 rounded bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      Kapak
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/40 bg-gold/[0.04] px-6 py-10 text-center transition-colors hover:border-gold hover:bg-gold/[0.07]">
            <span className="flex size-12 items-center justify-center rounded-full bg-gold/10 ring-1 ring-inset ring-gold/25 transition-colors group-hover:bg-gold/20">
              <ImagePlus className="size-6 text-gold" />
            </span>
            <span className="text-sm font-medium text-foreground">
              {existingImages.length > 0 ? "Yeni fotoğraf ekle" : "Fotoğraf seç"}
            </span>
            <span className="text-xs text-muted-foreground">JPG/PNG · maks. 20</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files)
                  setImages(
                    [
                      ...images,
                      ...Array.from(e.target.files).map((file) => ({
                        file,
                        visibility: "public" as const,
                      })),
                    ].slice(0, 20),
                  );
              }}
            />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((item, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt=""
                    className="size-full object-cover"
                  />
                  {/* cover badge (public only) */}
                  {item.isCover && item.visibility === "public" && (
                    <span className="absolute left-1 top-1 rounded bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      Kapak
                    </span>
                  )}
                  <button
                    type="button"
                    title="Sil"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                  {/* control bar: reorder · cover · visibility */}
                  <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
                    <div className="flex gap-0.5">
                      <TileBtn title="Geri al" disabled={i === 0} onClick={() => moveImage(i, -1)}>
                        <ChevronLeft className="size-3" />
                      </TileBtn>
                      <TileBtn
                        title="İleri al"
                        disabled={i === images.length - 1}
                        onClick={() => moveImage(i, 1)}
                      >
                        <ChevronRight className="size-3" />
                      </TileBtn>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {!callOnly && item.visibility === "public" && !item.isCover && (
                        <TileBtn title="Kapak yap" onClick={() => setCover(i)}>
                          <Star className="size-3" />
                        </TileBtn>
                      )}
                      {!callOnly && (
                        <button
                          type="button"
                          onClick={() => toggleVisibility(i)}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${item.visibility === "locked" ? "bg-gold/30 text-gold" : "bg-background/80 text-muted-foreground"}`}
                        >
                          {item.visibility === "locked" ? "Kilitli" : "Açık"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      )}

      {/* 2.4: Belgeler oluştur ekranında da görünür (oluştur=düzenle). Pending docs
          portföy oluştuktan sonra yüklenir; belge TİPİ teaser'da görünür, içerik
          talep+onayla açılır. call_only modda kilit yok → gizli. */}
      {!hideImages && !callOnly && (
        <SurfaceCard className="space-y-4 border-gold/25">
          <SectionTitle icon={FileText} title="Belgeler (kilitli)" />
          <p className="-mt-2 text-xs text-muted-foreground">
            Belge TİPİ teaser'da görünür (“Kilitli: Kat Planı”); içerik talep + onayla açılır.
          </p>
          {docs.length > 0 && (
            <ul className="space-y-2">
              {docs.map((d, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-secondary-foreground">
                    <FileText className="size-4 text-gold" />
                    {DOCUMENT_KIND_LABELS[d.kind]} · {d.file.name}
                  </span>
                  <button
                    type="button"
                    title="Kaldır"
                    onClick={() => setDocs(docs.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Select value={docKind} onValueChange={(v) => setDocKind(v as DocumentKind)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_KIND_ORDER.map((k) => (
                  <SelectItem key={k} value={k}>
                    {DOCUMENT_KIND_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gold/40 px-3 py-1.5 text-sm text-gold hover:bg-gold/10">
              <FileText className="size-4" /> Belge ekle
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setDocs([...docs, { file: f, kind: docKind }]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </SurfaceCard>
      )}
    </>
  );
}

function TileBtn({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex size-5 items-center justify-center rounded bg-background/80 text-foreground disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ModeOption({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-colors ${active ? "border-gold/60 bg-gold/[0.06]" : "border-border bg-surface-2 hover:border-border-strong"}`}
    >
      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <span
          className={`flex size-4 items-center justify-center rounded-full border ${active ? "border-gold bg-gold" : "border-border-strong"}`}
        >
          {active && <span className="size-1.5 rounded-full bg-primary-foreground" />}
        </span>
        {title}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}

function AttrGrid({
  defs,
  attrs,
  onChange,
}: {
  defs: AttributeDef[];
  attrs: AttrFormState;
  onChange: (key: string, value: string | boolean) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {defs.map((def) => (
        <div key={def.key} className="space-y-1.5">
          <Label>{def.label}</Label>
          <AttrInput def={def} value={attrs[def.key]} onChange={(v) => onChange(def.key, v)} />
        </div>
      ))}
    </div>
  );
}

function AttrInput({
  def,
  value,
  onChange,
}: {
  def: AttributeDef;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}) {
  if (def.type === "boolean") {
    return (
      <div className="flex h-9 items-center">
        <Switch checked={value === true} onCheckedChange={onChange} />
      </div>
    );
  }
  if (def.type === "select") {
    return (
      <Select value={typeof value === "string" ? value : ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seçin" />
        </SelectTrigger>
        <SelectContent>
          {def.options?.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (def.type === "multiselect") {
    // 2.3: canonical MultiSelect honors def.maxSelect (Cephe → 3). Stored as a
    // comma-joined string in the flat attr bag.
    const selected = typeof value === "string" && value ? value.split(",") : [];
    return (
      <MultiSelect
        options={def.options ?? []}
        value={selected}
        onChange={(arr) => onChange(arr.join(","))}
        maxSelect={def.maxSelect}
      />
    );
  }
  return (
    <Input
      type={def.type === "number" ? "number" : "text"}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof ShieldCheck; title: string }) {
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
