// Seeds fake portfolios + searches for testing the address/region/map/match system.
// Regions come from the REAL canonical geo dataset (src/lib/geo) so the geo_districts
// trigger derives a coarse pin for each. Images are intentionally OMITTED (cover-less →
// placeholder) to avoid storage writes; locked PHOTOS need uploads (out of scope).
// Locked FIELDS (exact/malik/private) ARE seeded on some portfolios to test D13.
//
//   SUPABASE_SERVICE_ROLE_KEY=… npx tsx scripts/seed-fake-data.ts
//
// Run scripts/clean-portfolios-searches.ts --confirm FIRST. Service role required
// (creates agents + writes as different owners). The key is read from env, never committed.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { slugify } from "../src/lib/geo/index.ts";
import districts from "../src/lib/geo/districts.json";
import neighborhoods from "../src/lib/geo/neighborhoods.json";

function envVar(name: string): string | undefined {
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
const URL = envVar("SUPABASE_URL") ?? envVar("VITE_SUPABASE_URL");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("HATA: SUPABASE_SERVICE_ROLE_KEY (env) + SUPABASE_URL gerekli.");
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

type Dist = { province: string; name: string; lat: number; lng: number };
const D = districts as Dist[];
const N = neighborhoods as Record<string, string[]>;

// Canonical regions that exist in the dataset (validated below).
const REGION_POOL = (
  [
    ["İstanbul", "Kadıköy"],
    ["İstanbul", "Beşiktaş"],
    ["İstanbul", "Sarıyer"],
    ["Muğla", "Bodrum"],
    ["Muğla", "Fethiye"],
    ["Ankara", "Çankaya"],
    ["İzmir", "Konak"],
    ["İzmir", "Çeşme"],
    ["Antalya", "Muratpaşa"],
    ["Bursa", "Nilüfer"],
  ] as [string, string][]
)
  .map(([province, name]) => {
    const d = D.find((x) => x.province === province && x.name === name);
    if (!d) {
      console.warn(`  ⚠ bölge atlandı (datasette yok): ${province}/${name}`);
      return null;
    }
    const mah = N[`${slugify(province)}|${slugify(name)}`] ?? [];
    return { city: province, district: name, neighborhoods: mah };
  })
  .filter(Boolean) as { city: string; district: string; neighborhoods: string[] }[];

const AGENTS = [
  {
    username: "seed-deniz",
    full_name: "Deniz Yıldız",
    company_name: "Yıldız Gayrimenkul",
    title: "Kıdemli Danışman",
    tier: "elite",
    location: "İstanbul",
    regions: ["Kadıköy", "Beşiktaş"],
    types: ["Konut", "Yalı"],
  },
  {
    username: "seed-elif",
    full_name: "Elif Demir",
    company_name: "Demir Emlak",
    title: "Bölge Uzmanı",
    tier: "pro",
    location: "Muğla",
    regions: ["Bodrum", "Fethiye"],
    types: ["Turizm", "Villa"],
  },
  {
    username: "seed-kerem",
    full_name: "Kerem Aksoy",
    company_name: "Aksoy Realty",
    title: "Danışman",
    tier: "standard",
    location: "Ankara",
    regions: ["Çankaya"],
    types: ["Konut", "Ofis"],
  },
  {
    username: "seed-burcu",
    full_name: "Burcu Şahin",
    company_name: "Ege Mülk",
    title: "Satış Direktörü",
    tier: "pro",
    location: "İzmir",
    regions: ["Konak", "Çeşme"],
    types: ["Konut", "Ticari"],
  },
  {
    username: "seed-mert",
    full_name: "Mert Korkmaz",
    company_name: "Akdeniz Gayrimenkul",
    title: "Danışman",
    tier: "standard",
    location: "Antalya",
    regions: ["Muratpaşa"],
    types: ["Konut", "Arsa"],
  },
];

const FEATURE_POOL = [
  "Deniz Manzarası",
  "Havuz",
  "Otopark",
  "Asansör",
  "Site İçi",
  "Bahçeli",
  "Yeni Bina",
  "Eşyalı",
  "Güvenlik",
];
const rand = <T>(a: T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n);

async function ensureAgent(a: (typeof AGENTS)[number]): Promise<string> {
  const { data: existing } = await sb
    .from("profiles")
    .select("id")
    .eq("username", a.username)
    .maybeSingle();
  let id = existing?.id as string | undefined;
  if (!id) {
    const email = `${a.username}@bolgeninuzmani.test`;
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: "Seed!" + Math.random().toString(36).slice(2, 12),
      email_confirm: true,
      user_metadata: { full_name: a.full_name },
    });
    if (error || !data.user) throw new Error(`agent ${a.username}: ${error?.message}`);
    id = data.user.id;
  }
  await sb
    .from("profiles")
    .update({
      full_name: a.full_name,
      username: a.username,
      status: "verified",
      membership_tier: a.tier,
      title: a.title,
      company_name: a.company_name,
      location: a.location,
      expertise_regions: a.regions,
      expertise_types: a.types,
      bio: `${a.full_name}, ${a.location} bölgesinde ${a.types.join(", ")} alanında uzman.`,
      contact_phone: "+90 5" + Math.floor(300000000 + Math.random() * 99999999),
      contact_whatsapp: "+90 5" + Math.floor(300000000 + Math.random() * 99999999),
      contact_email: `${a.username}@bolgeninuzmani.test`,
    })
    .eq("id", id);
  return id;
}

async function main() {
  console.log("=== SEED — fake data ===");
  console.log("(önce: scripts/clean-portfolios-searches.ts --confirm)\n");

  const agentIds: string[] = [];
  for (const a of AGENTS) {
    agentIds.push(await ensureAgent(a));
    console.log(`  ✓ agent: ${a.username}`);
  }

  // 28 portfolios — varied region / category / transaction / mode / price; ~half locked.
  const CATS = ["konut", "ticari", "arsa", "turizm", "isletme"] as const;
  const TXN = ["satilik", "kiralik"] as const;
  let pCount = 0,
    lockedCount = 0,
    callOnlyCount = 0;
  for (let i = 0; i < 28; i++) {
    const owner = agentIds[i % agentIds.length];
    const r = REGION_POOL[i % REGION_POOL.length];
    const category = CATS[i % CATS.length];
    const transaction = TXN[i % 2];
    const mode = i % 5 === 0 ? "call_only" : "controlled"; // ~6 call_only
    const basePrice =
      category === "arsa" ? 4_000_000 : category === "konut" ? 6_500_000 : 9_000_000;
    const price = Math.round((basePrice * (0.6 + Math.random() * 1.8)) / 50_000) * 50_000;
    const neighborhood = r.neighborhoods.length
      ? r.neighborhoods[i % r.neighborhoods.length]
      : null;
    const locked = mode === "controlled" && i % 3 !== 0; // most controlled get locked fields

    const { data: p, error } = await sb
      .from("portfolios")
      .insert({
        owner_id: owner,
        title: `${r.district} ${category === "konut" ? "Daire" : category === "arsa" ? "Arsa" : category === "turizm" ? "Otel" : "Mülk"} — ${transaction === "satilik" ? "Satılık" : "Kiralık"}`,
        public_description: `${r.city}/${r.district} bölgesinde ${category} portföyü. Detaylar için iletişime geçin.`,
        category,
        transaction_type: transaction,
        price,
        currency: "TRY",
        city: r.city,
        district: r.district,
        neighborhood,
        room_count: category === "konut" ? ["1+1", "2+1", "3+1", "4+1"][i % 4] : null,
        gross_m2: category === "arsa" ? 800 + i * 50 : 90 + i * 5,
        features: rand(FEATURE_POOL, 3),
        status: "active",
        mode,
      })
      .select("id")
      .single();
    if (error || !p) {
      console.error(`  ✗ portföy ${i}: ${error?.message}`);
      continue;
    }
    pCount++;
    if (mode === "call_only") callOnlyCount++;

    if (locked) {
      const d = D.find((x) => x.province === r.city && x.name === r.district)!;
      await sb.from("portfolio_private").insert({
        portfolio_id: p.id,
        exact_address: `${r.district} Mah. ${100 + i}. Sk. No:${1 + (i % 40)}, ${r.city}`,
        exact_lat: d.lat + (Math.random() - 0.5) * 0.01,
        exact_lng: d.lng + (Math.random() - 0.5) * 0.01,
        malik_info: {
          name: `Malik ${i + 1}`,
          phone: "+90 5" + Math.floor(300000000 + Math.random() * 99999999),
        },
        private_description: "Tapu hazır, krediye uygun. Malikle doğrudan görüşülür.",
        private_notes: "Pazarlık payı var.",
      });
      lockedCount++;
    }
  }

  // 10 searches — 6 crafted to MATCH existing portfolios, 4 unlikely to match.
  const SEARCHES = [
    {
      region: REGION_POOL[0],
      category: "konut",
      txn: "satilik",
      min: 3_000_000,
      max: 18_000_000,
      match: true,
    },
    {
      region: REGION_POOL[3],
      category: "turizm",
      txn: "satilik",
      min: 5_000_000,
      max: 30_000_000,
      match: true,
    },
    {
      region: REGION_POOL[5],
      category: "konut",
      txn: "kiralik",
      min: 1_000_000,
      max: 20_000_000,
      match: true,
    },
    {
      region: REGION_POOL[6],
      category: "ticari",
      txn: "satilik",
      min: 4_000_000,
      max: 25_000_000,
      match: true,
    },
    {
      region: REGION_POOL[1],
      category: "konut",
      txn: "satilik",
      min: 2_000_000,
      max: 20_000_000,
      match: true,
    },
    {
      region: REGION_POOL[8],
      category: "arsa",
      txn: "satilik",
      min: 1_000_000,
      max: 15_000_000,
      match: true,
    },
    {
      region: REGION_POOL[2],
      category: "turizm",
      txn: "kiralik",
      min: 100_000,
      max: 300_000,
      match: false,
    },
    {
      region: REGION_POOL[4],
      category: "isletme",
      txn: "satilik",
      min: 50_000_000,
      max: 99_000_000,
      match: false,
    },
    {
      region: REGION_POOL[7],
      category: "arsa",
      txn: "kiralik",
      min: 100_000,
      max: 200_000,
      match: false,
    },
    {
      region: REGION_POOL[9],
      category: "ticari",
      txn: "kiralik",
      min: 10_000,
      max: 50_000,
      match: false,
    },
  ];
  let sCount = 0;
  for (let i = 0; i < SEARCHES.length; i++) {
    const s = SEARCHES[i];
    const owner = agentIds[i % agentIds.length];
    const { error } = await sb.from("searches").insert({
      owner_id: owner,
      title: `${s.region.district} ${s.category} arayışı`,
      transaction_type: s.txn,
      category: s.category,
      city: s.region.city,
      district: s.region.district,
      neighborhood: null,
      budget_min: s.min,
      budget_max: s.max,
      currency: "TRY",
      room_count: s.category === "konut" ? "3+1" : null,
      features: rand(FEATURE_POOL, 2),
      urgency: (["low", "medium", "high"] as const)[i % 3],
      status: "active",
      notes: `Müşteri ${s.region.district} bölgesinde ${s.category} arıyor.`,
    });
    if (error) console.error(`  ✗ arayış ${i}: ${error.message}`);
    else sCount++;
  }

  console.log(
    `\n  portföy: ${pCount} (kilitli alanlı: ${lockedCount}, call_only: ${callOnlyCount})`,
  );
  console.log(`  arayış: ${sCount} (eşleşmesi beklenen: 6)`);
  console.log(
    "  pin'ler geo_districts trigger'ıyla ilçe merkezinden düşer (migration push edilmişse).",
  );
  console.log("\nSeed tamam.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
