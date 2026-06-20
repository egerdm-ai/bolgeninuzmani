// Wipes portfolio + search test data (and everything that hangs off them). Keeps
// profiles / auth users / roles. SERVICE ROLE required (bypasses RLS).
//
//   Dry-run (default, prints what WOULD be deleted):
//     SUPABASE_SERVICE_ROLE_KEY=… npx tsx scripts/clean-portfolios-searches.ts
//   Actually delete:
//     SUPABASE_SERVICE_ROLE_KEY=… npx tsx scripts/clean-portfolios-searches.ts --confirm
//
// The service-role key is read from the environment and is NEVER committed.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(".env", "utf8")
      .split("\n")
      .find((l) => l.startsWith(name + "="));
    return line?.slice(name.length + 1).trim();
  } catch {
    return undefined;
  }
}

const URL = env("SUPABASE_URL") ?? env("VITE_SUPABASE_URL");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // NEVER from .env/code
if (!URL || !KEY) {
  console.error(
    "HATA: SUPABASE_SERVICE_ROLE_KEY (env) + SUPABASE_URL gerekli. Service-role key koda/​.env'e KONULMAZ.",
  );
  process.exit(1);
}

const confirm = process.argv.includes("--confirm");
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// Delete order: children → parents (explicit, not relying on FK cascade). Each entry
// is [table, a NOT NULL column to satisfy supabase-js' required delete filter].
const TABLES: [string, string][] = [
  ["detail_requests", "id"],
  ["portfolio_access_grants", "id"],
  ["portfolio_documents", "id"],
  ["portfolio_images", "id"],
  ["portfolio_private", "portfolio_id"],
  ["saved_portfolios", "user_id"],
  ["portfolios", "id"],
  ["searches", "id"],
  ["notifications", "id"],
  ["follows", "follower_id"],
];
// NOT touched: profiles, auth.users, user_roles, geo_districts, applications.

async function main() {
  console.log(`\n=== TEMİZLİK ${confirm ? "(SİLİNECEK)" : "(DRY-RUN — silinmez)"} ===`);
  console.log("Korunan: profiles, auth users, user_roles, geo_districts, applications\n");

  for (const [table] of TABLES) {
    const { count } = await sb.from(table).select("*", { count: "exact", head: true });
    console.log(`  ${table.padEnd(26)} ${count ?? "?"} satır`);
  }

  if (!confirm) {
    console.log("\nDRY-RUN. Gerçekten silmek için --confirm ekleyin.");
    return;
  }

  console.log("\nSiliniyor…");
  for (const [table, col] of TABLES) {
    const { error } = await sb.from(table).delete().not(col, "is", null);
    if (error) console.error(`  ✗ ${table}: ${error.message}`);
    else console.log(`  ✓ ${table} temizlendi`);
  }
  console.log("\nTemizlik tamam.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
