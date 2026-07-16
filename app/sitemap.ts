import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { blogSlugs, publicRoutes, baseUrl } from "@/lib/blog-articles"

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

  // Static public pages (not behind auth)
  const staticPages: MetadataRoute.Sitemap = publicRoutes.map(({ path, lastModified }) => ({
    url: path ? `${baseUrl}/${path}` : baseUrl,
    lastModified: new Date(lastModified),
  }))

  // Restaurant menu pages — only if not disabled via env flag
  const noindexAll = process.env.NEXT_PUBLIC_NOINDEX_MENU_PAGES === "true"

  const menuPages: MetadataRoute.Sitemap = !noindexAll
    ? ((await supabase
        .from("restaurants")
        .select("slug, updated_at")
        .eq("is_active", true)
        .eq("is_suspended", false))
        .data ?? [])
        .filter((r) => !testSlugs.has(r.slug))
        .map((r) => ({
          url: `${baseUrl}/menu/${r.slug}`,
          lastModified: new Date(r.updated_at),
        }))
    : []

  // Blog article pages
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date("2026-07-16"),
  }))

  return [...staticPages, ...menuPages, ...blogPages]
}
