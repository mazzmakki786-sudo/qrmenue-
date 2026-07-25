/**
 * One-time migration: Update all existing restaurant slugs to clean name-based slugs.
 *
 * Run with: node scripts/migrate-slugs.mjs
 *
 * For each restaurant (ordered by creation date):
 * 1. Compute clean slug from restaurant name using slugify
 * 2. Store current slug in old_slug column
 * 3. If clean slug is taken (by another restaurant or reserved), append city or number
 * 4. Update the slug
 */

import { createClient } from "@supabase/supabase-js";

// Load env vars
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jmmabpcztpfdycogjajk.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY env var is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Reserved slugs (same as lib/slug.ts)
const RESERVED_SLUGS = new Set([
  "login", "signup", "auth", "api",
  "cart", "checkout", "favorites", "account", "restaurants", "menu", "faq",
  "order-confirm", "orders",
  "dashboard", "superadmin",
  "blog", "pricing", "about", "contact", "privacy", "terms",
  "best-digital-menu-for-restaurants",
  "digital-menu-app",
  "digital-menu-design",
  "digital-menu-for-restaurants",
  "digital-menu-for-restaurants-in-faisalabad",
  "digital-menu-for-restaurants-in-islamabad",
  "digital-menu-for-restaurants-in-karachi",
  "digital-menu-for-restaurants-in-lahore",
  "digital-menu-for-restaurants-in-multan",
  "digital-menu-for-restaurants-in-peshawar",
  "digital-menu-for-restaurants-in-rawalpindi",
  "digital-menu-pdf",
  "digital-menu-qr-code",
  "digital-menu-tablet",
  "free-digital-menu",
  "qr-code-menu-free",
  "qr-code-restaurant-menu",
  "qr-menu-app",
  "qr-menu-login",
  "scan-menu-code-online-free",
]);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Fetch existing clean slugs to check against
const existingSlugs = new Set();
const seenNames = new Map(); // name_lower -> count (for duplicates that don't have city)

async function migrate() {
  // First, add old_slug column
  console.log("Adding old_slug column...");
  const { error: alterError } = await supabase.rpc("exec_sql", {
    sql: `ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS old_slug TEXT;`,
  }).catch(() => ({ error: null }));

  if (alterError) {
    console.log("Trying direct SQL for adding column...");
    // Fallback: use raw query
    const { error } = await supabase.from("restaurants").select("id").limit(1);
    if (error) {
      console.error("Could not add column:", error.message);
      process.exit(1);
    }
    console.log("Column likely already exists, continuing...");
  }

  // Fetch all existing slugs to avoid conflicts
  const { data: allRestaurants, error: fetchError } = await supabase
    .from("restaurants")
    .select("id, name, slug, city, created_at")
    .order("created_at", { ascending: true });

  if (fetchError) {
    console.error("Failed to fetch restaurants:", fetchError);
    process.exit(1);
  }

  console.log(`Found ${allRestaurants.length} restaurants to migrate`);

  // Pre-populate existing slugs set with current slugs (minus timestamp suffix)
  // Actually, we track all currently-used clean slugs
  for (const r of allRestaurants) {
    const cleanBase = slugify(r.name);
    if (cleanBase && !r.slug.includes("-")) {
      // Already clean? Still track it
      existingSlugs.add(r.slug);
    }
  }

  let updated = 0;
  let errors = 0;

  for (const restaurant of allRestaurants) {
    const oldSlug = restaurant.slug;

    // Skip if already a clean slug (no timestamp pattern like -xxxxxx at end)
    const isClean = !/_[a-z0-9]{5,}$/.test(oldSlug) && !/-[a-z0-9]{6,}$/.test(oldSlug);

    const base = slugify(restaurant.name || "");
    if (!base) {
      console.log(`  SKIP: "${restaurant.name}" (empty after slugify) — keeping "${oldSlug}"`);
      continue;
    }

    // If already clean AND matches the name, skip
    if (isClean && (oldSlug === base || oldSlug.startsWith(base + "-") && !/-[a-z0-9]{6,}$/.test(oldSlug))) {
      console.log(`  SKIP: "${restaurant.name}" — already clean: "${oldSlug}"`);
      continue;
    }

    // Generate new clean slug
    let newSlug = base;

    // Check reserved
    if (RESERVED_SLUGS.has(newSlug)) {
      const withCity = restaurant.city ? `${base}-${slugify(restaurant.city)}` : null;
      if (withCity && !RESERVED_SLUGS.has(withCity) && !existingSlugs.has(withCity)) {
        newSlug = withCity;
      } else {
        let i = 1;
        while (existingSlugs.has(withCity ? `${withCity}-${i}` : `${base}-${i}`) ||
               RESERVED_SLUGS.has(withCity ? `${withCity}-${i}` : `${base}-${i}`)) {
          i++;
        }
        newSlug = withCity ? `${withCity}-${i}` : `${base}-${i}`;
      }
    } else if (existingSlugs.has(newSlug)) {
      // Check with city first
      if (restaurant.city) {
        const withCity = `${base}-${slugify(restaurant.city)}`;
        if (!existingSlugs.has(withCity) && !RESERVED_SLUGS.has(withCity)) {
          newSlug = withCity;
        } else {
          // City also taken, add number
          let i = 1;
          while (existingSlugs.has(`${withCity}-${i}`)) i++;
          newSlug = `${withCity}-${i}`;
        }
      } else {
        // No city, add number
        let i = 1;
        while (existingSlugs.has(`${base}-${i}`)) i++;
        newSlug = `${base}-${i}`;
      }
    }

    // Update the restaurant
    const { error: updateError } = await supabase
      .from("restaurants")
      .update({ slug: newSlug, old_slug: oldSlug })
      .eq("id", restaurant.id);

    if (updateError) {
      console.log(`  ERROR: "${restaurant.name}" (${restaurant.id}): ${updateError.message}`);
      errors++;
    } else {
      console.log(`  OK: "${restaurant.name}" → "${oldSlug}" → "${newSlug}"`);
      existingSlugs.add(newSlug);
      updated++;
    }
  }

  console.log(`\nDone! ${updated} updated, ${errors} errors`);
}

migrate().catch(console.error);
