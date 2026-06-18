import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save, Rocket } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { createPortfolio } from "@/lib/data/portfolios";
import {
  PortfolioFormFields,
  buildTeaserInput,
  buildPrivateInput,
  emptyTeaser,
  emptyPrivate,
  emptyAttrs,
} from "@/components/portfolio/portfolio-form-fields";

export const Route = createFileRoute("/dashboard/portfolios/new")({
  component: NewPortfolio,
});

function NewPortfolio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teaser, setTeaser] = useState(emptyTeaser);
  const [priv, setPriv] = useState(emptyPrivate);
  const [attrs, setAttrs] = useState(emptyAttrs);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent, status: "draft" | "active") {
    e.preventDefault();
    if (!user) return;
    if (!teaser.title.trim()) {
      toast.error("Portföy başlığı zorunlu");
      return;
    }
    setSaving(true);
    try {
      const { id } = await createPortfolio(
        user.id,
        buildTeaserInput(teaser, status),
        buildPrivateInput(priv),
        files,
        attrs,
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
        <PortfolioFormFields
          teaser={teaser}
          setTeaser={setTeaser}
          priv={priv}
          setPriv={setPriv}
          files={files}
          setFiles={setFiles}
          attrs={attrs}
          setAttrs={setAttrs}
        />
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
