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
import { getMyPortfolioFull, updatePortfolio, type PortfolioStatus } from "@/lib/data/portfolios";
import { STATUS_LABELS } from "@/lib/portfolio-labels";
import { PortfolioMediaManager } from "@/components/portfolio/portfolio-media-manager";
import { StickyActionBar } from "@/components/portfolio/sticky-action-bar";
import {
  PortfolioFormFields,
  buildTeaserInput,
  emptyTeaser,
  emptyAttrs,
  emptyLocation,
  type TeaserFormState,
  type AttrFormState,
  type LocationValue,
} from "@/components/portfolio/portfolio-form-fields";

// Merge public + locked attribute bags into the flat form state (numbers → strings).
function mergeAttrs(pub: unknown, lock: unknown): AttrFormState {
  const out: AttrFormState = {};
  for (const src of [pub, lock]) {
    if (src && typeof src === "object") {
      for (const [k, v] of Object.entries(src as Record<string, unknown>)) {
        out[k] = typeof v === "boolean" ? v : String(v);
      }
    }
  }
  return out;
}

export const Route = createFileRoute("/dashboard/portfolios/$id/edit")({
  component: EditPortfolio,
});

const numStr = (n: number | null) => (n == null ? "" : String(n));

function EditPortfolio() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teaser, setTeaser] = useState<TeaserFormState>(emptyTeaser);
  const [location, setLocation] = useState<LocationValue>(emptyLocation);
  const [attrs, setAttrs] = useState<AttrFormState>(emptyAttrs);
  const [status, setStatus] = useState<PortfolioStatus>("draft");
  const [existingImages, setExistingImages] = useState<{ url: string; is_cover: boolean }[]>([]);
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
          video_url: p.video_url ?? "",
          mode: p.mode,
        });
        // K1 (Faz 2.1): private free fields (adres/malik/notlar/locked-attrs) are no
        // longer edited here — load only the PUBLIC attribute bag.
        setAttrs(mergeAttrs(p.attributes, null));
        // 2.2: location step — exact pin (locked) + teaser precision/radius.
        setLocation({
          lat: full.private?.exact_lat ?? null,
          lng: full.private?.exact_lng ?? null,
          precision: p.location_precision === "exact" ? "exact" : "approx",
          radiusKm: p.approx_radius_km ?? 1,
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
    if (!teaser.city || !teaser.district) {
      toast.error("İl ve ilçe seçin (mahalle opsiyonel).");
      return;
    }
    setSaving(true);
    try {
      // 2.2: precision/radius → teaser; exact pin → portfolio_private (only when set, so
      // legacy private data is never nulled — D13). attrs is public-only.
      const teaserInput = {
        ...buildTeaserInput(teaser, status),
        location_precision: location.precision,
        approx_radius_km: location.precision === "approx" ? location.radiusKm : null,
      };
      const priv =
        location.lat != null && location.lng != null
          ? { exact_lat: location.lat, exact_lng: location.lng }
          : undefined;
      await updatePortfolio(id, teaserInput, priv, attrs);
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
      {/* The form fields + media both live ABOVE the action bar so the sticky bar's
          containing block spans the whole page → it stays bottom-pinned through the
          entire form AND the media section (it used to scroll away past the form). */}
      <form id="portfolio-edit-form" onSubmit={submit} className="space-y-6">
        <PortfolioFormFields
          teaser={teaser}
          setTeaser={setTeaser}
          location={location}
          setLocation={setLocation}
          attrs={attrs}
          setAttrs={setAttrs}
          existingImages={existingImages}
          hideImages
        />
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Medya</h2>
        <PortfolioMediaManager portfolioId={id} />
      </div>

      <StickyActionBar>
        <Button asChild variant="outline">
          <Link to="/dashboard/portfolios/$id" params={{ id }}>
            İptal
          </Link>
        </Button>
        <Button
          type="submit"
          form="portfolio-edit-form"
          className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          disabled={saving || !teaser.city || !teaser.district}
          title={!teaser.city || !teaser.district ? "İl ve ilçe seçin" : undefined}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </StickyActionBar>
    </PageContainer>
  );
}
