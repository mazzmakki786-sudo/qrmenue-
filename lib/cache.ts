/**
 * Simple in-memory cache with TTL support.
 *
 * Each serverless Lambda instance has its own cache, so entries are
 * not shared across instances. This is intentional — it avoids external
 * dependencies (Redis, etc.) while still reducing repeated DB queries
 * within the same instance's lifetime.
 *
 * Use short TTLs (5-30s) to balance freshness with cache-hit ratio.
 * For dish prices: 10-30s (prices rarely change mid-order).
 * For restaurant metadata: 5s (plan status needs occasional freshness).
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>()
  private hits = 0
  private misses = 0
  private name: string

  constructor(name = "default") {
    this.name = name
  }

  /**
   * Get a value from cache. Returns undefined if key doesn't exist or TTL expired.
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) {
      this.misses++
      return undefined
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      this.misses++
      return undefined
    }
    this.hits++
    return entry.value
  }

  /**
   * Set a value in cache with a TTL in milliseconds.
   */
  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  /**
   * Remove a specific key from cache.
   */
  invalidate(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clear all entries from this cache instance.
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get cache statistics.
   */
  stats(): { name: string; size: number; hits: number; misses: number; hitRate: string } {
    const total = this.hits + this.misses
    return {
      name: this.name,
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : "0%",
    }
  }
}

// ── Named cache instances ──

/** Cache for restaurant lookups (5s TTL recommended) */
export const restaurantCache = new Cache<Record<string, unknown>>("restaurant")

/** Cache for dish price lookups (10-30s TTL recommended) */
export const dishPriceCache = new Cache<Record<string, number>>("dish-prices")

/** Generic cache for other data */
export const globalCache = new Cache<unknown>("global")
