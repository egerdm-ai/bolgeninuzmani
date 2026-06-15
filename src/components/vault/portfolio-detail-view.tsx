import { useState } from "react";
import { MapPin, Bookmark, Share2, Heart } from "lucide-react";
import type { Portfolio } from "@/lib/mock/types";
import { formatPrice, categoryLabels, portfolioTypeLabels } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PortfolioGallery } from "./portfolio-gallery";
import { KeyFactsStrip } from "./key-facts-strip";
import { LockedInfoPanel } from "./locked-info-panel";
import { OwnerCard } from "./owner-card";
import { ApproxLocationMap } from "./approx-location-map";
import { DocumentLockList } from "./document-lock-list";
import { PortfolioCard } from "./portfolio-card";
import { CategoryChip, FeatureChip, VisibilityBadge } from "./badges";
import { InfoPanel, SurfaceCard } from "./cards";
import { DetailRequestModal } from "./detail-request-modal";
import { cn } from "@/lib/utils";
import { useSaved } from "@/lib/saved-store";
import { getPortfoliosByProfessional } from "@/lib/mock/data";

export function PortfolioDetailView({
  portfolio,
  similar = [],
  mode = "member",
}: {
  portfolio: Portfolio;
  similar?: Portfolio[];
  mode?: "public" | "member" | "owner";
}) {
  const { isSaved, toggleSave } = useSaved();
  const [requestOpen, setRequestOpen] = useState(false);
  const unlocked = mode === "owner";
  const images = mode === "public" ? portfolio.images.slice(0, 2) : portfolio.images;
  const ownerOthers = getPortfoliosByProfessional(portfolio.owner.id, { activeOnly: true })
    .filter((x) => x.id !== portfolio.id)
    .slice(0, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <PortfolioGallery images={images} title={portfolio.title} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip label={categoryLabels[portfolio.category]} />
            <FeatureChip label={portfolioTypeLabels[portfolio.type]} />
            <VisibilityBadge visibility={portfolio.visibility} />
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{portfolio.title}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 text-gold" /> ~{portfolio.regionLabel}
            {unlocked && portfolio.exactAddress && <span className="text-secondary-foreground"> · {portfolio.exactAddress}</span>}
          </p>
        </div>

        <KeyFactsStrip portfolio={portfolio} />

        <InfoPanel title="Genel Bakış">
          <p className="text-sm leading-relaxed text-secondary-foreground">{portfolio.shortDescription}</p>
        </InfoPanel>

        <InfoPanel title="Özellikler">
          <div className="flex flex-wrap gap-2">
            {portfolio.features.map((f) => <FeatureChip key={f} label={f} />)}
          </div>
        </InfoPanel>

        <InfoPanel title="Yaklaşık Konum">
          <ApproxLocationMap label={portfolio.regionLabel} radiusKm={portfolio.approxRadiusKm} x={50} y={48} />
        </InfoPanel>

        {mode !== "public" && (
          <InfoPanel title="Belgeler">
            <DocumentLockList documents={portfolio.documents} unlocked={unlocked} />
          </InfoPanel>
        )}

        {similar.length > 0 && (
          <div>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">Benzer Portföyler</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((p) => (
                <PortfolioCard key={p.id} portfolio={p} saved={isSaved(p.id)} onToggleSave={toggleSave} />
              ))}
            </div>
          </div>
        )}

        {mode !== "public" && ownerOthers.length > 0 && (
          <div>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
              Bu Profesyonelin Benzer Portföyleri
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {ownerOthers.map((p) => (
                <PortfolioCard key={p.id} portfolio={p} saved={isSaved(p.id)} onToggleSave={toggleSave} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right rail */}
      <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <SurfaceCard>
          <p className="text-xs text-muted-foreground">Fiyat</p>
          <div className="font-display text-3xl font-semibold text-gold">{formatPrice(portfolio.price, portfolio.currency)}</div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className={cn("flex-1 gap-1.5", isSaved(portfolio.id) && "border-gold/40 text-gold")}
              onClick={() => toggleSave(portfolio.id)}
            >
              <Bookmark className={cn("size-4", isSaved(portfolio.id) && "fill-current")} /> Kaydet
            </Button>
            <Button variant="outline" className="flex-1 gap-1.5"><Share2 className="size-4" /> Paylaş</Button>
          </div>
        </SurfaceCard>

        {mode === "owner" ? (
          <SurfaceCard className="border-success/25 bg-success/[0.04]">
            <p className="text-sm font-semibold text-foreground">Bu portföy size ait</p>
            <p className="mt-1 text-xs text-muted-foreground">Tüm bilgiler ve belgeler görünür durumda.</p>
          </SurfaceCard>
        ) : (
          <LockedInfoPanel onRequest={() => setRequestOpen(true)} />
        )}

        <OwnerCard owner={portfolio.owner} />

        {mode === "public" && (
          <SurfaceCard className="border-gold/30 bg-gold/[0.05] text-center">
            <Heart className="mx-auto size-6 text-gold" />
            <p className="mt-2 text-sm font-semibold text-foreground">VAULT üyesi misiniz?</p>
            <p className="mt-1 text-xs text-muted-foreground">Tüm detaylara erişmek ve talep göndermek için giriş yapın.</p>
            <Button className="mt-3 w-full bg-gradient-gold text-primary-foreground hover:opacity-90">Giriş Yap / Başvur</Button>
          </SurfaceCard>
        )}
      </div>

      <DetailRequestModal portfolio={portfolio} open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
