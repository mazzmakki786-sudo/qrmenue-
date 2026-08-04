import type { MetadataRoute } from "next"
import { createPublicClient } from "@/lib/supabase/server"
import { blogArticles, publicRoutes, baseUrl } from "@/lib/blog-articles"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient()

  // Static public pages (not behind auth)
  const staticPages: MetadataRoute.Sitemap = publicRoutes.map(({ path, lastModified }) => ({
    url: path ? `${baseUrl}/${path}` : baseUrl,
    lastModified: new Date(lastModified),
  }))

  // Restaurant menu pages — only restaurants with at least one dish (empty menus are thin content, not index-worthy)
  const menuPages: MetadataRoute.Sitemap =
    ((await supabase
        .from("restaurants")
        .select("slug, updated_at, dishes(count)")
        .eq("is_active", true)
        .eq("is_suspended", false))
        .data ?? [])
        .filter((r) => (r.dishes?.[0]?.count ?? 0) > 0)
        .map((r) => ({
          url: `${baseUrl}/${r.slug}`,
          lastModified: new Date(r.updated_at),
        }))

  // Blog article pages — use each article's own date
  const blogPages: MetadataRoute.Sitemap = blogArticles.map(({ slug, date }) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(date),
  }))

  return [...staticPages, ...menuPages, ...blogPages]
}
