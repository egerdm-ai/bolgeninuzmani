// Single source of truth for the PUBLIC site origin used in shareable links + OG urls.
//
// VITE_PUBLIC_ORIGIN is the canonical deploy domain (e.g. https://bolgeninuzmani.com or
// the Vercel URL). Set it in .env / the deploy env. On the client it falls back to
// window.location.origin; on the SERVER (SSR / OG og:url) there is no window, so the env
// var is REQUIRED for correct absolute urls — otherwise og:url is left empty.

const ENV_ORIGIN = (import.meta.env.VITE_PUBLIC_ORIGIN as string | undefined)?.replace(/\/$/, "");

/** Absolute public origin (no trailing slash). "" if unknown on the server. */
export const PUBLIC_ORIGIN: string =
  ENV_ORIGIN ?? (typeof window !== "undefined" ? window.location.origin : "");

/** Build an absolute public URL for a path like "/p/foo" (safe when origin is unknown). */
export function publicUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${PUBLIC_ORIGIN}${p}`;
}
