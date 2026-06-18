// Automated guard test for the attribute registry (D33).
// Run: npx tsx scripts/test-portfolio-attributes.ts
// Proves a LOCKED key can never land in the public bag, and the hard guard
// rejects any attempt to write a locked key into portfolios.attributes.
import assert from "node:assert/strict";
import {
  splitAttributes,
  assertNoLockedInPublic,
  attributeVisibility,
} from "../src/lib/portfolio-attributes.ts";

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

console.log(`\n${passed} checks passed ✓`);
