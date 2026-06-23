import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save, Rocket, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { createPortfolio, type PendingImage } from "@/lib/data/portfolios";
import {
  PortfolioFormFields,
  buildTeaserInput,
  emptyTeaser,
  emptyAttrs,
  emptyLocation,
  type LocationValue,
} from "@/components/portfolio/portfolio-form-fields";
import { StickyActionBar } from "@/components/portfolio/sticky-action-bar";

export const Route = createFileRoute("/dashboard/portfolios/new")({
  component: NewPortfolio,
});

function NewPortfolio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teaser, setTeaser] = useState(emptyTeaser);
  const [location, setLocation] = useState<LocationValue>(emptyLocation);
  const [attrs, setAttrs] = useState(emptyAttrs);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [saving, setSaving] = useState<null | "draft" | "active">(null);

  async function submit(e: FormEvent, status: "draft" | "active") {
    e.preventDefault();
    if (!user) return;
    if (!teaser.title.trim()) {
      toast.error("Portföy başlığı zorunlu");
      return;
    }
    // İl + ilçe required to publish (region drives map / Bölgeler / Keşfet / eşleşme).
    if (status === "active" && (!teaser.city || !teaser.district)) {
      toast.error("Yayınlamak için il ve ilçe seçin (mahalle opsiyonel).");
      return;
    }
    setSaving(status);
    try {
      // 2.2: precision/radius → teaser; exact pin → portfolio_private (locked). Only
      // create the private row when a pin was actually placed.
      const teaserInput = {
        ...buildTeaserInput(teaser, status),
        location_precision: location.precision,
        approx_radius_km: location.precision === "approx" ? location.radiusKm : null,
      };
      const priv =
        location.lat != null && location.lng != null
          ? { exact_lat: location.lat, exact_lng: location.lng }
          : {};
      const { id, images: imgRes } = await createPortfolio(
        user.id,
        teaserInput,
        priv,
        images,
        attrs,
      );
      toast.success(status === "active" ? "Portföy yayınlandı" : "Taslak kaydedildi");
      if (imgRes.failed.length > 0) {
        toast.warning(`${imgRes.failed.length} görsel yüklenemedi`, {
          description: `Portföy kaydedildi. Düzenle'den tekrar yükleyebilirsiniz: ${imgRes.failed
            .map((f) => f.name)
            .join(", ")}`,
        });
      }
      navigate({ to: "/dashboard/portfolios/$id", params: { id } });
    } catch (err) {
      toast.error("Portföy oluşturulamadı", {
        description: err instanceof Error ? err.message : String(err),
      });
      setSaving(null);
    }
  }

  const busy = saving !== null;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Yeni Portföy Ekle"
        breadcrumbs={[
          { label: "Portföylerim", to: "/dashboard/portfolios" },
          { label: "Yeni Portföy Ekle" },
        ]}
      />
      {/* Enter must NOT auto-publish: implicit submit is a no-op; "Yayınla" and
          "Taslak Kaydet" are explicit buttons so the saved status matches intent. */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <PortfolioFormFields
          teaser={teaser}
          setTeaser={setTeaser}
          location={location}
          setLocation={setLocation}
          images={images}
          setImages={setImages}
          attrs={attrs}
          setAttrs={setAttrs}
        />
        <StickyActionBar>
          {busy && images.length > 1 && (
            <span className="mr-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-gold" /> {images.length} görsel
              yükleniyor…
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={busy}
            onClick={(e) => submit(e, "draft")}
          >
            {saving === "draft" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Taslak Kaydet
          </Button>
          <Button
            type="button"
            onClick={(e) => submit(e, "active")}
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            disabled={busy || !teaser.city || !teaser.district}
            title={
              !teaser.city || !teaser.district ? "Yayınlamak için il ve ilçe seçin" : undefined
            }
          >
            {saving === "active" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Rocket className="size-4" />
            )}
            {saving === "active" ? "Yayınlanıyor…" : "Yayınla"}
          </Button>
        </StickyActionBar>
      </form>
    </PageContainer>
  );
}
