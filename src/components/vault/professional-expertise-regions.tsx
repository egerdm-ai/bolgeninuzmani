import type { Professional } from "@/lib/mock/types";
import { ExpertiseRegionCard } from "./expertise-region-card";
import { ExpertiseMap } from "./expertise-map";

/**
 * "Uzmanlık Bölgeleri" section. Region cards filter the Portföyleri catalog or
 * navigate to the region page; the mock map mirrors the active region.
 */
export function ProfessionalExpertiseRegions({
  professional,
  activeRegion,
  onFocusRegion,
}: {
  professional: Professional;
  activeRegion: string | null;
  onFocusRegion: (region: string) => void;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Uzmanlık Bölgeleri</h2>
        <p className="text-sm text-muted-foreground">
          Bu profesyonel{" "}
          <span className="font-medium text-gold">{professional.regionListCount} bölge listesinde</span>{" "}
          yer alıyor. Bir bölgeye tıklayarak portföyleri filtreleyin.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {professional.regionExpertise.map((r) => (
            <ExpertiseRegionCard key={r.region} region={r} onFocus={onFocusRegion} />
          ))}
        </div>
        <ExpertiseMap
          regions={professional.regionExpertise}
          activeRegion={activeRegion}
          onSelectRegion={onFocusRegion}
          className="lg:sticky lg:top-32 lg:self-start"
        />
      </div>
    </section>
  );
}
