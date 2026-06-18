/// <reference types="vite/client" />

// Public, client-readable env (VITE_ prefix). NEVER put secrets here — these
// values are inlined into the browser bundle. Secrets (service-role) are read
// server-side via process.env in *.server.ts files only.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
