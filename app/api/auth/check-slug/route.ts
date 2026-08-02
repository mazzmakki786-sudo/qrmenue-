import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { slugify } from "@/lib/utils"
import { RESERVED_SLUGS } from "@/lib/slug"
import { createAdminClient } from "@/lib/supabase/server"

export const GET = safeRoute(async (req) => {
  const url = new URL(req.url)
  const slugParam = url.searchParams.get("slug")

  if (!slugParam || typeof slugParam !== "string") {
    return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 })
  }

  const clean = slugify(slugParam.toLowerCase())

  if (!clean) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  if (clean.length < 2) {
    return NextResponse.json(
      { available: false, error: "Slug must be at least 2 characters" }
    )
  }

  if (clean.length > 100) {
    return NextResponse.json(
      { available: false, error: "Slug must be under 100 characters" }
    )
  }

  // Check reserved slugs
  if (RESERVED_SLUGS.has(clean)) {
    return NextResponse.json({ available: false, error: "This URL is reserved" })
  }

  // Check DB
  const admin = createAdminClient()
  const { data } = await admin
    .from("restaurants")
    .select("slug")
    .eq("slug", clean)
    .maybeSingle()

  if (data) {
    return NextResponse.json({ available: false, error: "This URL is already taken" })
  }

  return NextResponse.json({ available: true, slug: clean })
})
