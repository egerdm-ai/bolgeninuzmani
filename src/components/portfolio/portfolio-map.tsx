import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

// B10 Harita (MapLibre, D3). SECURITY: this component accepts ONLY approximate
// coordinates (approx_lat/approx_lng, D30). It has no access to exact_lat/exact_lng —
// callers map teaser rows whose exact location never leaves the backend. A single
// pin per portfolio at the approximate (neighbourhood-level) point.

export type MapPoint = {
  id: string;
  slug: string;
  /** APPROX latitude (D30) — never exact. */
  lat: number;
  /** APPROX longitude (D30) — never exact. */
  lng: number;
  title: string;
  price?: string;
};

// Neutral CARTO Voyager raster basemap (no API key); readable in light + dark.
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    carto: {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap, © CARTO",
    },
  },
  layers: [{ id: "carto", type: "raster" as const, source: "carto" }],
};

// Istanbul fallback when no points have coordinates.
const FALLBACK: [number, number] = [28.9784, 41.0082];

export function PortfolioMap({
  points,
  onSelect,
  className,
}: {
  points: MapPoint[];
  onSelect?: (p: MapPoint) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !ref.current) return;
      map = new maplibregl.Map({
        container: ref.current,
        style: MAP_STYLE as never,
        center: points[0] ? [points[0].lng, points[0].lat] : FALLBACK,
        zoom: 10,
        attributionControl: false,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.AttributionControl({ compact: true }));

      // Pin fill from the theme-aware brand token (gold dims in light mode); the white
      // ring is intentional separation on the (theme-independent) light basemap.
      const gold =
        getComputedStyle(document.documentElement).getPropertyValue("--bu-gold").trim() ||
        "#c9a84c";
      for (const p of points) {
        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", p.title);
        el.style.cssText = `width:18px;height:18px;border-radius:9999px;border:2px solid #fff;background:${gold};box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer;`;
        el.addEventListener("click", () => onSelect?.(p));
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
      }

      if (points.length > 1) {
        const b = new maplibregl.LngLatBounds();
        points.forEach((p) => b.extend([p.lng, p.lat]));
        map.fitBounds(b, { padding: 56, maxZoom: 13 });
      } else if (points.length === 1) {
        map.setCenter([points[0].lng, points[0].lat]);
        map.setZoom(13);
      }
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [points, onSelect]);

  return <div ref={ref} className={className} />;
}
