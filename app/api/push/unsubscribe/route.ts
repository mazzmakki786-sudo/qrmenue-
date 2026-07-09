import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { z } from "zod"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"

const unsubscribeSchema = z.object({
  restaurant_id: z.string().uuid(),
  endpoint: z.string().optional(),
})

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = unsubscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", parsed.data.restaurant_id)
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const admin = createAdminClient()
  const query = admin
    .from("push_subscriptions")
    .delete()
    .eq("restaurant_id", parsed.data.restaurant_id)

  if (parsed.data.endpoint) {
    query.eq("endpoint", parsed.data.endpoint)
  }

  const { error } = await query
  if (error) {
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
})
