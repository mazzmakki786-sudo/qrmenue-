import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("company_settings")
    .select("*")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const settings: Record<string, string> = {}
  data.forEach((s: any) => { settings[s.key] = s.value })
  return NextResponse.json({ settings })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  for (const [key, value] of Object.entries(body)) {
    await supabase
      .from("company_settings")
      .upsert({ key, value: String(value) }, { onConflict: "key" })
  }

  return NextResponse.json({ success: true })
}
