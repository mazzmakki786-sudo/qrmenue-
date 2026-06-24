import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { SUPER_ADMIN_EMAIL, checkRateLimit, logAudit, getIp } from "@/lib/superadmin-security"
import { csrfGuard } from "@/lib/csrf"
import { invalidatePlansCache } from "@/lib/subscription-db"

async function checkAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) return false
  return true
}

export const PATCH = safeRoute(async (request, { params }) => {
  const csrfResponse = csrfGuard(request); if (csrfResponse) return csrfResponse
  const ip = getIp(request)
  if (!await checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { slug } = await params
  const body = await request.json()

  const allowedFields = [
    "name", "price_pkr", "max_dishes", "max_images", "max_orders",
    "max_categories", "analytics", "custom_branding", "can_have_qr",
    "can_have_whatsapp", "description", "sort_order", "is_active"
  ]

  const updates: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (allowedFields.includes(key)) {
      updates[key] = value
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("plans")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  await logAudit(user?.email || "", "plan_updated", { slug, fields: Object.keys(updates) })

  // Invalidate plans cache so next request picks up new data
  invalidatePlansCache()

  return NextResponse.json({ plan: data })
})
