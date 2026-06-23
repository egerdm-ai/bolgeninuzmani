import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

// Faz 2.2 — Konum adımı. The owner drops/drags a pin (the EXACT property point) and
// chooses "Tam konum" (reveal) or "Yaklaşık" (coarse + radius circle). This component
// only collects the choice; D30 enforcement is server-side: exact_lat/lng go to
// portfolio_private (locked) and the teaser map reads portfolios.approx_lat/lng, which
// the precision-aware trigger sets to the exact value ONLY when the owner picks "exact".

export type LocationValue = {
  lat: number | null;
  lng: number | null;
  precision: "exact" | "approx";
  radiusKm: number;
};

const FALLBACK: [number, number] = [28.9784, 41.0082]; // Istanbul
const GOLD = "#caa14e";
const TILES = { light: "light_all", dark: "dark_all" } as const;

function rasterStyle(theme: "light" | "dark") {
  return {
    version: 8 as const,
    sources: {
      carto: {
        type: "raster" as const,
        tiles: ["a", "b", "c"].map(
          (s) => `https://${s}.basemaps.cartocdn.com/${TILES[theme]}/{z}/{x}/{y}.png`,
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

/** GeoJSON polygon (64-gon) approximating a radiusKm circle around (lat,lng). */
function circle(lat: number, lng: number, radiusKm: number) {
  const pts = 64;
  const coords: [number, number][] = [];
  const kmPerDegLat = 110.574;
  const kmPerDegLng = 111.32 * Math.cos((lat * Math.PI) / 180) || 111.32;
  for (let i = 0; i <= pts; i++) {
    const t = (i / pts) * 2 * Math.PI;
    coords.push([
      lng + (radiusKm * Math.sin(t)) / kmPerDegLng,
      lat + (radiusKm * Math.cos(t)) / kmPerDegLat,
    ]);
  }
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "Polygon" as const, coordinates: [coords] },
      },
    ],
  };
}

export function LocationPicker({
  value,
  onChange,
  className,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const drawRef = useRef<() => void>(() => {});
  const setPinRef = useRef<(lng: number, lat: number) => void>(() => {});
  onChangeRef.current = onChange;
  valueRef.current = value;
  const [ready, setReady] = useState(false);

  // Create the map ONCE.
  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let ro: ResizeObserver | null = null;
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !ref.current) return;
      const v = valueRef.current;
      const hasPin = v.lat != null && v.lng != null;
      const map = new maplibregl.Map({
        container: ref.current,
        style: rasterStyle(currentTheme()) as never,
        center: hasPin ? [v.lng as number, v.lat as number] : FALLBACK,
        zoom: hasPin ? 14 : 6,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      const placeMarker = (lng: number, lat: number) => {
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          // anchor:"bottom" → the pin TIP points exactly at the coordinate (the default
          // "center" floated the tip ~20px below the real point → the perceived offset).
          const m = new maplibregl.Marker({ draggable: true, color: GOLD, anchor: "bottom" })
            .setLngLat([lng, lat])
            .addTo(map);
          m.on("dragend", () => {
            const p = m.getLngLat();
            onChangeRef.current({ ...valueRef.current, lat: p.lat, lng: p.lng });
          });
          markerRef.current = m;
        }
      };
      // Place + commit together; exposed via ref so the touch-reliable "Merkeze Pin Koy"
      // button can drop the pin at the map center too.
      const setPin = (lng: number, lat: number) => {
        placeMarker(lng, lat);
        onChangeRef.current({ ...valueRef.current, lat, lng });
      };
      setPinRef.current = setPin;
      if (hasPin) placeMarker(v.lng as number, v.lat as number);

      // 'click' fires for a mouse click AND a touch tap → single-tap placement on mobile.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("click", (e: any) => setPin(e.lngLat.lng, e.lngLat.lat));

      let appliedTheme = currentTheme();
      observer = new MutationObserver(() => {
        const t = currentTheme();
        if (t === appliedTheme) return;
        appliedTheme = t;
        map.setStyle(rasterStyle(t) as never);
        map.once("styledata", () => drawRef.current()); // re-add fuzz circle after restyle
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      map.on("load", () => {
        if (cancelled) return;
        map.resize(); // the container may have settled after init → fixes the projection
        setReady(true);
      });

      // Late layout / mobile orientation / card reflow → keep the projection correct so
      // the pin never drifts from the tapped point or jumps after a resize.
      if (typeof ResizeObserver !== "undefined" && ref.current) {
        ro = new ResizeObserver(() => mapRef.current?.resize());
        ro.observe(ref.current);
      }
    })();
    return () => {
      cancelled = true;
      observer?.disconnect();
      ro?.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // Draw / update the fuzz circle (approx only) whenever pin / precision / radius change.
  useEffect(() => {
    const draw = () => {
      const map = mapRef.current;
      if (!map || !map.isStyleLoaded()) return;
      const v = valueRef.current;
      const show = v.precision === "approx" && v.lat != null && v.lng != null;
      const data = show
        ? circle(v.lat as number, v.lng as number, v.radiusKm)
        : { type: "FeatureCollection" as const, features: [] };
      const src = map.getSource("fuzz");
      if (src) {
        src.setData(data);
      } else if (show) {
        map.addSource("fuzz", { type: "geojson", data });
        map.addLayer({
          id: "fuzz-fill",
          type: "fill",
          source: "fuzz",
          paint: { "fill-color": GOLD, "fill-opacity": 0.15 },
        });
        map.addLayer({
          id: "fuzz-line",
          type: "line",
          source: "fuzz",
          paint: { "line-color": GOLD, "line-width": 1.5 },
        });
      }
    };
    drawRef.current = draw;
    if (ready) draw();
  }, [ready, value.precision, value.radiusKm, value.lat, value.lng]);

  // Touch-reliable placement: pan so the target is under the center crosshair, then
  // drop the pin at the map center (no precise tap needed — fixes mobile discoverability).
  const placeAtCenter = () => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    setPinRef.current(c.lng, c.lat);
  };
  const hasPin = value.lat != null && value.lng != null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div
          ref={ref}
          className="h-80 w-full overflow-hidden rounded-xl border border-border sm:h-96"
        />
        {/* Center crosshair → shows exactly where "Merkeze Pin Koy" drops the tip. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Crosshair className="size-6 text-gold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
        </div>
        {!hasPin && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3">
            <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-center text-xs font-medium text-foreground shadow-elegant ring-1 ring-inset ring-border">
              <MapPin className="size-3.5 shrink-0 text-gold" /> Haritaya dokunun ya da “Merkeze Pin
              Koy”
            </span>
          </div>
        )}
      </div>

      {/* Touch-reliable placement + drag hint. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={placeAtCenter}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 px-3 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
        >
          <Crosshair className="size-4" /> Merkeze Pin Koy
        </button>
        {hasPin && (
          <span className="text-[11px] text-muted-foreground">
            Pin'i sürükleyerek (mobilde basılı tutup kaydırarak) taşıyabilirsiniz.
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <PrecisionOption
          active={value.precision === "exact"}
          onClick={() => onChange({ ...value, precision: "exact" })}
          title="Tam konum"
          desc="Haritada gerçek nokta gösterilir."
        />
        <PrecisionOption
          active={value.precision === "approx"}
          onClick={() => onChange({ ...value, precision: "approx" })}
          title="Yaklaşık"
          desc="Coarse pin + çap dairesi; tam konum gizli kalır."
        />
      </div>

      {value.precision === "approx" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Çap (yaklaşık alan)</span>
            <span className="text-xs font-medium text-foreground">{value.radiusKm} km</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={value.radiusKm}
            onChange={(e) => onChange({ ...value, radiusKm: Number(e.target.value) })}
            className="w-full accent-gold"
          />
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {value.precision === "exact"
          ? "Tam konum: teaser haritasında gerçek nokta görünür."
          : "Yaklaşık: teaser yalnızca çap dairesini görür; tam koordinat kilitli kalır (D30)."}
      </p>
    </div>
  );
}

function PrecisionOption({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-gold/60 bg-gold/[0.06]"
          : "border-border bg-surface-2 hover:border-border-strong",
      )}
    >
      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-full border",
            active ? "border-gold bg-gold" : "border-border-strong",
          )}
        >
          {active && <span className="size-1.5 rounded-full bg-primary-foreground" />}
        </span>
        {title}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}
