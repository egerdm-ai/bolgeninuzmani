import provincesData from "./provinces.json";
import districtsData from "./districts.json";

// Canonical Türkiye geo loader (static, repo-bundled — NO runtime external API).
// il + ilçe (with centroids) are bundled; mahalle names are lazy-loaded on demand.
// See src/lib/geo/SOURCES.md for sources + licenses. Centroids feed the APPROX pin
// only (D30); exact coordinates are never derived from or stored here.

export type Province = { code: string; name: string; slug: string; lat: number; lng: number };
export type District = { province: string; name: string; slug: string; lat: number; lng: number };
export type Centroid = { lat: number; lng: number };

const provinces = provincesData as Province[];
const districts = districtsData as District[];

/** Turkish-aware slug — MUST match scripts/build-geo-data.mjs (neighborhood keys). */
export function slugify(s: string): string {
  return String(s)
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** All 81 provinces (alphabetical, tr). */
export function listProvinces(): Province[] {
  return provinces;
}

/** Districts of a province (by canonical province name). */
export function listDistricts(province: string): District[] {
  return districts.filter((d) => d.province === province);
}

/**
 * APPROX centroid for a (province, district). District centroid when known, else the
 * province centroid (D30: coarse pin only; mahalle uses the district centroid).
 */
export function getDistrictCentroid(province: string, district: string): Centroid | null {
  const d = districts.find((x) => x.province === province && x.name === district);
  if (d) return { lat: d.lat, lng: d.lng };
  const p = provinces.find((x) => x.name === province);
  return p ? { lat: p.lat, lng: p.lng } : null;
}

let _neighborhoods: Record<string, string[]> | null = null;

/** Mahalle names for a (province, district) — LAZY (loads ~1.3MB chunk on first call). */
export async function listNeighborhoods(province: string, district: string): Promise<string[]> {
  if (!_neighborhoods) {
    _neighborhoods = (await import("./neighborhoods.json")).default as Record<string, string[]>;
  }
  return _neighborhoods[`${slugify(province)}|${slugify(district)}`] ?? [];
}
