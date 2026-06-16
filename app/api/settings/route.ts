import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limiter"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const allowed = await rateLimit(ip, 15, 60)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("company_settings")
    .select("key, value")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const settings: Record<string, string> = {}
  ;(data || []).forEach((s: any) => {
    settings[s.key] = s.value
  })

  return NextResponse.json({ settings }, {
    headers: { "Cache-Control": "no-store" },
  })
}
