import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: "https://qrmenu.pk",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://qrmenu.pk/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://qrmenu.pk/restaurants",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://qrmenu.pk/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://qrmenu.pk/signup",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("slug, updated_at")
    .eq("is_active", true)
    .eq("is_suspended", false)

  const menuPages: MetadataRoute.Sitemap =
    restaurants?.map((r) => ({
      url: `https://qrmenu.pk/menu/${r.slug}`,
      lastModified: new Date(r.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })) ?? []

  return [...staticPages, ...menuPages]
}
