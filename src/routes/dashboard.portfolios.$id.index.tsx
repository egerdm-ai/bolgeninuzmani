import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Share2, Loader2, Lock, MapPin, ImageOff, FileText, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { getMyPortfolioFull, type PortfolioFull } from "@/lib/data/portfolios";
import {
  CATEGORY_LABELS,
  TRANSACTION_LABELS,
  STATUS_LABELS,
  formatPortfolioPrice,
} from "@/lib/portfolio-labels";
import { attributeDef } from "@/lib/portfolio-attributes";
import { ImageLightbox } from "@/components/portfolio/image-lightbox";

export const Route = createFileRoute("/dashboard/portfolios/$id/")({
  component: OwnerPortfolioDetail,
});

function OwnerPortfolioDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [full, setFull] = useState<PortfolioFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getMyPortfolioFull(id)
      .then((d) => {
        if (!active) return;
        setFull(d);
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

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      </PageContainer>
    );
  }

  if (error || !full) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {error ? `Yüklenemedi: ${error}` : "Portföy bulunamadı veya erişiminiz yok."}
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

  const p = full.portfolio;
  const isOwner = user?.id === p.owner_id;
  const imageUrls = full.images.map((i) => i.url);
  const coverIdx = Math.max(
    0,
    full.images.findIndex((i) => i.is_cover),
  );
  const cover = full.images.find((i) => i.is_cover) ?? full.images[0];

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Portföy Detayı"
        breadcrumbs={[
          isOwner
            ? { label: "Portföylerim", to: "/dashboard/portfolios" }
            : { label: "Keşfet", to: "/dashboard/search" },
          { label: p.title },
        ]}
        actions={
          isOwner && (
            <>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => navigate({ to: "/dashboard/portfolios/$id/edit", params: { id } })}
              >
                <Pencil className="size-4" /> Düzenle
              </Button>
              <Button
                asChild
                className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <Link to="/dashboard/portfolios/$id/share" params={{ id }}>
                  <Share2 className="size-4" /> Share Studio
                </Link>
              </Button>
            </>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Gallery */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
            <div className="relative aspect-[16/9]">
              {cover ? (
                <img
                  src={cover.url}
                  alt={p.title}
                  onClick={() => setLightbox(coverIdx)}
                  className="size-full cursor-zoom-in object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-8" />
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-md bg-background/80 px-2 py-0.5 text-xs font-semibold text-foreground">
                {STATUS_LABELS[p.status]}
              </span>
            </div>
            {full.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-2">
                {full.images.map((img, idx) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onClick={() => setLightbox(idx)}
                    className="h-16 w-24 shrink-0 cursor-zoom-in rounded-md object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Teaser facts */}
          <SurfaceCard className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{CATEGORY_LABELS[p.category]}</span>
              {p.subcategory && (
                <>
                  <span>·</span>
                  <span>{p.subcategory}</span>
                </>
              )}
              <span>·</span>
              <span>{TRANSACTION_LABELS[p.transaction_type]}</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground">{p.title}</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 text-gold" />~
              {[p.neighborhood, p.district, p.city].filter(Boolean).join(", ") ||
                "Konum belirtilmemiş"}
            </p>
            <p className="font-display text-2xl font-semibold text-gold">
              {formatPortfolioPrice(p.price, p.currency)}
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-secondary-foreground">
              {p.room_count && <Fact label="Oda" value={p.room_count} />}
              {p.gross_m2 != null && <Fact label="Brüt" value={`${p.gross_m2} m²`} />}
              {p.net_m2 != null && <Fact label="Net" value={`${p.net_m2} m²`} />}
              {p.land_m2 != null && <Fact label="Arsa" value={`${p.land_m2} m²`} />}
            </div>
            {p.features.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {p.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
            <AttrList data={p.attributes} />
            {p.public_description && (
              <p className="pt-1 text-sm leading-relaxed text-secondary-foreground">
                {p.public_description}
              </p>
            )}
          </SurfaceCard>
        </div>

        {/* Right rail — LOCKED data (owner / granted only) */}
        <div className="space-y-5">
          <SurfaceCard className="space-y-3 border-gold/30 bg-gold/[0.04]">
            <div className="flex items-center gap-1.5">
              <Lock className="size-4 text-gold" />
              <h3 className="text-sm font-semibold text-foreground">Kilitli Bilgiler</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isOwner
                ? "Teaser'da görünmez. Yalnızca siz ve erişim onayladığınız emlakçılar görür (D13/D20)."
                : "Tam adres, malik bilgisi, belgeler ve özel notlar erişim onayı ile açılır."}
            </p>
            {isOwner ? (
              full.private ? (
                <dl className="space-y-2 text-sm">
                  <LockRow label="Tam Adres" value={full.private.exact_address} />
                  <LockRow
                    label="Tam Koordinat"
                    value={
                      full.private.exact_lat != null && full.private.exact_lng != null
                        ? `${full.private.exact_lat}, ${full.private.exact_lng}`
                        : null
                    }
                  />
                  <LockRow label="Özel Açıklama" value={full.private.private_description} />
                  <LockRow label="Özel Notlar" value={full.private.private_notes} />
                  <AttrList data={full.private.attributes} />
                </dl>
              ) : (
                <p className="text-xs text-muted-foreground">Kilitli bilgi eklenmemiş.</p>
              )
            ) : (
              // Non-owner (logged-in verified agent): no values (RLS returns none). The
              // Detay Talebi / controlled-access engine is M3 — not built this turn.
              <div className="rounded-lg border border-gold/25 bg-gold/[0.06] p-3 text-center">
                <p className="text-xs font-medium text-foreground">🔒 Detay Talebi gerekli</p>
                <Button
                  size="sm"
                  className="mt-2 w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
                  onClick={() => toast.info("Kontrollü erişim (Detay Talebi) yakında")}
                >
                  Detay Talebi Gönder
                </Button>
              </div>
            )}
          </SurfaceCard>

          {/* Approx vs exact note (D30) */}
          <SurfaceCard className="space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">Harita Pini (yaklaşık)</h3>
            <p className="text-xs text-muted-foreground">Teaser'da gösterilen yaklaşık pin:</p>
            <p className="text-sm text-secondary-foreground">
              {p.approx_lat != null && p.approx_lng != null
                ? `~${p.approx_lat.toFixed(4)}, ${p.approx_lng.toFixed(4)}`
                : "Tam koordinat girilmedi"}
            </p>
          </SurfaceCard>

          {/* Documents (locked) */}
          <SurfaceCard className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Belgeler (kilitli)</h3>
            {!isOwner ? (
              <p className="text-xs text-muted-foreground">🔒 Erişim onayı ile görünür.</p>
            ) : full.documents.length === 0 ? (
              <p className="text-xs text-muted-foreground">Belge eklenmemiş.</p>
            ) : (
              full.documents.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 text-sm text-secondary-foreground"
                >
                  <FileText className="size-4 text-gold" /> {d.kind}
                </div>
              ))
            )}
          </SurfaceCard>
        </div>
      </div>
      {lightbox !== null && (
        <ImageLightbox images={imageUrls} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </PageContainer>
  );
}

function AttrList({ data }: { data: unknown }) {
  if (!data || typeof data !== "object") return null;
  const entries = Object.entries(data as Record<string, unknown>).filter(([k]) => attributeDef(k));
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {entries.map(([k, v]) => {
        const def = attributeDef(k)!;
        const val =
          def.type === "boolean"
            ? v
              ? "Evet"
              : "Hayır"
            : def.type === "select"
              ? (def.options?.find((o) => o.value === v)?.label ?? String(v))
              : String(v);
        return (
          <span
            key={k}
            className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {def.label}: {val}
          </span>
        );
      })}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-surface-2 px-2.5 py-1">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}

function LockRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}
