import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

// B10 Harita (MapLibre, D3). SECURITY: this component accepts ONLY approximate
// coordinates (approx_lat/approx_lng, D30). It has no access to exact_lat/exact_lng —
// callers map teaser rows whose exact location never leaves the backend. One price-bubble
// pin per portfolio at the approximate (neighbourhood-level) point. Price is the PUBLIC
// teaser price (D13-safe), already abbreviated by the caller.

export type MapPoint = {
  id: string;
  slug: string;
  /** APPROX latitude (D30) — never exact. */
  lat: number;
  /** APPROX longitude (D30) — never exact. */
  lng: number;
  title: string;
  /** Compact teaser price label, e.g. "64,5M ₺". */
  price?: string;
};

// Dark CARTO "dark matter" raster basemap (no API key) — navy-friendly, stays dark in
// both themes to match the Lovable Keşfet look. Price bubbles read on top in either mode.
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    carto: {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap, © CARTO",
    },
  },
  layers: [{ id: "carto", type: "raster" as const, source: "carto" }],
};

// Istanbul fallback when no points have coordinates.
const FALLBACK: [number, number] = [28.9784, 41.0082];

const PILL_BASE =
  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-elegant ring-1 ring-inset transition-all whitespace-nowrap cursor-pointer";
// state → pill classes (literals so Tailwind keeps them; markers are created via DOM).
function pillClass(state: "default" | "hovered" | "selected"): string {
  if (state === "selected")
    return `${PILL_BASE} z-20 scale-110 bg-gradient-gold text-primary-foreground ring-gold`;
  if (state === "hovered") return `${PILL_BASE} z-20 scale-110 bg-surface-3 text-gold ring-gold/60`;
  return `${PILL_BASE} bg-surface text-gold ring-border-strong hover:bg-surface-3`;
}

export function PortfolioMap({
  points,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  className,
}: {
  points: MapPoint[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (p: MapPoint) => void;
  onHover?: (p: MapPoint | null) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Build map + markers when points change.
  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !ref.current) return;
      const map = new maplibregl.Map({
        container: ref.current,
        style: MAP_STYLE as never,
        center: points[0] ? [points[0].lng, points[0].lat] : FALLBACK,
        zoom: 10,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.AttributionControl({ compact: true }));

      markersRef.current.clear();
      for (const p of points) {
        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", p.title);
        el.className = pillClass("default");
        el.textContent = p.price ?? p.title;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelect?.(p);
        });
        el.addEventListener("mouseenter", () => onHover?.(p));
        el.addEventListener("mouseleave", () => onHover?.(null));
        markersRef.current.set(p.id, el);
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
      }

      if (points.length > 1) {
        const b = new maplibregl.LngLatBounds();
        points.forEach((p) => b.extend([p.lng, p.lat]));
        map.fitBounds(b, { padding: 64, maxZoom: 13 });
      } else if (points.length === 1) {
        map.setCenter([points[0].lng, points[0].lat]);
        map.setZoom(13);
      }
    })();

    return () => {
      cancelled = true;
      markersRef.current.clear();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points, onSelect, onHover]);

  // Restyle markers on selection/hover WITHOUT rebuilding the map.
  useEffect(() => {
    for (const [id, el] of markersRef.current) {
      const state = id === selectedId ? "selected" : id === hoveredId ? "hovered" : "default";
      el.className = pillClass(state);
    }
  }, [selectedId, hoveredId, points]);

  return <div ref={ref} className={className} />;
}
