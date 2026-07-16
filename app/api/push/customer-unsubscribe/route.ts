import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { z } from "zod"
import { safeRoute } from "@/lib/api-error"

const unsubscribeSchema = z.object({
  customer_id: z.string().uuid(),
  order_id: z.string().uuid(),
})

export const POST = safeRoute(async (request) => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = unsubscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  if (parsed.data.customer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("customer_id", parsed.data.customer_id)
    .eq("order_id", parsed.data.order_id)

  if (error) {
    console.error("[push/customer-unsubscribe] Delete error:", error)
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
})
