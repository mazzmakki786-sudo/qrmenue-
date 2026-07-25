import { createAdminClient } from "./supabase/server"
import { slugify } from "./utils"

/**
 * Set of reserved slugs that conflict with existing system routes,
 * SEO landing pages, and dynamic catch-all routes.
 */
export const RESERVED_SLUGS = new Set([
  // System & auth pages
  "login", "signup", "auth", "api",
  // Customer routes
  "cart", "checkout", "favorites", "account", "restaurants", "menu", "faq",
  "order-confirm", "orders",
  // Owner routes
  "dashboard",
  // Superadmin
  "superadmin",
  // Blog & content
  "blog", "pricing", "about", "contact", "privacy", "terms",
  // SEO landing pages
  "best-digital-menu-for-restaurants",
  "digital-menu-app",
  "digital-menu-design",
  "digital-menu-for-restaurants",
  "digital-menu-pdf",
  "digital-menu-qr-code",
  "digital-menu-tablet",
  "free-digital-menu",
  "qr-code-menu-free",
  "qr-code-restaurant-menu",
  "qr-menu-app",
  "qr-menu-login",
  "scan-menu-code-online-free",
])

/**
 * Generate a unique, clean slug for a restaurant based on its name.
 *
 * Strategy (in order):
 * 1. Try clean name slug (e.g. "al-habib-grill")
 * 2. If taken or reserved, try with city suffix (e.g. "al-habib-grill-lahore")
 * 3. If still taken, add incrementing number (e.g. "al-habib-grill-lahore-1")
 * 4. Fallback to timestamp-based slug (extremely rare)
 *
 * @param name - Restaurant name
 * @param city - Optional city name for disambiguation
 * @returns A unique slug not in the reserved list and not in the DB
 */
export async function generateRestaurantSlug(
  name: string,
  city?: string | null
): Promise<string> {
  const base = slugify(name)
  if (!base) throw new Error("Invalid restaurant name for slug")

  const admin = createAdminClient()

  // Helper: check if slug is available (not reserved AND not in DB)
  async function isAvailable(slug: string): Promise<boolean> {
    if (RESERVED_SLUGS.has(slug)) return false
    const { data } = await admin
      .from("restaurants")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle()
    return !data
  }

  // 1. Try the clean base slug
  if (await isAvailable(base)) return base

  // 2. Try with city suffix
  if (city) {
    const citySlug = `${base}-${slugify(city)}`
    if (await isAvailable(citySlug)) return citySlug
  }

  // 3. Try incrementing numbers
  for (let i = 1; i <= 100; i++) {
    const numbered = city ? `${base}-${slugify(city)}-${i}` : `${base}-${i}`
    if (await isAvailable(numbered)) return numbered
  }

  // 4. Fallback (extremely unlikely to reach here)
  return `${base}-${Date.now().toString(36)}`
}
