// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Deploy target: Vercel. The Lovable wrapper defaults Nitro to cloudflare-module, which
  // emits dist/ (NOT the Build Output API), so Vercel can't find the SSR function → 404.
  // Hard-pin the Vercel preset so `vite build` deterministically emits .vercel/output
  // (config.json + functions/ + static/), independent of any build-time env var.
  nitro: { preset: "vercel" },
});
