import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { safeRoute } from "@/lib/api-error"

export const GET = safeRoute(async () => {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[Plans API] Failed to fetch plans:", error)
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 })
  }

  return NextResponse.json({ plans: data })
})
