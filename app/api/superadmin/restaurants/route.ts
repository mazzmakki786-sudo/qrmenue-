import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ restaurants: data })
}
