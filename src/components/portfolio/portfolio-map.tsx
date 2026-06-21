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

// IMPORTANT: these classes go on the INNER pill (a child span), NOT on the marker root.
// MapLibre owns the root element's `transform` (translate) for positioning, so the root
// must carry NO transition and NO transform of its own. Putting scale + transitions on the
// child means hover/selected animate smoothly without ever fighting MapLibre's translate
// (which previously caused the pins to sway/lag and look misplaced).
const PILL_BASE =
  "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-elegant ring-1 ring-inset whitespace-nowrap transition-[transform,background-color,color,box-shadow] duration-150";
function pillClass(state: "default" | "hovered" | "selected"): string {
  if (state === "selected")
    return `${PILL_BASE} scale-110 bg-gradient-gold text-primary-foreground ring-gold`;
  if (state === "hovered") return `${PILL_BASE} scale-110 bg-surface-3 text-gold ring-gold/60`;
  return `${PILL_BASE} bg-surface text-gold ring-border-strong`;
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
      // Guard: only call setStyle when the theme ACTUALLY flips, not on every unrelated
      // <html> class mutation (that caused basemap-reload flicker).
      let appliedTheme = currentTheme();
      observer = new MutationObserver(() => {
        const t = currentTheme();
        if (t === appliedTheme) return;
        appliedTheme = t;
        map.setStyle(rasterStyle(t) as never);
      });
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

  // 2) DIFF markers when the point set changes — keep unchanged ones (no teardown/flicker).
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = glRef.current;
    if (!ready || !map || !maplibregl) return;
    const pts = pointsRef.current;
    const present = new Set(pts.map((p) => p.id));
    let membershipChanged = false;

    // Remove markers whose portfolio is no longer in the result set.
    for (const [id, marker] of markersRef.current) {
      if (!present.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        membershipChanged = true;
      }
    }

    // Add new markers; update coords/price on existing ones in place.
    for (const p of pts) {
      const geo = `${p.lng},${p.lat}`; // [lng, lat] for MapLibre
      const text = p.price ?? p.title;
      const existing = markersRef.current.get(p.id);
      if (existing) {
        const root = existing.getElement();
        if (root.dataset.geo !== geo) {
          existing.setLngLat([p.lng, p.lat]);
          root.dataset.geo = geo;
        }
        const pill = root.firstElementChild as HTMLElement | null;
        if (pill && pill.textContent !== text) pill.textContent = text;
      } else {
        // Root = bare positioning wrapper MapLibre controls (NO transition/transform).
        const root = document.createElement("button");
        root.type = "button";
        root.setAttribute("aria-label", p.title);
        root.className = "cursor-pointer border-0 bg-transparent p-0";
        root.dataset.geo = geo;
        // Child = the visible gold price pill (carries scale + transitions safely).
        const pill = document.createElement("span");
        pill.className = pillClass("default");
        pill.textContent = text;
        root.appendChild(pill);
        root.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectRef.current?.(p);
        });
        root.addEventListener("mouseenter", () => onHoverRef.current?.(p));
        root.addEventListener("mouseleave", () => onHoverRef.current?.(null));
        markersRef.current.set(
          p.id,
          new maplibregl.Marker({ element: root }).setLngLat([p.lng, p.lat]).addTo(map),
        );
        membershipChanged = true;
      }
    }

    // Re-fit ONLY when which pins are shown changed (not on price/text-only updates).
    if (membershipChanged) {
      if (pts.length > 1) {
        const b = new maplibregl.LngLatBounds();
        pts.forEach((p) => b.extend([p.lng, p.lat]));
        map.fitBounds(b, { padding: 64, maxZoom: 13 });
      } else if (pts.length === 1) {
        map.setCenter([pts[0].lng, pts[0].lat]);
        map.setZoom(13);
      }
    }
  }, [ready, pointsKey]);

  // 3) Selection/hover → restyle the CHILD pill only (never the root's transform). Raise
  //    the active marker via z-index (z-index ≠ transform, so positioning is untouched).
  useEffect(() => {
    for (const [id, marker] of markersRef.current) {
      const active = id === selectedId || id === hoveredId;
      const state = id === selectedId ? "selected" : id === hoveredId ? "hovered" : "default";
      const root = marker.getElement() as HTMLElement;
      root.style.zIndex = active ? "20" : "";
      const pill = root.firstElementChild as HTMLElement | null;
      if (pill) pill.className = pillClass(state);
    }
  }, [selectedId, hoveredId, ready, pointsKey]);

  return <div ref={ref} className={className} />;
}
