import { Cache } from "@/lib/cache"

/**
 * Shared order-usage counting for plan limits.
 *
 * Order usage is counted LIVE (no stored counter). To "reset" usage when a
 * restaurant changes plan, we anchor the count to the current plan's start:
 *   - trial plan  → count non-cancelled orders since `trial_start`
 *   - paid plan   → count non-cancelled orders since `plan_start_date`
 *   - no anchor   → all-time count (legacy rows), current behavior
 *
 * Every plan-change path already stamps `plan_start_date = NOW()` and reset-trial
 * stamps `trial_start = NOW()`, so the counter naturally resets on switch — no
 * data is deleted and no migration is required.
 */

/** In-memory cache for order counts (10s TTL). */
export const orderCountCache = new Cache<number>("order-count")

export function orderCountKey(restaurantId: string): string {
  return `count:${restaurantId}`
}

/** Invalidate the cached order count for a restaurant (call after plan change). */
export function invalidateOrderCount(restaurantId: string): void {
  orderCountCache.invalidate(orderCountKey(restaurantId))
}

export type OrderPeriodAnchor = "trial" | "plan" | null

interface OrderPeriodRestaurant {
  plan: string
  trial_start: string | null
  plan_start_date: string | null
}

/**
 * Which date to anchor the order count to.
 * - `"trial"` → count since `trial_start`
 * - `"plan"` → count since `plan_start_date`
 * - `null` → no anchor available, count all-time
 */
export function getOrderPeriodAnchor(restaurant: OrderPeriodRestaurant): OrderPeriodAnchor {
  if (restaurant.plan === "trial" && restaurant.trial_start) {
    return "trial"
  }
  if (restaurant.plan !== "trial" && restaurant.plan_start_date) {
    return "plan"
  }
  return null
}

/**
 * Build a Supabase count query for a restaurant's order usage, scoped to the
 * current plan period. Works with both the browser and server Supabase clients.
 */
export function getOrderCountQuery(
  restaurant: OrderPeriodRestaurant & { id: string },
  client: { from: (table: "orders") => any }
): any {
  const anchor = getOrderPeriodAnchor(restaurant)
  let query = client
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .neq("order_status", "cancelled")

  if (anchor === "trial" && restaurant.trial_start) {
    query = query.gte("created_at", restaurant.trial_start)
  } else if (anchor === "plan" && restaurant.plan_start_date) {
    query = query.gte("created_at", restaurant.plan_start_date)
  }

  return query
}

/**
 * Run the order usage count for a restaurant, with a 10s in-memory cache.
 */
export async function getOrderCountFromDB(
  restaurant: OrderPeriodRestaurant & { id: string },
  client: { from: (table: "orders") => any }
): Promise<number> {
  const cached = orderCountCache.get(orderCountKey(restaurant.id))
  if (cached !== undefined) return cached

  const { count } = await getOrderCountQuery(restaurant, client)
  orderCountCache.set(orderCountKey(restaurant.id), count ?? 0, 10_000)
  return count ?? 0
}
