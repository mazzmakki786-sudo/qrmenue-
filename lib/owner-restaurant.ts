import type { SupabaseClient } from "@supabase/supabase-js"
import { createLogger } from "@/lib/logger"

const log = createLogger("owner-restaurant")

export interface OwnerRestaurantResult {
  /** The owner's canonical restaurant row, or null if they own none. */
  restaurant: any | null
  /** True if a genuinely unexpected query error occurred (vs. a clean "no restaurant"). */
  error?: { code: string | null; message: string }
  /** True when the query returned multiple rows (duplicates) — we still resolved a restaurant. */
  multipleRows?: boolean
}

/**
 * Safely resolve the single restaurant owned by `ownerId`, or null.
 *
 * WHY NOT `.maybeSingle()` / `.single()`:
 * those PostgREST methods return error PGRST116 ("multiple rows") — and set
 * `data` to null — when the query matches MORE THAN ONE row. Any code that
 * only inspects `data` then treats an existing restaurant as "does not exist".
 * Because `restaurants.owner_id` has no DB-level uniqueness in deployed
 * history, an owner can have >1 restaurant row, which broke the whole
 * auth → dashboard chain for those owners.
 *
 * This helper:
 *  - caps the fetch at 2 rows so "multiple" and "not found" are never conflated,
 *  - resolves multiple rows to the first (oldest) one and flags `multipleRows`,
 *  - separates `data === null` (clean "no restaurant") from `error` (query
 *    failed — RLS, network, or real failure) so callers can distinguish
 *    "AUTHENTICATED_NO_RESTAURANT" from "RESTAURANT_QUERY_ERROR".
 */
export async function fetchOwnerRestaurant(
  supabase: SupabaseClient,
  ownerId: string
): Promise<OwnerRestaurantResult> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", ownerId)
    .order("id", { ascending: true })
    .limit(2)

  if (error) {
    log.error("Owner restaurant query failed", {
      owner_id: ownerId,
      code: error.code,
      message: error.message,
    })
    return { restaurant: null, error: { code: error.code, message: error.message } }
  }

  if (!data || data.length === 0) {
    return { restaurant: null }
  }

  if (data.length > 1) {
    log.warn("Owner has multiple restaurants — using the first (oldest)", {
      owner_id: ownerId,
      count: data.length,
      slugs: data.map((r: any) => r.slug),
    })
    return { restaurant: data[0] as any, multipleRows: true }
  }

  return { restaurant: data[0] as any }
}