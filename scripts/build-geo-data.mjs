// Build-time generator for the canonical Türkiye geo dataset (src/lib/geo/*.json).
// Run ONCE (not at runtime): `node scripts/build-geo-data.mjs`. It reads two MIT
// sources (downloaded to /tmp) and normalizes them to one canonical shape:
//   - provinces.json      [{ code, name, slug, lat, lng }]                (81, bundled)
//   - districts.json      [{ province, name, slug, lat, lng }]           (~973, bundled)
//   - neighborhoods.json  { "<provSlug>|<distSlug>": ["Mahalle", ...] }  (lazy-loaded)
//
// Sources (see src/lib/geo/SOURCES.md): ttezer/turkiye-harita-verisi (MIT) for il+ilçe
// names + centroids; AlperKocanx/...2022 (MIT, AdresListesi.csv) for mahalle names.
// No runtime dependency on these — only the generated JSON is committed.
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "src/lib/geo");
fs.mkdirSync(OUT, { recursive: true });

// Turkish-aware slug (lowercase tr + ASCII fold + hyphenate) for stable join keys.
const slug = (s) =>
  String(s)
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

// ── 1. ttezer: provinces + districts (with centroids) ──
const provRaw = JSON.parse(fs.readFileSync("/tmp/prov.json", "utf8"));
const distRaw = JSON.parse(fs.readFileSync("/tmp/dist.json", "utf8"));

const provinces = provRaw
  .map((p) => ({
    code: p.plate_code,
    name: p.name,
    slug: slug(p.name),
    lat: +p.centroid.lat.toFixed(5),
    lng: +p.centroid.lon.toFixed(5),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "tr"));

const provNameById = Object.fromEntries(provRaw.map((p) => [p.id, p.name]));
const districts = distRaw
  .map((d) => ({
    province: provNameById[d.parent_id],
    name: d.name,
    slug: slug(d.name),
    lat: +d.centroid.lat.toFixed(5),
    lng: +d.centroid.lon.toFixed(5),
  }))
  .filter((d) => d.province)
  .sort((a, b) => a.province.localeCompare(b.province, "tr") || a.name.localeCompare(b.name, "tr"));

const distKey = new Set(districts.map((d) => `${slug(d.province)}|${d.slug}`));

// ── 2. AlperKocanx CSV: hierarchy → mahalle names per district ──
// Columns: ID;SehirIlceMahalleAdi;UstID;...  (UstID=0 → province; chain to root.)
const csv = fs.readFileSync("/tmp/adres.csv", "utf8").split(/\r?\n/);
const rows = new Map();
for (let i = 1; i < csv.length; i++) {
  const c = csv[i].split(";");
  if (c.length < 3) continue;
  const id = c[0].replace(/^﻿/, "");
  rows.set(id, { name: c[1], ust: c[2] });
}
// ancestry chain [self, parent, ..., province] (stops at ust='0')
const chainOf = (id) => {
  const out = [];
  let cur = id,
    guard = 0;
  while (cur && cur !== "0" && rows.has(cur) && guard++ < 12) {
    out.push(cur);
    cur = rows.get(cur).ust;
  }
  return out;
};

// Clean mahalle names for display: drop a trailing "(MERKEZ)"-style qualifier and
// Türkçe Title Case ("CAFERAĞA (MERKEZ)" → "Caferağa", "19 MAYIS" → "19 Mayıs").
const titleTr = (w) =>
  w ? w.slice(0, 1).toLocaleUpperCase("tr") + w.slice(1).toLocaleLowerCase("tr") : w;
const cleanName = (s) =>
  s
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim()
    .split(/\s+/)
    .map(titleTr)
    .join(" ");

const neigh = {}; // `${provSlug}|${distSlug}` -> Set(names)
for (const [id, r] of rows) {
  const ch = chainOf(id);
  if (ch.length < 3) continue; // province + district + (mahalle or deeper)
  const provName = rows.get(ch[ch.length - 1]).name;
  const distName = rows.get(ch[ch.length - 2]).name;
  const key = `${slug(provName)}|${slug(distName)}`;
  const name = cleanName(r.name);
  if (name) (neigh[key] ??= new Set()).add(name);
}
const neighbourhoods = {};
let withMahalle = 0;
for (const key of Object.keys(neigh).sort()) {
  const list = [...neigh[key]].sort((a, b) => a.localeCompare(b, "tr"));
  neighbourhoods[key] = list;
  if (distKey.has(key)) withMahalle++;
}

// ── 3. write ──
fs.writeFileSync(path.join(OUT, "provinces.json"), JSON.stringify(provinces));
fs.writeFileSync(path.join(OUT, "districts.json"), JSON.stringify(districts));
fs.writeFileSync(path.join(OUT, "neighborhoods.json"), JSON.stringify(neighbourhoods));

const sz = (f) => (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0) + " KB";
console.log(`provinces: ${provinces.length} (${sz("provinces.json")})`);
console.log(`districts: ${districts.length} (${sz("districts.json")})`);
console.log(
  `neighborhoods keys: ${Object.keys(neighbourhoods).length} (${sz("neighborhoods.json")}); ` +
    `${withMahalle}/${districts.length} districts have mahalle`,
);
