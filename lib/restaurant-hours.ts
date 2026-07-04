export function formatTo12Hour(time: string | null | undefined): string {
  if (!time) return ""
  const clean = time.includes("T") ? time.split("T")[1] : time
  const parts = clean.split(":")
  if (parts.length < 2) return time
  let hours = parseInt(parts[0], 10)
  if (isNaN(hours)) return time
  const minutes = parts[1]
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${hours}:${minutes} ${ampm}`
}

export function isRestaurantOpen(
  openingTime: string | null | undefined,
  closingTime: string | null | undefined,
  openingHours?: Record<string, { open: string; close: string; closed: boolean }> | null
): boolean {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Check day-based opening_hours first if available
  if (openingHours) {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const todayKey = days[now.getDay()]
    const todayHours = openingHours[todayKey]
    if (todayHours) {
      if (todayHours.closed) return false
      const openParts = todayHours.open.split(":")
      const closeParts = todayHours.close.split(":")
      if (openParts.length >= 2 && closeParts.length >= 2) {
        const openMin = parseInt(openParts[0], 10) * 60 + parseInt(openParts[1], 10)
        const closeMin = parseInt(closeParts[0], 10) * 60 + parseInt(closeParts[1], 10)
        if (!isNaN(openMin) && !isNaN(closeMin)) {
          return currentMinutes >= openMin && currentMinutes <= closeMin
        }
      }
    }
  }

  // Fall back to opening_time / closing_time
  if (openingTime && closingTime) {
    const openClean = openingTime.includes("T") ? openingTime.split("T")[1] : openingTime
    const closeClean = closingTime.includes("T") ? closingTime.split("T")[1] : closingTime
    const openParts = openClean.split(":")
    const closeParts = closeClean.split(":")
    if (openParts.length >= 2 && closeParts.length >= 2) {
      const openMin = parseInt(openParts[0], 10) * 60 + parseInt(openParts[1], 10)
      const closeMin = parseInt(closeParts[0], 10) * 60 + parseInt(closeParts[1], 10)
      if (!isNaN(openMin) && !isNaN(closeMin)) {
        return currentMinutes >= openMin && currentMinutes <= closeMin
      }
    }
  }

  return true
}
