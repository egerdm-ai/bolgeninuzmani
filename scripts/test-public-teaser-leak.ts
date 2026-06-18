// Static leak assertion for the Slice 3 public/customer teaser (D13).
// Run: npx tsx scripts/test-public-teaser-leak.ts
// Proves the locked field set never appears in the CODE (comments stripped) of:
//   - the get_public_portfolio RPC body (migration draft)
//   - the public-portfolio.ts type shapes / wrappers
//   - the anon /p/$slug page
// A leak would mean a locked column is named in a public read path.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FORBIDDEN = [
  "portfolio_private",
  "portfolio_documents",
  "exact_address",
  "exact_lat",
  "exact_lng",
  "malik_info",
  "private_description",
  "private_notes",
];

const stripSqlComments = (s: string) => s.replace(/--[^\n]*/g, "");
const stripTsComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

function assertNoForbidden(label: string, code: string) {
  for (const tok of FORBIDDEN) {
    assert.equal(
      code.includes(tok),
      false,
      `LEAK (${label}): forbidden token "${tok}" present in a public read path`,
    );
  }
  console.log(`  ✓ ${label}: no locked tokens`);
}

console.log("public teaser leak assertion (D13):");

// 1) RPC migration — only the get_public_portfolio function BODY (comments stripped).
const migDir = join(root, "supabase/migrations");
const migFile = readdirSync(migDir).find((f) => f.includes("slice3_public_teaser_rpc"));
assert.ok(migFile, "slice3 public teaser RPC migration not found");
const mig = readFileSync(join(migDir, migFile), "utf8");
const start = mig.indexOf("create or replace function public.get_public_portfolio");
const bodyEnd = mig.indexOf("$$;", start);
assert.ok(start >= 0 && bodyEnd > start, "could not locate get_public_portfolio body");
assertNoForbidden("get_public_portfolio body", stripSqlComments(mig.slice(start, bodyEnd)));

// 2) public-portfolio.ts — type shapes + wrappers (comments stripped).
assertNoForbidden(
  "public-portfolio.ts",
  stripTsComments(readFileSync(join(root, "src/lib/data/public-portfolio.ts"), "utf8")),
);

// 3) anon /p/$slug page (comments stripped).
assertNoForbidden(
  "p.$slug.tsx",
  stripTsComments(readFileSync(join(root, "src/routes/p.$slug.tsx"), "utf8")),
);

// 4) get_public_profile body too (defensive).
const ps = mig.indexOf("create or replace function public.get_public_profile");
const pe = mig.indexOf("$$;", ps);
assertNoForbidden("get_public_profile body", stripSqlComments(mig.slice(ps, pe)));

// 5) Keşfet (Slice 5) network list path — must select ONLY teaser (no locked
//    tables). Scope to the listNetworkPortfolios function body (the file also
//    holds getMyPortfolioFull which legitimately reads locked tables for owners).
const portfoliosTs = readFileSync(join(root, "src/lib/data/portfolios.ts"), "utf8");
const nfStart = portfoliosTs.indexOf("export async function listNetworkPortfolios");
const nfEnd = portfoliosTs.indexOf("// Writes (owner-only", nfStart);
assert.ok(nfStart >= 0 && nfEnd > nfStart, "could not locate listNetworkPortfolios body");
assertNoForbidden(
  "listNetworkPortfolios body",
  stripTsComments(portfoliosTs.slice(nfStart, nfEnd)),
);

// 6) Keşfet page itself.
assertNoForbidden(
  "dashboard.search.tsx (Keşfet)",
  stripTsComments(readFileSync(join(root, "src/routes/dashboard.search.tsx"), "utf8")),
);

console.log("\npublic teaser + Keşfet: no locked field leaks ✓");
