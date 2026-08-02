import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"

  return {
    rules: [
      // Default — allow everything except sensitive routes
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
      // AI search crawlers — explicitly allowed for AI visibility
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      // llms.txt — expose a machine-readable company overview for AI assistants
      { userAgent: "*", allow: "/llms.txt" },
      // Training crawlers — explicitly blocked
      // Dynamic search parameter URLs — prevent infinite crawl traps
      { userAgent: "*", disallow: "/restaurants?q=" },
      { userAgent: "*", disallow: "/restaurants?city=" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "cohere-ai", disallow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
