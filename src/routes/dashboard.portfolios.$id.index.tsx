import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Pencil,
  Share2,
  Loader2,
  Lock,
  LockOpen,
  FileText,
  Download,
  ArrowLeft,
  ChevronRight,
  Clock,
  Send,
  Phone,
  MessageCircle,
} from "lucide-react";
import { PageContainer } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { s } from "@/lib/styles";
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
import { STATUS_LABELS, formatPortfolioPrice } from "@/lib/portfolio-labels";
import { attributeDef } from "@/lib/portfolio-attributes";
import { StatusBadge } from "@/components/vault/badges";
import { LockedRevealList } from "@/components/portfolio/portfolio-badges";
import { RegionExperts } from "@/components/profile/region-experts";
import { featureFlags } from "@/lib/feature-flags";
import {
  DetailGallery,
  DetailHeader,
  QuickInfoStrip,
  AttributesSection,
  ApproxLocationBox,
  AgentPanelCard,
  type DetailImage,
  type DetailAgent,
} from "@/components/portfolio/detail-parts";

export const Route = createFileRoute("/dashboard/portfolios/$id/")({
  component: OwnerPortfolioDetail,
});

const STATUS_TONE = {
  active: "success",
  draft: "warning",
  passive: "muted",
  sold: "muted",
} as const;

function OwnerPortfolioDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [full, setFull] = useState<PortfolioFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const oc = await getOwnerContact(d.portfolio.owner_id);
          if (active) setOwnerContact(oc);
          if (d.portfolio.mode !== "call_only") {
            const [acc, req] = await Promise.all([
              hasPortfolioAccess(id),
              myRequestForPortfolio(id, user.id),
            ]);
            if (active) {
              setAccess(acc);
              setMyRequest(req);
            }
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
          <Loader2 className="size-6 animate-spin text-bu-gold" />
        </div>
      </PageContainer>
    );
  }

  if (error || !full) {
    return (
      <PageContainer>
        <div className={cn(s.card, "px-6 py-16 text-center")}>
          <p className="text-sm text-bu-text-2">
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
  const callOnly = p.mode === "call_only";
  const canSeeLocked = !callOnly && (isOwner || access);
  const galleryImages: DetailImage[] = (
    callOnly ? full.images.filter((i) => i.visibility === "public") : full.images
  ).map((i) => ({ url: i.url, thumbUrl: i.thumbUrl, locked: i.visibility === "locked" }));

  const ownerAgent: DetailAgent | null = ownerContact
    ? {
        full_name: ownerContact.full_name,
        username: ownerContact.username,
        avatar_url: ownerContact.avatar_url,
        title: ownerContact.title,
        company_name: ownerContact.company_name,
        contact_phone: ownerContact.contact_phone,
        contact_whatsapp: ownerContact.contact_whatsapp,
        expertise_regions: ownerContact.expertise_regions,
        expertise_types: ownerContact.expertise_types,
      }
    : null;

  return (
    <PageContainer className="max-w-[1100px]">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-bu-text-2">
        <Link
          to={isOwner ? "/dashboard/portfolios" : "/dashboard/search"}
          className="hover:text-bu-text"
        >
          {isOwner ? "Portföylerim" : "Keşfet"}
        </Link>
        <ChevronRight className="size-3" />
        <span className="truncate text-bu-text">{p.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
        {/* Main column */}
        <div className="min-w-0 space-y-10">
          <DetailGallery images={galleryImages} title={p.title} category={p.category} />
          <DetailHeader
            title={p.title}
            refNo={p.ref_no}
            mode={p.mode}
            category={p.category}
            subcategory={p.subcategory}
            transactionType={p.transaction_type}
            neighborhood={p.neighborhood}
            district={p.district}
            city={p.city}
            price={p.price}
            currency={p.currency}
            statusSlot={
              isOwner ? (
                <StatusBadge label={STATUS_LABELS[p.status]} tone={STATUS_TONE[p.status]} />
              ) : undefined
            }
          />
          <div className="border-t border-bu-border pt-6">
            <QuickInfoStrip
              roomCount={p.room_count}
              grossM2={p.gross_m2}
              netM2={p.net_m2}
              landM2={p.land_m2}
              attributes={p.attributes as Record<string, unknown>}
            />
          </div>
          {p.public_description && (
            <section className="border-t border-bu-border pt-8">
              <h2 className={s.sectionTitle}>Açıklama</h2>
              <p className="mt-3 leading-relaxed text-bu-text-2">{p.public_description}</p>
            </section>
          )}
          <AttributesSection
            category={p.category}
            features={p.features}
            attributes={p.attributes as Record<string, unknown>}
          />
          <ApproxLocationBox
            neighborhood={p.neighborhood}
            district={p.district}
            city={p.city}
            slug={p.slug}
            approxLat={p.approx_lat}
            approxLng={p.approx_lng}
          />
        </div>

        {/* Right sticky panel */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className={cn(s.card, s.cardPadding)}>
            <p className="text-xs uppercase tracking-wider text-bu-text-2">Fiyat</p>
            <p className="mt-1 font-display text-3xl font-bold text-bu-gold">
              {formatPortfolioPrice(p.price, p.currency)}
            </p>
            {isOwner && (
              <>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={() =>
                      navigate({ to: "/dashboard/portfolios/$id/edit", params: { id } })
                    }
                  >
                    <Pencil className="size-4" /> Düzenle
                  </Button>
                  <Button
                    asChild
                    className="flex-1 gap-1.5 bg-gradient-gold text-bu-text-inv hover:opacity-90"
                  >
                    <Link to="/dashboard/portfolios/$id/share" params={{ id }}>
                      <Share2 className="size-4" /> Paylaş
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-bu-border pt-4">
                  <span className="text-sm text-bu-text-2">Durum</span>
                  <StatusBadge label={STATUS_LABELS[p.status]} tone={STATUS_TONE[p.status]} />
                </div>
              </>
            )}
          </div>

          {/* Locked / call_only section */}
          {callOnly ? (
            // call_only = normal info card (light-friendly), not the lock panel.
            <div className={cn(s.card, "space-y-3 p-5")}>
              <PanelHead icon={Phone} title="Kapalı Portföy" />
              {isOwner ? (
                <p className="text-xs text-bu-text-2">
                  Bu portföy “Kapalı Portföy” modunda — kilitli alan yok. Paylaşımda müşteriye
                  “detaylar için arayın” + telefonunuz gösterilir.
                </p>
              ) : (
                <>
                  <p className="text-xs text-bu-text-2">
                    Bu kapalı bir portföydür. Detaylar için emlakçıyı arayın.
                  </p>
                  {ownerContact?.contact_phone && (
                    <a
                      href={`tel:${ownerContact.contact_phone}`}
                      className={cn(s.btnGold, "w-full justify-center")}
                    >
                      <Phone className="size-4" /> {ownerContact.contact_phone}
                    </a>
                  )}
                  {ownerContact?.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${ownerContact.contact_whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(s.btnSecondary, "w-full justify-center")}
                    >
                      <MessageCircle className="size-4" /> WhatsApp
                    </a>
                  )}
                </>
              )}
            </div>
          ) : canSeeLocked ? (
            <LockPanel open>
              <PanelHead
                icon={LockOpen}
                title={`Kilitli Bilgiler${!isOwner && access ? " (erişim onaylı)" : ""}`}
              />
              <p className="text-[11px] text-bu-text-2">
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
                  <LockedAttrs data={full.private.attributes} />
                </dl>
              ) : (
                <p className="text-xs text-bu-text-2">Kilitli bilgi eklenmemiş.</p>
              )}
              {full.documents.length > 0 && (
                <div className="space-y-2 border-t border-bu-border pt-3">
                  <p className="text-xs font-medium text-bu-text-2">Belgeler</p>
                  {full.documents.map((d) => (
                    <DocRow key={d.id} doc={d} />
                  ))}
                </div>
              )}
            </LockPanel>
          ) : (
            <LockPanel>
              <PanelHead icon={Lock} title="Kilitli Bilgiler" />
              <LockedRevealList />
              <RequestPanel
                status={myRequest?.status}
                responseMessage={myRequest?.response_message ?? null}
                onRequest={() => setShowModal(true)}
              />
            </LockPanel>
          )}

          {!isOwner && ownerAgent && (
            <AgentPanelCard
              agent={ownerAgent}
              refNo={p.ref_no}
              neighborhood={p.neighborhood}
              district={p.district}
              city={p.city}
            />
          )}
        </aside>
      </div>

      {featureFlags.regionExperts && (
        <div className="mt-8">
          <RegionExperts city={p.city} district={p.district} excludeOwner={p.owner_id} />
        </div>
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

/* ── Locked panel shell (dramatic dark panel, §2.8) ── */
function LockPanel({ children, open }: { children: React.ReactNode; open?: boolean }) {
  return (
    <div
      className={cn(
        // theme-adaptive (dark navy in dark, light in light) so inner text stays
        // readable in both modes; gold top line keeps the "locked" emphasis.
        "overflow-hidden rounded-bu-xl border bg-bu-bg-subtle shadow-bu-lock",
        open ? "border-bu-gold-border" : "border-bu-border",
      )}
    >
      <div className="h-0.5 bg-gradient-to-r from-bu-gold/0 via-bu-gold to-bu-gold/0" />
      <div className="space-y-3 p-6">{children}</div>
    </div>
  );
}

function PanelHead({ icon: Icon, title }: { icon: typeof Lock; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-bu-md border border-bu-gold-border bg-bu-gold-muted">
        <Icon className="size-4 text-bu-gold" />
      </span>
      <h3 className="text-sm font-semibold text-bu-text">{title}</h3>
    </div>
  );
}

function RequestPanel({
  status,
  responseMessage,
  onRequest,
}: {
  status?: DetailRequest["status"];
  responseMessage?: string | null;
  onRequest: () => void;
}) {
  return (
    <div className="space-y-2">
      {status === "pending" ? (
        <Button variant="outline" className="w-full gap-1.5" disabled>
          <Clock className="size-4" /> Talebin beklemede
        </Button>
      ) : status === "approved" ? (
        <p className={cn(s.badgeOk, "w-full justify-center")}>Erişim onaylandı — bilgiler açık</p>
      ) : status === "rejected" ? (
        <>
          <p className="text-xs text-bu-danger">Talebin reddedildi.</p>
          <Button
            className="w-full gap-1.5 bg-gradient-gold text-bu-text-inv hover:opacity-90"
            onClick={onRequest}
          >
            <Send className="size-4" /> Tekrar Detay Talebi Gönder
          </Button>
        </>
      ) : (
        <Button
          className="w-full gap-1.5 bg-gradient-gold text-bu-text-inv hover:opacity-90"
          onClick={onRequest}
        >
          <Send className="size-4" /> Detay Talebi Gönder
        </Button>
      )}
      {responseMessage && (
        <p className="rounded-bu-md bg-bu-card-raised px-3 py-2 text-xs text-bu-text-2">
          <span className="text-bu-text-3">Emlakçı notu: </span>“{responseMessage}”
        </p>
      )}
    </div>
  );
}

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-bu-overlay p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className={cn(s.card, "w-full max-w-md space-y-4 p-6")}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-display text-lg font-semibold text-bu-text">Detay Talebi Gönder</h3>
          <p className="mt-1 text-sm text-bu-text-2">
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
            className="gap-1.5 bg-gradient-gold text-bu-text-inv hover:opacity-90"
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
      className="flex w-full items-center justify-between gap-2 rounded-bu-md border border-bu-border bg-bu-card-raised px-3 py-2 text-sm text-bu-text-2 hover:border-bu-gold-border"
    >
      <span className="flex items-center gap-2">
        <FileText className="size-4 text-bu-gold" /> {doc.kind}
      </span>
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
    </button>
  );
}

function LockRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-bu-text-2">{label}</dt>
      <dd className="text-right font-medium text-bu-text">{value || "—"}</dd>
    </div>
  );
}

function LockedAttrs({ data }: { data: unknown }) {
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
            className="rounded-bu-md bg-bu-card-raised px-2 py-0.5 text-xs text-bu-text-2"
          >
            {def.label}: {val}
          </span>
        );
      })}
    </div>
  );
}
