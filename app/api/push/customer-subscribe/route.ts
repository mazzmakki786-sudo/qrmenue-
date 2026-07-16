import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { z } from "zod"
import { safeRoute } from "@/lib/api-error"

const subscribeSchema = z.object({
  customer_id: z.string().uuid(),
  order_id: z.string().uuid(),
  endpoint: z.string().url(),
  p256dh_key: z.string().min(1),
  auth_key: z.string().min(1),
})

export const POST = safeRoute(async (request) => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 })
  }

  if (parsed.data.customer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error: upsertError } = await admin.from("push_subscriptions").upsert({
    customer_id: parsed.data.customer_id,
    order_id: parsed.data.order_id,
    endpoint: parsed.data.endpoint,
    p256dh_key: parsed.data.p256dh_key,
    auth_key: parsed.data.auth_key,
    user_agent: request.headers.get("user-agent") || null,
  }, {
    onConflict: "customer_id, endpoint",
    ignoreDuplicates: false,
  })

  if (upsertError) {
    console.error("[push/customer-subscribe] Upsert error:", upsertError)
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
})
