/**
 * Extracts the HH:MM portion from various time formats.
 * Handles DB `time` columns ("09:00:00"), ISO strings with T ("2024-01-01T09:00:00"),
 * and raw "HH:MM" strings.
 */
function extractTime(time: string | null | undefined): string | null {
  if (!time) return null
  const clean = time.includes("T") ? time.split("T")[1] : time
  const parts = clean.split(":")
  if (parts.length < 2) return null
  return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
}

/**
 * Parses an "HH:MM" string into total minutes since midnight.
 */
function parseTimeMinutes(time: string): number | null {
  const parts = time.split(":")
  if (parts.length < 2) return null
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

function getPktMinutes(date: Date): number {
  const utcMs = date.getTime()
  const pktMs = utcMs + 5 * 60 * 60 * 1000
  const pktDate = new Date(pktMs)
  return pktDate.getUTCHours() * 60 + pktDate.getUTCMinutes()
}

function getPktDay(date: Date): number {
  const utcMs = date.getTime()
  const pktMs = utcMs + 5 * 60 * 60 * 1000
  const pktDate = new Date(pktMs)
  return pktDate.getUTCDay()
}

export function formatTo12Hour(time: string | null | undefined): string {
  const cleaned = extractTime(time)
  if (!cleaned) return ""
  const [hStr, m] = cleaned.split(":")
  const hours = parseInt(hStr, 10)
  if (isNaN(hours)) return time ?? ""
  const ampm = hours >= 12 ? "PM" : "AM"
  const h12 = hours % 12 || 12
  return `${h12}:${m} ${ampm}`
}

/**
 * Checks if a restaurant is currently open based on its operating hours.
 *
 * Priority order:
 * 1. `opening_hours` JSON (per-day schedule) if provided
 * 2. `opening_time` / `closing_time` fallback (single daily window)
 * 3. Default: open (true) if no timing info is set
 *
 * Uses PKT (UTC+5) timezone. Handles midnight crossover: if closing < opening,
 * the restaurant is considered open until closing time the next morning.
 */
export function isRestaurantOpen(
  openingTime: string | null | undefined,
  closingTime: string | null | undefined,
  openingHours?: Record<string, { open: string; close: string; closed: boolean }> | null
): boolean {
  const now = new Date()
  const currentMinutes = getPktMinutes(now)

  // ── 1. Per-day opening_hours JSON ──
  if (openingHours) {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const todayKey = days[getPktDay(now)]
    const todayHours = openingHours[todayKey]
    if (todayHours) {
      if (todayHours.closed) return false
      const openMin = parseTimeMinutes(todayHours.open)
      const closeMin = parseTimeMinutes(todayHours.close)
      if (openMin !== null && closeMin !== null) {
        // Handle midnight crossover: if closing <= opening, it means next-day
        if (closeMin <= openMin) {
          return currentMinutes >= openMin || currentMinutes <= closeMin
        }
        return currentMinutes >= openMin && currentMinutes <= closeMin
      }
    }
  }

  // ── 2. Legacy opening_time / closing_time fallback ──
  const openTime = extractTime(openingTime)
  const closeTime = extractTime(closingTime)
  if (openTime && closeTime) {
    const openMin = parseTimeMinutes(openTime)
    const closeMin = parseTimeMinutes(closeTime)
    if (openMin !== null && closeMin !== null) {
      // Handle midnight crossover
      if (closeMin <= openMin) {
        return currentMinutes >= openMin || currentMinutes <= closeMin
      }
      return currentMinutes >= openMin && currentMinutes <= closeMin
    }
  }

  // ── 3. No timing info — assume open ──
  return true
}
