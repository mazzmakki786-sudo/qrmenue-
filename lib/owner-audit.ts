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

export function getIpSimple(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    ""
  )
}
