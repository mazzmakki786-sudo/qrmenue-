import { Cache } from "@/lib/cache"

/**
 * Monthly AI poster generation usage for plan limits.
 *
 * Usage is a MONOTONIC counter stored on the restaurant
 * (`restaurants.ai_credits_used`), incremented once when a generation
 * SUCCEEDS. Deleting a poster does NOT decrement it, so the owner cannot
 * delete old posters to get credits back.
 *
 * Counter is cached in-memory (10s TTL) and invalidated on create / delete /
 * retry so the dashboard usage bar stays fresh.
 */

export const aiUsageCache = new Cache<number>("ai-usage")

function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function aiUsageKey(restaurantId: string): string {
  return `usage:${restaurantId}:${monthKey()}`
}

type AIClient = {
  from: (table: "restaurants") => any
}

export async function getAiGenerationCount(
  restaurantId: string,
  client: AIClient
): Promise<number> {
  const key = aiUsageKey(restaurantId)
  const cached = aiUsageCache.get(key)
  if (cached !== undefined) return cached

  const { data } = await client
    .from("restaurants")
    .select("ai_credits_used")
    .eq("id", restaurantId)
    .maybeSingle()

  const value = data?.ai_credits_used ?? 0
  aiUsageCache.set(key, value, 10_000)
  return value
}

/**
 * Atomically increment the restaurant's credit counter and return the new
 * value. Runs on the admin (service-role) client so it works regardless of
 * the caller's RLS.
 */
export async function incrementAiUsage(
  restaurantId: string,
  adminClient: AIClient
): Promise<number> {
  const { data } = await adminClient
    .from("restaurants")
    .select("ai_credits_used")
    .eq("id", restaurantId)
    .single()
  const next = (data?.ai_credits_used ?? 0) + 1
  await adminClient
    .from("restaurants")
    .update({ ai_credits_used: next })
    .eq("id", restaurantId)
  invalidateAiUsage(restaurantId)
  return next
}

/** Call after creating, deleting, or retrying a generation. */
export function invalidateAiUsage(restaurantId: string): void {
  aiUsageCache.invalidate(aiUsageKey(restaurantId))
}
