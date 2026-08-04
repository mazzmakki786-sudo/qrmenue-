import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"
import { csrfGuard } from "@/lib/csrf"
import { safeRoute } from "@/lib/api-error"
import { logOwnerAction, getIpSimple } from "@/lib/owner-audit"
import { invalidateAiUsage } from "@/lib/ai-usage"
import { createLogger } from "@/lib/logger"

const log = createLogger("owner-ai")

export const DELETE = safeRoute(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const csrfResponse = csrfGuard(request)
  if (csrfResponse) return csrfResponse

  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle()
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const admin = createAdminClient()

  const { data: gen } = await admin
    .from("ai_poster_generations")
    .select("id, image_path")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle()
  if (!gen) return NextResponse.json({ error: "Generation not found" }, { status: 404 })

  // Delete image from storage first (best effort)
  if (gen.image_path) {
    const { error: storageError } = await admin.storage
      .from("ai-posters")
      .remove([gen.image_path])
    if (storageError) {
      log.warn("Failed to remove AI poster image", { error: storageError.message })
    }
  }

  const { error: deleteError } = await admin
    .from("ai_poster_generations")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)

  if (deleteError) {
    log.error("Failed to delete AI generation", { error: deleteError.message })
    return NextResponse.json({ error: "Failed to delete generation" }, { status: 400 })
  }

  invalidateAiUsage(restaurant.id)
  logOwnerAction(restaurant.id, user.id, "ai_poster_delete", { generation_id: id }, getIpSimple(request)).catch(console.error)

  return NextResponse.json({ success: true })
})