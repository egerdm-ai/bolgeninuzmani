import { useEffect, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

// B10 Harita (MapLibre, D3). SECURITY: this component accepts ONLY approximate
// coordinates (approx_lat/approx_lng, D30). It has no access to exact_lat/exact_lng —
// callers map teaser rows whose exact location never leaves the backend. One price-bubble
// pin per portfolio at the approximate (neighbourhood-level) point. Price is the PUBLIC
// teaser price (D13-safe), already abbreviated by the caller.
//
// The map instance is created ONCE (mount). Hover/selection only TOGGLE marker classes;
// markers/fitBounds only rebuild when the point set actually changes (pointsKey). The
// basemap follows the app theme (Positron light / Dark Matter dark) via setStyle.

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

// CARTO raster basemaps (no API key). Positron (light) + Dark Matter (dark) — clean,
// premium, navy-friendly; price bubbles read on both.
const TILES = {
  light: "light_all",
  dark: "dark_all",
} as const;

function rasterStyle(theme: "light" | "dark") {
  const slug = TILES[theme];
  return {
    version: 8 as const,
    sources: {
      carto: {
        type: "raster" as const,
        tiles: ["a", "b", "c"].map(
          (s) => `https://${s}.basemaps.cartocdn.com/${slug}/{z}/{x}/{y}.png`,
        ),
        tileSize: 256,
        attribution: "© OpenStreetMap, © CARTO",
      },
    },
    layers: [{ id: "carto", type: "raster" as const, source: "carto" }],
  };
}

const currentTheme = (): "light" | "dark" =>
  typeof document !== "undefined" && document.documentElement.classList.contains("light")
    ? "light"
    : "dark";

// Istanbul fallback when no points have coordinates.
const FALLBACK: [number, number] = [28.9784, 41.0082];

const PILL_BASE =
  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-elegant ring-1 ring-inset transition-all whitespace-nowrap cursor-pointer";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());
  const [ready, setReady] = useState(false);

  // Latest callbacks/points via refs → marker handlers stay current without re-init.
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  const pointsRef = useRef(points);
  onSelectRef.current = onSelect;
  onHoverRef.current = onHover;
  pointsRef.current = points;

  // Stable signature of the point set — markers rebuild only when this changes (NOT hover).
  const pointsKey = useMemo(
    () => points.map((p) => `${p.id}:${p.lat}:${p.lng}:${p.price ?? ""}`).join("|"),
    [points],
  );

  // 1) Create the map ONCE.
  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    let observer: MutationObserver | null = null;
    const markers = markersRef.current;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !ref.current) return;
      glRef.current = maplibregl;
      const init = pointsRef.current[0];
      const map = new maplibregl.Map({
        container: ref.current,
        style: rasterStyle(currentTheme()) as never,
        center: init ? [init.lng, init.lat] : FALLBACK,
        zoom: 10,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.AttributionControl({ compact: true }));

      // Basemap follows the app theme (markers are DOM overlays → survive setStyle).
      observer = new MutationObserver(() => map.setStyle(rasterStyle(currentTheme()) as never));
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      map.on("load", () => !cancelled && setReady(true));
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      for (const m of markers.values()) m.remove();
      markers.clear();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setReady(false);
    };
  }, []);

  // 2) (Re)build markers only when the point SET changes — never on hover.
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = glRef.current;
    if (!ready || !map || !maplibregl) return;
    const pts = pointsRef.current;

    for (const m of markersRef.current.values()) m.remove();
    markersRef.current.clear();

    for (const p of pts) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", p.title);
      el.className = pillClass("default");
      el.textContent = p.price ?? p.title;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current?.(p);
      });
      el.addEventListener("mouseenter", () => onHoverRef.current?.(p));
      el.addEventListener("mouseleave", () => onHoverRef.current?.(null));
      const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
      markersRef.current.set(p.id, marker);
    }

    if (pts.length > 1) {
      const b = new maplibregl.LngLatBounds();
      pts.forEach((p) => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: 64, maxZoom: 13 });
    } else if (pts.length === 1) {
      map.setCenter([pts[0].lng, pts[0].lat]);
      map.setZoom(13);
    }
  }, [ready, pointsKey]);

  // 3) Toggle marker classes on selection/hover — no map/marker rebuild.
  useEffect(() => {
    for (const [id, marker] of markersRef.current) {
      const state = id === selectedId ? "selected" : id === hoveredId ? "hovered" : "default";
      marker.getElement().className = pillClass(state);
    }
  }, [selectedId, hoveredId, ready, pointsKey]);

  return <div ref={ref} className={className} />;
}
