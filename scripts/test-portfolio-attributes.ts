// Automated guard test for the attribute registry (D33).
// Run: npx tsx scripts/test-portfolio-attributes.ts
// Proves a LOCKED key can never land in the public bag, and the hard guard
// rejects any attempt to write a locked key into portfolios.attributes.
import assert from "node:assert/strict";
import {
  splitAttributes,
  assertNoLockedInPublic,
  attributeVisibility,
  attributeDef,
  attributesForCategory,
  PORTFOLIO_ATTRIBUTES,
  PUBLIC_ATTRIBUTES,
  LOCKED_ATTRIBUTES,
  ROOM_COUNTS,
  DEPRECATED_ATTRIBUTE_KEYS,
} from "../src/lib/portfolio-attributes.ts";

const sampleValue = (type: string) => (type === "boolean" ? true : type === "number" ? 1 : "x");

let passed = 0;
const ok = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
};

console.log("attribute registry guard (D33):");

ok("public key (cephe) routes to publicAttrs only", () => {
  const { publicAttrs, lockedAttrs } = splitAttributes({ cephe: "guney" });
  assert.equal(publicAttrs.cephe, "guney");
  assert.equal("cephe" in lockedAttrs, false);
});

ok("locked key (daire_no) routes to lockedAttrs, NEVER publicAttrs", () => {
  const { publicAttrs, lockedAttrs } = splitAttributes({ daire_no: "12", bina_site_adi: "X" });
  assert.equal(lockedAttrs.daire_no, "12");
  assert.equal(lockedAttrs.bina_site_adi, "X");
  assert.equal("daire_no" in publicAttrs, false);
  assert.equal("bina_site_adi" in publicAttrs, false);
});

ok("mixed input splits correctly", () => {
  const { publicAttrs, lockedAttrs } = splitAttributes({
    cephe: "kuzey",
    aidat: 1500,
    daire_no: "3",
  });
  assert.deepEqual(Object.keys(publicAttrs).sort(), ["aidat", "cephe"]);
  assert.deepEqual(Object.keys(lockedAttrs), ["daire_no"]);
});

ok("empty/null values are dropped", () => {
  const { publicAttrs } = splitAttributes({ cephe: "", kat: null });
  assert.equal(Object.keys(publicAttrs).length, 0);
});

ok("unknown key throws (registry is the only source of truth)", () => {
  assert.throws(() => splitAttributes({ gizli_alan: "x" }), /Bilinmeyen özellik/);
});

ok("assertNoLockedInPublic throws if a locked key is in the public bag", () => {
  assert.throws(() => assertNoLockedInPublic({ daire_no: "12" }), /Güvenlik ihlali/);
});

ok("assertNoLockedInPublic passes for a clean public bag", () => {
  assert.doesNotThrow(() => assertNoLockedInPublic({ cephe: "guney", aidat: 1500 }));
});

ok("registry visibility lookups are correct", () => {
  assert.equal(attributeVisibility("cephe"), "public");
  assert.equal(attributeVisibility("daire_no"), "locked");
  assert.equal(attributeVisibility("nope"), undefined);
});

// ---- D40 expanded registry: generic coverage of ALL fields ----

ok("EVERY locked key routes to lockedAttrs, NEVER publicAttrs (full sweep)", () => {
  const input = Object.fromEntries(LOCKED_ATTRIBUTES.map((a) => [a.key, sampleValue(a.type)]));
  const { publicAttrs, lockedAttrs } = splitAttributes(input);
  for (const a of LOCKED_ATTRIBUTES) {
    assert.equal(a.key in lockedAttrs, true, `${a.key} should be locked`);
    assert.equal(a.key in publicAttrs, false, `${a.key} must NOT be public`);
  }
});

ok("assertNoLockedInPublic throws for EVERY locked key individually", () => {
  for (const a of LOCKED_ATTRIBUTES) {
    assert.throws(
      () => assertNoLockedInPublic({ [a.key]: sampleValue(a.type) }),
      /Güvenlik ihlali/,
      `${a.key} must be rejected from the public bag`,
    );
  }
});

ok("EVERY public key routes to publicAttrs (full sweep) + guard passes", () => {
  const input = Object.fromEntries(PUBLIC_ATTRIBUTES.map((a) => [a.key, sampleValue(a.type)]));
  const { publicAttrs, lockedAttrs } = splitAttributes(input);
  for (const a of PUBLIC_ATTRIBUTES) {
    assert.equal(a.key in publicAttrs, true, `${a.key} should be public`);
    assert.equal(a.key in lockedAttrs, false);
  }
  assert.doesNotThrow(() => assertNoLockedInPublic(publicAttrs));
});

ok("new locked identity keys are present + locked", () => {
  for (const k of ["ada_no", "parsel_no", "blok", "pafta", "bina_site_adi"]) {
    assert.equal(attributeVisibility(k), "locked", `${k} must be locked`);
  }
});

ok("attributesForCategory filters by category (konut has konut fields, not arsa-only)", () => {
  const konut = attributesForCategory("konut").map((a) => a.key);
  assert.equal(konut.includes("balkon"), true);
  assert.equal(konut.includes("ada_no"), false); // arsa/ticari-only locked key
  const arsa = attributesForCategory("arsa").map((a) => a.key);
  assert.equal(arsa.includes("ada_no"), true);
  assert.equal(arsa.includes("balkon"), false);
});

ok("registry integrity: unique keys + every field has >=1 category", () => {
  const keys = PORTFOLIO_ATTRIBUTES.map((a) => a.key);
  assert.equal(new Set(keys).size, keys.length, "attribute keys must be unique");
  for (const a of PORTFOLIO_ATTRIBUTES) {
    assert.equal(a.categories.length > 0, true, `${a.key} must declare >=1 category`);
  }
});

// ---- Faz 1.3 enum source extensions ----

ok("cephe is a multiselect capped at 3", () => {
  const d = attributeDef("cephe");
  assert.equal(d?.type, "multiselect");
  assert.equal(d?.maxSelect, 3);
});

ok("bulunduğu kat is now a select with floor options", () => {
  const d = attributeDef("kat");
  assert.equal(d?.type, "select");
  assert.equal((d?.options?.length ?? 0) > 10, true);
});

ok("otopark has 'hem açık hem kapalı' + a separate capacity field", () => {
  const d = attributeDef("otopark");
  assert.equal(
    d?.options?.some((o) => o.value === "acik_kapali"),
    true,
  );
  const cap = attributeDef("otopark_kapasite");
  assert.equal(cap?.type, "number");
  assert.equal(cap?.visibility, "public");
});

ok("Yapı Tipi is removed + dropped as deprecated (no throw on legacy rows)", () => {
  assert.equal(attributeDef("yapi_tipi"), undefined);
  assert.equal(DEPRECATED_ATTRIBUTE_KEYS.has("yapi_tipi"), true);
  const { publicAttrs, lockedAttrs } = splitAttributes({ yapi_tipi: "celik", cephe: "guney" });
  assert.equal("yapi_tipi" in publicAttrs, false);
  assert.equal("yapi_tipi" in lockedAttrs, false);
  assert.equal(publicAttrs.cephe, "guney"); // real value still routes through
});

ok("ROOM_COUNTS includes 4+2 and spans 1+0..8+", () => {
  const vals = ROOM_COUNTS.map((r) => r.value);
  for (const v of ["1+0", "4+2", "8+"]) assert.equal(vals.includes(v), true, `${v} missing`);
});

console.log(`\n${passed} checks passed ✓`);
