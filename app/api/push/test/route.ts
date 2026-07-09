import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { csrfGuard } from "@/lib/csrf"
import { sendPushNotification } from "@/lib/push-server"

export const POST = safeRoute(async (request) => {
  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()

  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const result = await sendPushNotification(restaurant.id, {
    title: "🔔 Test Notification",
    body: "Push notifications are working! You will now receive alerts for new orders.",
    url: "/dashboard/orders",
    tag: "test-notification",
  })

  return NextResponse.json(result)
})
