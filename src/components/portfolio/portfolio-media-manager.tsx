import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Star,
  Trash2,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ImagePlus,
  FileText,
  Download,
  UploadCloud,
} from "lucide-react";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMyPortfolioFull,
  uploadImages,
  deletePortfolioImage,
  setCoverImage,
  reorderImages,
  setImageVisibility,
  uploadDocument,
  documentSignedUrl,
  deletePortfolioDocument,
  type PortfolioFull,
  type ImageVisibility,
  type DocumentKind,
} from "@/lib/data/portfolios";

const DOC_KINDS: { value: DocumentKind; label: string }[] = [
  { value: "tapu", label: "Tapu" },
  { value: "ruhsat", label: "Ruhsat" },
  { value: "imar_plani", label: "İmar Planı" },
  { value: "proje", label: "Proje" },
  { value: "pdf", label: "PDF" },
  { value: "diger", label: "Diğer" },
];

/**
 * Owner media manager (D34): images (delete / reorder / cover / public↔locked
 * visibility) + documents (upload / signed-URL download / delete). Self-fetches
 * the owner-full media and reloads after each mutation.
 */
export function PortfolioMediaManager({ portfolioId }: { portfolioId: string }) {
  const [full, setFull] = useState<PortfolioFull | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadVisibility, setUploadVisibility] = useState<ImageVisibility>("public");
  const [docKind, setDocKind] = useState<DocumentKind>("tapu");

  const reload = useCallback(async () => {
    const d = await getMyPortfolioFull(portfolioId);
    setFull(d);
  }, [portfolioId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const run = async (fn: () => Promise<void>, okMsg?: string) => {
    setBusy(true);
    try {
      await fn();
      await reload();
      if (okMsg) toast.success(okMsg);
    } catch (e) {
      toast.error("İşlem başarısız", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  if (!full) {
    return (
      <SurfaceCard className="flex items-center justify-center py-10">
        <Loader2 className="size-5 animate-spin text-gold" />
      </SurfaceCard>
    );
  }

  const images = full.images;

  const move = (index: number, dir: -1 | 1) => {
    const next = [...images];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    void run(
      () => reorderImages(next.map((img, i) => ({ id: img.id, sort_order: i }))),
      "Sıralama güncellendi",
    );
  };

  return (
    <div className="space-y-6">
      {/* Images */}
      <SurfaceCard className="space-y-4">
        <div className="flex items-center gap-2">
          <ImagePlus className="size-4 text-gold" />
          <h2 className="font-display text-lg font-semibold text-foreground">Görsel Yönetimi</h2>
        </div>

        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz görsel yok.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img, i) => (
              <div key={img.id} className="overflow-hidden rounded-lg border border-border">
                <div className="relative aspect-[4/3] bg-surface-2">
                  <img src={img.url} alt="" className="size-full object-cover" />
                  <div className="absolute left-1 top-1 flex gap-1">
                    {img.is_cover && (
                      <span className="rounded bg-gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        Kapak
                      </span>
                    )}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${img.visibility === "locked" ? "bg-gold/20 text-gold" : "bg-background/80 text-muted-foreground"}`}
                    >
                      {img.visibility === "locked" ? "Kilitli" : "Açık"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 p-1.5">
                  <IconBtn title="Yukarı" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="size-3.5" />
                  </IconBtn>
                  <IconBtn
                    title="Aşağı"
                    disabled={busy || i === images.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="size-3.5" />
                  </IconBtn>
                  {img.visibility === "public" && !img.is_cover && (
                    <IconBtn
                      title="Kapak yap"
                      disabled={busy}
                      onClick={() =>
                        run(() => setCoverImage(portfolioId, img.id), "Kapak güncellendi")
                      }
                    >
                      <Star className="size-3.5" />
                    </IconBtn>
                  )}
                  <IconBtn
                    title={img.visibility === "locked" ? "Herkese aç" : "Kilitle"}
                    disabled={busy}
                    onClick={() =>
                      run(
                        () =>
                          setImageVisibility(
                            img,
                            img.visibility === "locked" ? "public" : "locked",
                          ),
                        "Görünürlük güncellendi",
                      )
                    }
                  >
                    {img.visibility === "locked" ? (
                      <Unlock className="size-3.5" />
                    ) : (
                      <Lock className="size-3.5" />
                    )}
                  </IconBtn>
                  <IconBtn
                    title="Sil"
                    disabled={busy}
                    onClick={() => run(() => deletePortfolioImage(img), "Görsel silindi")}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Select
            value={uploadVisibility}
            onValueChange={(v) => setUploadVisibility(v as ImageVisibility)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Açık (teaser)</SelectItem>
              <SelectItem value="locked">Kilitli</SelectItem>
            </SelectContent>
          </Select>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gold/40 px-3 py-1.5 text-sm text-gold hover:bg-gold/10">
            <UploadCloud className="size-4" /> Görsel yükle
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                if (files.length)
                  run(
                    () => uploadImages(portfolioId, files, uploadVisibility),
                    "Görseller yüklendi",
                  );
              }}
            />
          </label>
        </div>
      </SurfaceCard>

      {/* Documents */}
      <SurfaceCard className="space-y-4 border-gold/25">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-gold" />
          <h2 className="font-display text-lg font-semibold text-foreground">Belgeler (kilitli)</h2>
        </div>
        {full.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belge yok.</p>
        ) : (
          <ul className="space-y-2">
            {full.documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm text-secondary-foreground">
                  <FileText className="size-4 text-gold" />
                  {DOC_KINDS.find((k) => k.value === d.kind)?.label ?? d.kind}
                </span>
                <div className="flex items-center gap-1">
                  <IconBtn
                    title="İndir"
                    disabled={busy}
                    onClick={async () => {
                      const url = await documentSignedUrl(d.path);
                      if (url) window.open(url, "_blank");
                      else toast.error("İndirme bağlantısı oluşturulamadı (erişim yok)");
                    }}
                  >
                    <Download className="size-3.5" />
                  </IconBtn>
                  <IconBtn
                    title="Sil"
                    disabled={busy}
                    onClick={() => run(() => deletePortfolioDocument(d), "Belge silindi")}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </IconBtn>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Select value={docKind} onValueChange={(v) => setDocKind(v as DocumentKind)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_KINDS.map((k) => (
                <SelectItem key={k.value} value={k.value}>
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gold/40 px-3 py-1.5 text-sm text-gold hover:bg-gold/10">
            <UploadCloud className="size-4" /> Belge yükle
            <input
              type="file"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) run(() => uploadDocument(portfolioId, file, docKind), "Belge yüklendi");
              }}
            />
          </label>
        </div>
      </SurfaceCard>
    </div>
  );
}

function IconBtn({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-7"
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
