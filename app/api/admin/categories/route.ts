import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const categorySchema = z.object({
  restaurant_id: z.string().uuid(),
  name_en: z.string().min(1, "Name is required"),
  name_ur: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", parsed.data.restaurant_id)
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found or unauthorized" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      restaurant_id: parsed.data.restaurant_id,
      name_en: parsed.data.name_en,
      name_ur: parsed.data.name_ur || null,
      sort_order: parsed.data.sort_order || 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ category: data })
}
