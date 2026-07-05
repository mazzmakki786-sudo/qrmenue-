import { createAdminClient } from "@/lib/supabase/server"

export async function logOwnerAction(
  restaurantId: string,
  ownerId: string,
  action: string,
  details: Record<string, unknown> = {},
  ipAddress = ""
) {
  try {
    const admin = createAdminClient()
    await admin.from("owner_audit_log").insert({
      restaurant_id: restaurantId,
      owner_id: ownerId,
      action,
      details,
      ip_address: ipAddress,
    })
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[owner-audit] Failed to log action:", err)
    }
  }
}

export async function logCustomerAction(
  customerId: string | null,
  action: string,
  details: Record<string, unknown> = {},
  ipAddress = ""
) {
  try {
    const admin = createAdminClient()
    await admin.from("customer_audit_log").insert({
      customer_id: customerId,
      action,
      details,
      ip_address: ipAddress,
    })
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[customer-audit] Failed to log action:", err)
    }
  }
}

export function getIpSimple(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp.trim()

  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()

  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || ""

  return ""
}
