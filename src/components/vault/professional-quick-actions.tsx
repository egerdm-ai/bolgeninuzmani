import { FolderLock, Send } from "lucide-react";
import type { Professional } from "@/lib/mock/types";
import { SurfaceCard } from "./cards";
import { FollowButton } from "./follow-button";
import { ShareProfileButton } from "./share-profile-button";
import { Button } from "@/components/ui/button";

/**
 * Sidebar quick actions for a professional profile: follow, share, jump to
 * portfolios and send a detail request.
 */
export function ProfessionalQuickActions({
  professional,
  onShowPortfolios,
  onRequestDetail,
}: {
  professional: Professional;
  onShowPortfolios: () => void;
  onRequestDetail: () => void;
}) {
  return (
    <SurfaceCard>
      <h3 className="text-sm font-semibold text-foreground">Hızlı İşlemler</h3>
      <div className="mt-3 space-y-2">
        <FollowButton
          id={professional.id}
          name={professional.fullName}
          className="w-full justify-start"
          fullWidth
        />
        <ShareProfileButton username={professional.username} className="w-full justify-start" />
        <Button variant="outline" className="w-full justify-start gap-2" onClick={onShowPortfolios}>
          <FolderLock className="size-4 text-gold" /> Portföylerini Gör
        </Button>
        <Button
          className="w-full justify-start gap-2 bg-gradient-gold text-primary-foreground hover:opacity-90"
          onClick={onRequestDetail}
        >
          <Send className="size-4" /> Detay Talebi Gönder
        </Button>
      </div>
    </SurfaceCard>
  );
}
