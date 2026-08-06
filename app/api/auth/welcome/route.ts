import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/resend"
import { safeRoute } from "@/lib/api-error"
import { createLogger } from "@/lib/logger"

const log = createLogger("welcome-email")

export const POST = safeRoute(async (request) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()

  // Get restaurant data
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("name, slug")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  // Send welcome email
  try {
    await sendWelcomeEmail({
      name: restaurant.name,
      owner_email: user.email!,
      slug: restaurant.slug,
    })
    log.info("Welcome email sent", { restaurant_id: restaurant.slug, email: user.email })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    log.error("Welcome email failed", { message: err?.message })
    return NextResponse.json({ success: true }) // Don't fail signup over email
  }
})
