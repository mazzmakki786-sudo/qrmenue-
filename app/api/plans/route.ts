import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"
import { checkRateLimit } from "@/lib/superadmin-security"

export const GET = safeRoute(async (request) => {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const allowed = await checkRateLimit(ip)
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ plans: data })
})
