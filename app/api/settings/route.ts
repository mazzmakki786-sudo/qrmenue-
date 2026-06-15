import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
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
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  })
}
