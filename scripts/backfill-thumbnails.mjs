// One-time backfill: convert EXISTING full-size portfolio images to the new
// WebP display + thumb convention (<uuid>.webp + <uuid>_thumb.webp).
//
// ⚠️ DO NOT run automatically — this WRITES to storage + DB. The repo owner runs
// it once, with the service-role key, after reviewing. New uploads are already
// optimized client-side; this only fixes the ~11 legacy ~4MB images.
//
// Setup:
//   npm i -D sharp
//   export SUPABASE_URL="https://<ref>.supabase.co"
//   export SUPABASE_SERVICE_ROLE_KEY="<service-role key>"   # never commit this
//   node scripts/backfill-thumbnails.mjs
//
// What it does, per portfolio_images row whose path is NOT already .webp:
//   download original → sharp resize → upload <uuid>.webp (display, ≤1600px q80)
//   + <uuid>_thumb.webp (≤400px q70) to the SAME bucket (public or locked) →
//   update the row path to <uuid>.webp → remove the old original.
// Locked images stay in the private bucket (no leak; signed URLs still apply).

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });
const bucketFor = (v) => (v === "locked" ? "portfolio-images-locked" : "portfolio-images");
const thumbPath = (p) => p.replace(/(\.[^./]+)$/, "_thumb$1");

const { data: rows, error } = await sb.from("portfolio_images").select("*");
if (error) throw error;

let done = 0,
  skipped = 0;
for (const img of rows) {
  if (img.path.endsWith(".webp")) {
    skipped++;
    continue;
  }
  const bucket = bucketFor(img.visibility);
  const { data: blob, error: dErr } = await sb.storage.from(bucket).download(img.path);
  if (dErr || !blob) {
    console.warn("indirilemedi, atlandı:", img.path, dErr?.message);
    continue;
  }
  const buf = Buffer.from(await blob.arrayBuffer());
  const display = await sharp(buf)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const thumb = await sharp(buf)
    .rotate()
    .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer();

  const newPath = img.path.replace(/\.[^./]+$/, ".webp");
  await sb.storage
    .from(bucket)
    .upload(newPath, display, { contentType: "image/webp", upsert: true });
  await sb.storage
    .from(bucket)
    .upload(thumbPath(newPath), thumb, { contentType: "image/webp", upsert: true });
  const { error: uErr } = await sb
    .from("portfolio_images")
    .update({ path: newPath })
    .eq("id", img.id);
  if (uErr) throw uErr;
  if (newPath !== img.path) await sb.storage.from(bucket).remove([img.path]);
  done++;
  console.log(
    `ok ${img.id}: ${img.path} → ${newPath} (display ${Math.round(display.length / 1024)}KB, thumb ${Math.round(thumb.length / 1024)}KB)`,
  );
}
console.log(`\nBitti — ${done} dönüştürüldü, ${skipped} zaten webp.`);
