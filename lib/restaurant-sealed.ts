import { GRACE_PERIOD_DAYS } from "./subscription"

interface SealedCheckRestaurant {
  plan: string
  plan_end_date: string | null
  trial_end: string | null
}

export function isRestaurantSealed(r: SealedCheckRestaurant): boolean {
  const now = new Date()

  if (r.plan === "trial" && r.trial_end) {
    const trialEnd = new Date(r.trial_end)
    const graceEnd = new Date(trialEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
    return now > graceEnd
  }

  if (r.plan !== "trial" && r.plan_end_date) {
    const planEnd = new Date(r.plan_end_date)
    return now > planEnd
  }

  return false
}
