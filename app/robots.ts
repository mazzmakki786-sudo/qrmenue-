import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/superadmin/",
          "/cart",
          "/checkout",
          "/order-confirm/",
          "/account",
          "/api/",
        ],
      },
      // All AI crawlers — allowed
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
