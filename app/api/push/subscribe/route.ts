import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { z } from "zod"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"

const subscribeSchema = z.object({
  restaurant_id: z.string().uuid(),
  endpoint: z.string().url(),
  p256dh_key: z.string().min(1),
  auth_key: z.string().min(1),
})

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error("[push/subscribe] Auth error:", authError)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    console.error("[push/subscribe] Invalid data:", parsed.error.flatten())
    return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 })
  }

  const { data: restaurant, error: restError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", parsed.data.restaurant_id)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (restError || !restaurant) {
    console.error("[push/subscribe] Restaurant check failed:", restError)
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  const admin = createAdminClient()
  const { error: upsertError } = await admin.from("push_subscriptions").upsert({
    restaurant_id: parsed.data.restaurant_id,
    endpoint: parsed.data.endpoint,
    p256dh_key: parsed.data.p256dh_key,
    auth_key: parsed.data.auth_key,
    user_agent: request.headers.get("user-agent") || null,
  }, {
    onConflict: "restaurant_id, endpoint",
    ignoreDuplicates: false,
  })

  if (upsertError) {
    console.error("[push/subscribe] Upsert error:", upsertError)
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
})
