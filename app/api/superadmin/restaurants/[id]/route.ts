import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

async function checkAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
    return false
  }
  return true
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("restaurants")
    .select("*, dishes(*), categories(*)")
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  return NextResponse.json({ restaurant: data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  if (!(await checkAuth(supabase))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const admin = createAdminClient()
  const body = await request.json()
  const { data, error } = await admin
    .from("restaurants")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ restaurant: data })
}
