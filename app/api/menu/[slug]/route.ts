import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("restaurants")
    .select("*, categories(*, dishes(*))")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  return NextResponse.json({
    restaurant: data,
    categories: data.categories,
    dishes: data.categories.flatMap((c: any) => c.dishes),
  })
}
