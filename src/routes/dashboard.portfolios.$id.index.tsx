import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Pencil,
  Share2,
  Loader2,
  Lock,
  LockOpen,
  MapPin,
  ImageOff,
  FileText,
  Download,
  ArrowLeft,
  Clock,
  Send,
  Phone,
  MessageCircle,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getMyPortfolioFull,
  documentSignedUrl,
  getOwnerContact,
  type PortfolioFull,
  type PortfolioDocument,
  type OwnerContact,
} from "@/lib/data/portfolios";
import {
  requestDetail,
  myRequestForPortfolio,
  hasPortfolioAccess,
  type DetailRequest,
} from "@/lib/data/access";
import {
  CATEGORY_LABELS,
  TRANSACTION_LABELS,
  STATUS_LABELS,
  formatPortfolioPrice,
} from "@/lib/portfolio-labels";
import { attributeDef } from "@/lib/portfolio-attributes";
import { ImageLightbox } from "@/components/portfolio/image-lightbox";
import { ThumbImage } from "@/components/portfolio/thumb-image";
import {
  ClosedModeBadge,
  RefNoText,
  LockedRevealList,
} from "@/components/portfolio/portfolio-badges";

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

  // M3 controlled-access state (non-owner viewers).
  const [access, setAccess] = useState(false);
  const [myRequest, setMyRequest] = useState<DetailRequest | null>(null);
  const [ownerContact, setOwnerContact] = useState<OwnerContact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await getMyPortfolioFull(id);
        if (!active) return;
        setFull(d);
        if (d && user && user.id !== d.portfolio.owner_id) {
          if (d.portfolio.mode === "call_only") {
            // call_only: no access/request flow — just the agent's contact for "ara".
            const c = await getOwnerContact(d.portfolio.owner_id);
            if (active) setOwnerContact(c);
          } else {
            const [acc, req] = await Promise.all([
              hasPortfolioAccess(id),
              myRequestForPortfolio(id, user.id),
            ]);
            if (!active) return;
            setAccess(acc);
            setMyRequest(req);
          }
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, user]);

  async function submitRequest() {
    setRequesting(true);
    try {
      const r = await requestDetail(id, message);
      setMyRequest(r);
      setShowModal(false);
      setMessage("");
      toast.success("Detay talebin iletildi — portföy sahibinin onayı bekleniyor.");
    } catch (e) {
      toast.error("Talep gönderilemedi", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setRequesting(false);
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
  const callOnly = p.mode === "call_only"; // D36: no locked fields / no Detay Talebi flow
  const canSeeLocked = !callOnly && (isOwner || access); // owner OR active grant (D6/D7)
  // call_only has no "locked photo" concept → only public images anywhere.
  const galleryImages = callOnly
    ? full.images.filter((i) => i.visibility === "public")
    : full.images;
  const imageUrls = galleryImages.map((i) => i.url);
  const coverIdx = Math.max(
    0,
    galleryImages.findIndex((i) => i.is_cover),
  );
  const cover = galleryImages.find((i) => i.is_cover) ?? galleryImages[0];

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
          {/* Gallery (locked photos appear only for owner/granted via RLS + signed URL) */}
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
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-2">
                {galleryImages.map((img, idx) => (
                  <div key={img.id} className="relative shrink-0">
                    <ThumbImage
                      thumb={img.thumbUrl}
                      full={img.url}
                      onClick={() => setLightbox(idx)}
                      className="h-16 w-24 cursor-zoom-in rounded-md object-cover"
                    />
                    {img.visibility === "locked" && (
                      <span className="absolute right-1 top-1 rounded bg-background/80 p-0.5 text-gold">
                        <Lock className="size-3" />
                      </span>
                    )}
                  </div>
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
            <div className="flex items-center gap-2">
              <RefNoText value={p.ref_no} />
              <ClosedModeBadge mode={p.mode} />
            </div>
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

        {/* Right rail */}
        <div className="space-y-5">
          {callOnly ? (
            // D36 call_only: no locked fields / no Detay Talebi — contact-only.
            <SurfaceCard className="space-y-3 border-gold/40 bg-gold/[0.06]">
              <div className="flex items-center gap-1.5">
                <Phone className="size-4 text-gold" />
                <h3 className="text-sm font-semibold text-foreground">Kapalı Portföy</h3>
              </div>
              {isOwner ? (
                <p className="text-xs text-muted-foreground">
                  Bu portföy “Kapalı Portföy” modunda — kilitli alan yok. Paylaşımda müşteriye
                  “detaylar için arayın” + telefonunuz gösterilir.
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Bu kapalı bir portföydür. Detaylar için emlakçıyı arayın.
                  </p>
                  {ownerContact?.contact_phone && (
                    <Button
                      asChild
                      className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
                    >
                      <a href={`tel:${ownerContact.contact_phone}`}>
                        <Phone className="size-4" /> {ownerContact.contact_phone}
                      </a>
                    </Button>
                  )}
                  {ownerContact?.contact_whatsapp && (
                    <Button asChild variant="outline" className="w-full gap-1.5">
                      <a
                        href={`https://wa.me/${ownerContact.contact_whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="size-4" /> WhatsApp
                      </a>
                    </Button>
                  )}
                  {ownerContact &&
                    !ownerContact.contact_phone &&
                    !ownerContact.contact_whatsapp && (
                      <p className="text-xs text-muted-foreground">
                        Emlakçı iletişim bilgisi paylaşmamış.
                      </p>
                    )}
                </>
              )}
            </SurfaceCard>
          ) : (
            <SurfaceCard
              className={`space-y-3 ${canSeeLocked ? "border-gold/40 bg-gold/[0.06]" : "border-gold/30 bg-gold/[0.04]"}`}
            >
              <div className="flex items-center gap-1.5">
                {canSeeLocked ? (
                  <LockOpen className="size-4 text-gold" />
                ) : (
                  <Lock className="size-4 text-gold" />
                )}
                <h3 className="text-sm font-semibold text-foreground">
                  Kilitli Bilgiler{!isOwner && access ? " (erişim onaylı)" : ""}
                </h3>
              </div>

              {canSeeLocked ? (
                <>
                  <p className="text-[11px] text-muted-foreground">
                    {isOwner
                      ? "Teaser'da görünmez. Yalnızca siz ve erişim onayladığınız emlakçılar görür (D13/D20)."
                      : "Portföy sahibi erişiminizi onayladı — tam bilgiler açık."}
                  </p>
                  {full.private ? (
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
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <RequestPanel status={myRequest?.status} onRequest={() => setShowModal(true)} />
                  {/* D37: what unlocks after approval (labels only, no values) */}
                  <LockedRevealList />
                </div>
              )}
            </SurfaceCard>
          )}

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

          {/* Documents (locked) — controlled only */}
          {!callOnly && (
            <SurfaceCard className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Belgeler (kilitli)</h3>
              {!canSeeLocked ? (
                <p className="text-xs text-muted-foreground">🔒 Erişim onayı ile görünür.</p>
              ) : full.documents.length === 0 ? (
                <p className="text-xs text-muted-foreground">Belge eklenmemiş.</p>
              ) : (
                full.documents.map((d) => <DocRow key={d.id} doc={d} />)
              )}
            </SurfaceCard>
          )}
        </div>
      </div>

      {lightbox !== null && (
        <ImageLightbox images={imageUrls} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}

      {showModal && (
        <RequestModal
          message={message}
          setMessage={setMessage}
          requesting={requesting}
          onCancel={() => setShowModal(false)}
          onSubmit={submitRequest}
        />
      )}
    </PageContainer>
  );
}

/** Non-owner without access: request button reflecting the latest request state. */
function RequestPanel({
  status,
  onRequest,
}: {
  status?: DetailRequest["status"];
  onRequest: () => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-gold/25 bg-gold/[0.06] p-3 text-center">
      <p className="text-xs font-medium text-foreground">🔒 Tam adres, malik, belgeler kilitli</p>
      {status === "pending" ? (
        <Button variant="outline" className="w-full gap-1.5" disabled>
          <Clock className="size-4" /> Talebin beklemede
        </Button>
      ) : status === "rejected" ? (
        <>
          <p className="text-xs text-destructive">Talebin reddedildi.</p>
          <Button
            className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            onClick={onRequest}
          >
            <Send className="size-4" /> Tekrar Detay Talebi Gönder
          </Button>
        </>
      ) : (
        <Button
          className="w-full gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
          onClick={onRequest}
        >
          <Send className="size-4" /> Detay Talebi Gönder
        </Button>
      )}
    </div>
  );
}

/** Optional-message modal for sending a detail request. */
function RequestModal({
  message,
  setMessage,
  requesting,
  onCancel,
  onSubmit,
}: {
  message: string;
  setMessage: (v: string) => void;
  requesting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Detay Talebi Gönder
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Portföy sahibine kısa bir not ekleyebilirsiniz (opsiyonel). Onaylanırsa tüm kilitli
            alanlar size açılır.
          </p>
        </div>
        <Textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Merhaba, bu portföyün detaylarını görmek istiyorum…"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={requesting}>
            İptal
          </Button>
          <Button
            className="gap-1.5 bg-gradient-gold text-primary-foreground hover:opacity-90"
            onClick={onSubmit}
            disabled={requesting}
          >
            {requesting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Gönder
          </Button>
        </div>
      </div>
    </div>
  );
}

/** A locked document row with a short-lived signed-URL download (access-checked). */
function DocRow({ doc }: { doc: PortfolioDocument }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const url = await documentSignedUrl(doc.path);
          if (url) window.open(url, "_blank");
          else toast.error("İndirme bağlantısı oluşturulamadı (erişim yok).");
        } finally {
          setBusy(false);
        }
      }}
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-secondary-foreground hover:border-gold/40"
    >
      <span className="flex items-center gap-2">
        <FileText className="size-4 text-gold" /> {doc.kind}
      </span>
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
    </button>
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
