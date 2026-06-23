// Client-side image optimization (perf). Every uploaded portfolio photo becomes
// two WebP derivatives — a "display" (≤1600px) and a "thumb" (≤640px) — instead
// of the raw ~4MB file. Cards/lists/gallery-thumbs use the thumb; detail
// cover/lightbox use the display. Cuts page weight ~90% while staying crisp on
// HiDPI card covers (a 640px thumb fills a ~440px retina card without blur).

type Sized = { blob: Blob; width: number; height: number };

async function drawWebp(bmp: ImageBitmap, maxEdge: number, quality: number): Promise<Sized> {
  const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
  const width = Math.max(1, Math.round(bmp.width * scale));
  const height = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D bağlamı yok");
  // High-quality downscale: without this the browser uses a low-quality sampler
  // and shrunk photos look soft/aliased (the "çözünürlük bozuluyor" report).
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new Error("WebP üretilemedi (tarayıcı desteklemiyor olabilir)");
  return { blob, width, height };
}

export type ProcessedImage = { display: Blob; thumb: Blob };

/** Reject oversized inputs early (clear message) instead of crashing the canvas decode. */
const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Decode ONCE (createImageBitmap), then produce display (≤1600px, q0.85) + thumb (≤640px,
 * q0.82) WebP blobs from the SAME bitmap (no second decode) and close it promptly to free
 * memory. Quality is tuned up from the original q0.8/q0.7@400px so cards/lists stay sharp
 * on HiDPI screens. Throws a clear error on oversized / non-image / undecodable files; the
 * caller isolates the failure per image (other images still upload).
 */
export async function processPortfolioImage(file: File): Promise<ProcessedImage> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(`Görsel çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB) — en fazla 25MB`);
  }
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("Görsel çözülemedi (desteklenmeyen veya bozuk dosya olabilir)");
  }
  try {
    const display = await drawWebp(bmp, 1600, 0.85);
    const thumb = await drawWebp(bmp, 640, 0.82);
    return { display: display.blob, thumb: thumb.blob };
  } finally {
    bmp.close();
  }
}

/**
 * Profile avatar → a single ≤512px WebP (q0.85). Same decode-once + high-quality
 * downscale pipeline as portfolio photos, so avatars stay crisp and light.
 */
export async function processAvatarImage(file: File): Promise<Blob> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(`Görsel çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB) — en fazla 25MB`);
  }
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("Görsel çözülemedi (desteklenmeyen veya bozuk dosya olabilir)");
  }
  try {
    const { blob } = await drawWebp(bmp, 512, 0.85);
    return blob;
  } finally {
    bmp.close();
  }
}
