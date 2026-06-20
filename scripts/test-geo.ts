// Geo dataset integrity test. Run: npx tsx scripts/test-geo.ts
import assert from "node:assert/strict";
import {
  listProvinces,
  listDistricts,
  getDistrictCentroid,
  listNeighborhoods,
} from "../src/lib/geo/index.ts";

console.log("geo dataset integrity:");

// 1. 81 provinces.
const provinces = listProvinces();
assert.equal(provinces.length, 81, `expected 81 provinces, got ${provinces.length}`);
console.log(`  ✓ 81 provinces`);

// 2. district count reasonable (~973).
const totalDistricts = provinces.reduce((n, p) => n + listDistricts(p.name).length, 0);
assert.ok(totalDistricts >= 950 && totalDistricts <= 1000, `district count off: ${totalDistricts}`);
console.log(`  ✓ ${totalDistricts} districts`);

// 3. known district centroids within ±0.4° of the real location.
const near = (a: number, b: number) => Math.abs(a - b) <= 0.4;
const known: [string, string, number, number][] = [
  ["İstanbul", "Kadıköy", 40.99, 29.03],
  ["Muğla", "Bodrum", 37.04, 27.43],
  ["Ankara", "Çankaya", 39.92, 32.86],
  ["İzmir", "Konak", 38.42, 27.13],
];
for (const [prov, dist, lat, lng] of known) {
  const c = getDistrictCentroid(prov, dist);
  assert.ok(c, `${prov}/${dist}: no centroid`);
  assert.ok(
    near(c.lat, lat) && near(c.lng, lng),
    `${prov}/${dist}: centroid ${c.lat},${c.lng} not near ${lat},${lng}`,
  );
  console.log(`  ✓ ${prov}/${dist} centroid ≈ ${c.lat}, ${c.lng}`);
}

// 4. province-centroid fallback for an unknown district.
const fb = getDistrictCentroid("İstanbul", "YokBöyleBirİlçe");
assert.ok(fb && near(fb.lat, 41.0) && fb.lng > 27 && fb.lng < 30, "province fallback failed");
console.log(`  ✓ unknown district → province centroid fallback`);

// 5. lazy mahalle list non-empty for a populous district.
const m = await listNeighborhoods("İstanbul", "Kadıköy");
assert.ok(m.length > 0, "Kadıköy has no mahalle");
console.log(`  ✓ İstanbul/Kadıköy mahalle: ${m.length}`);

console.log("\ngeo dataset: OK");
