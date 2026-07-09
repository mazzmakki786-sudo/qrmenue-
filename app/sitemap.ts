import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"

const testSlugs = new Set([
  "sher-hassan-mq40ywg7",
  "sher-hassan-mptsm32y",
  "maz-makki-mqdd8oml",
  "maki-mr7kg2cu",
  "muhammad-maki-mpwnk0tl",
  "d-muaz-mptu9epf",
])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/restaurants`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ]

  const noindexAll = process.env.NEXT_PUBLIC_NOINDEX_MENU_PAGES === "true"

  let menuPages: MetadataRoute.Sitemap = []

  if (!noindexAll) {
    const { data: restaurants } = await supabase
      .from("restaurants")
      .select("slug, updated_at")
      .eq("is_active", true)
      .eq("is_suspended", false)

    menuPages =
      (restaurants ?? [])
        .filter((r) => !testSlugs.has(r.slug))
        .map((r) => ({
          url: `${baseUrl}/menu/${r.slug}`,
          lastModified: new Date(r.updated_at),
          changeFrequency: "daily" as const,
          priority: 0.9,
        })) ?? []
  }

  return [...staticPages, ...menuPages]
}
