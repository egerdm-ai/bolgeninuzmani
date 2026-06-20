import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SurfaceCard } from "@/components/vault/cards";
import { Button } from "@/components/ui/button";
import { RegionSelect, type RegionValue } from "@/components/geo/region-select";
import { getDistrictCentroid } from "@/lib/geo";

// TEMPORARY demo route (Adım 2). Remove when RegionSelect is wired into the wizard +
// search form (Adım 4). Not linked in nav — open /dashboard/geo-demo manually.
export const Route = createFileRoute("/dashboard/geo-demo")({
  component: GeoDemo,
});

function GeoDemo() {
  const [value, setValue] = useState<RegionValue>({
    city: null,
    district: null,
    neighborhood: null,
  });
  const [legacy, setLegacy] = useState<RegionValue>({
    city: "Bodrumm",
    district: "Merkezz",
    neighborhood: null,
  });

  const centroid =
    value.city && value.district ? getDistrictCentroid(value.city, value.district) : null;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="RegionSelect — Demo"
        subtitle="Geçici test (Adım 2). İl → İlçe → Mahalle seçmeli combobox."
      />

      <SurfaceCard className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Yeni seçim</h2>
        <RegionSelect value={value} onChange={setValue} />
        <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs">
          <p className="text-muted-foreground">Çıktı (kanonik):</p>
          <pre className="mt-1 text-secondary-foreground">{JSON.stringify(value, null, 2)}</pre>
          <p className="mt-2 text-muted-foreground">
            Türetilen yaklaşık koordinat (ilçe merkezi):{" "}
            <span className="text-gold">{centroid ? `${centroid.lat}, ${centroid.lng}` : "—"}</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setValue({ city: null, district: null, neighborhood: null })}
        >
          Temizle
        </Button>
      </SurfaceCard>

      <SurfaceCard className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Eski serbest-metin değer (edit senaryosu)
        </h2>
        <p className="text-xs text-muted-foreground">
          Başlangıç değeri kanonik listede yok → bozulmadan gösterilir + uyarı çıkar.
        </p>
        <RegionSelect value={legacy} onChange={setLegacy} />
        <pre className="rounded-lg border border-border bg-surface-2 p-3 text-xs text-secondary-foreground">
          {JSON.stringify(legacy, null, 2)}
        </pre>
      </SurfaceCard>
    </PageContainer>
  );
}
