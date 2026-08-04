import { Cache } from "@/lib/cache"

/**
 * Monthly AI poster generation usage counting for plan limits.
 *
 * Mirrors `lib/subscription-usage.ts` (order counting) but resets on a
 * calendar-month boundary instead of plan period: usage = number of
 * `ai_poster_generations` rows for the restaurant created this month with
 * status != 'failed'. Failed attempts don't consume credits — the owner can
 * delete or retry them without penalty.
 *
 * Counts are cached in-memory (10s TTL) and invalidated on every create /
 * delete / retry so the dashboard usage bar stays fresh.
 */

export const aiUsageCache = new Cache<number>("ai-usage")

function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function aiUsageKey(restaurantId: string): string {
  return `usage:${restaurantId}:${monthKey()}`
}

/** ISO timestamp of the first moment of the current month. */
export function getMonthStartISO(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

type AIClient = {
  from: (table: "ai_poster_generations") => any
}

export async function getAiGenerationCount(
  restaurantId: string,
  client: AIClient
): Promise<number> {
  const key = aiUsageKey(restaurantId)
  const cached = aiUsageCache.get(key)
  if (cached !== undefined) return cached

  const { count } = await client
    .from("ai_poster_generations")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .neq("status", "failed")
    .gte("created_at", getMonthStartISO())

  aiUsageCache.set(key, count ?? 0, 10_000)
  return count ?? 0
}

/** Call after creating, deleting, or retrying a generation. */
export function invalidateAiUsage(restaurantId: string): void {
  aiUsageCache.invalidate(aiUsageKey(restaurantId))
}
