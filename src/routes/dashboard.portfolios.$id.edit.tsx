import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getMyPortfolioFull,
  updatePortfolio,
  uploadImages,
  type PortfolioStatus,
} from "@/lib/data/portfolios";
import { STATUS_LABELS } from "@/lib/portfolio-labels";
import {
  PortfolioFormFields,
  buildTeaserInput,
  buildPrivateInput,
  emptyTeaser,
  emptyPrivate,
  type TeaserFormState,
  type PrivateFormState,
} from "@/components/portfolio/portfolio-form-fields";

export const Route = createFileRoute("/dashboard/portfolios/$id/edit")({
  component: EditPortfolio,
});

const numStr = (n: number | null) => (n == null ? "" : String(n));

function EditPortfolio() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teaser, setTeaser] = useState<TeaserFormState>(emptyTeaser);
  const [priv, setPriv] = useState<PrivateFormState>(emptyPrivate);
  const [status, setStatus] = useState<PortfolioStatus>("draft");
  const [existingImages, setExistingImages] = useState<{ url: string; is_cover: boolean }[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getMyPortfolioFull(id)
      .then((full) => {
        if (!active) return;
        if (!full) {
          setError("not_found");
          setLoading(false);
          return;
        }
        const p = full.portfolio;
        setStatus(p.status);
        setTeaser({
          title: p.title,
          public_description: p.public_description ?? "",
          category: p.category,
          subcategory: p.subcategory ?? "",
          transaction_type: p.transaction_type,
          price: numStr(p.price),
          currency: p.currency,
          city: p.city ?? "",
          district: p.district ?? "",
          neighborhood: p.neighborhood ?? "",
          room_count: p.room_count ?? "",
          gross_m2: numStr(p.gross_m2),
          net_m2: numStr(p.net_m2),
          land_m2: numStr(p.land_m2),
          features: (p.features ?? []).join(", "),
        });
        const m =
          full.private?.malik_info && typeof full.private.malik_info === "object"
            ? (full.private.malik_info as Record<string, unknown>)
            : {};
        setPriv({
          exact_address: full.private?.exact_address ?? "",
          exact_lat: numStr(full.private?.exact_lat ?? null),
          exact_lng: numStr(full.private?.exact_lng ?? null),
          malik_name: typeof m.name === "string" ? m.name : "",
          malik_contact: typeof m.contact === "string" ? m.contact : "",
          private_description: full.private?.private_description ?? "",
          private_notes: full.private?.private_notes ?? "",
        });
        setExistingImages(full.images.map((i) => ({ url: i.url, is_cover: i.is_cover })));
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!teaser.title.trim()) {
      toast.error("Portföy başlığı zorunlu");
      return;
    }
    setSaving(true);
    try {
      await updatePortfolio(id, buildTeaserInput(teaser, status), buildPrivateInput(priv));
      if (files.length) await uploadImages(id, files);
      toast.success("Portföy güncellendi");
      navigate({ to: "/dashboard/portfolios/$id", params: { id } });
    } catch (err) {
      toast.error("Güncellenemedi", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {error === "not_found"
              ? "Portföy bulunamadı veya erişiminiz yok."
              : `Yüklenemedi: ${error}`}
          </p>
          <Button asChild variant="outline" className="mt-4 gap-1.5">
            <Link to="/dashboard/portfolios">
              <ArrowLeft className="size-4" /> Portföylerim
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Portföyü Düzenle"
        breadcrumbs={[{ label: "Portföylerim", to: "/dashboard/portfolios" }, { label: "Düzenle" }]}
        actions={
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Durum</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PortfolioStatus)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([v, label]) => (
                  <SelectItem key={v} value={v}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      <form onSubmit={submit} className="space-y-6">
        <PortfolioFormFields
          teaser={teaser}
          setTeaser={setTeaser}
          priv={priv}
          setPriv={setPriv}
          files={files}
          setFiles={setFiles}
          existingImages={existingImages}
        />
        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/portfolios/$id" params={{ id }}>
              İptal
            </Link>
          </Button>
          <Button
            type="submit"
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            disabled={saving}
          >
            <Save className="size-4" /> {saving ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
