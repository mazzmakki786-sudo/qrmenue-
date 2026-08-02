import { NextResponse } from "next/server"
import { safeRoute } from "@/lib/api-error"
import { slugify } from "@/lib/utils"
import { RESERVED_SLUGS } from "@/lib/slug"
import { createAdminClient } from "@/lib/supabase/server"

export const GET = safeRoute(async (req) => {
  const url = new URL(req.url)
  const desired = url.searchParams.get("desired")
  const city = url.searchParams.get("city")

  if (!desired || typeof desired !== "string") {
    return NextResponse.json({ error: "desired parameter is required" }, { status: 400 })
  }

  const base = slugify(desired.toLowerCase())
  if (!base) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch all existing slugs once
  const { data: existingRows } = await admin
    .from("restaurants")
    .select("slug")

  const existing = new Set(existingRows?.map((r: { slug: string }) => r.slug) ?? [])
  const suggestions: string[] = []

  // 1. Try base-1, base-2, base-3
  for (let i = 1; i <= 5 && suggestions.length < 5; i++) {
    const candidate = `${base}-${i}`
    if (!existing.has(candidate) && !RESERVED_SLUGS.has(candidate)) {
      suggestions.push(candidate)
    }
  }

  // 2. If city provided, try base-city
  if (suggestions.length < 5 && city) {
    const citySlug = `${base}-${slugify(city)}`
    if (!existing.has(citySlug) && !RESERVED_SLUGS.has(citySlug)) {
      suggestions.push(citySlug)
    }
  }

  // 3. Try base-city-1 etc.
  if (suggestions.length < 5 && city) {
    const citySlug = `${base}-${slugify(city)}`
    for (let i = 1; i <= 5 && suggestions.length < 5; i++) {
      const candidate = `${citySlug}-${i}`
      if (!existing.has(candidate) && !RESERVED_SLUGS.has(candidate)) {
        suggestions.push(candidate)
      }
    }
  }

  return NextResponse.json({ suggestions })
})
