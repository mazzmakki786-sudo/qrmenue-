import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { generateRestaurantSlug } from "@/lib/slug"

export const POST = safeRoute(async (req) => {
  const { name, city } = await req.json()

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Restaurant name is required" }, { status: 400 })
  }

  const slug = await generateRestaurantSlug(name, city ?? null)
  return NextResponse.json({ slug })
})
