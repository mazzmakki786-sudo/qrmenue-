"use client"

import { usePathname } from "next/navigation"
import { BreadcrumbListJsonLd } from "@/components/JsonLd"

const SITE_URL = "https://www.digitalmenue.com"

const routeMap: Record<string, { name: string }> = {
  "/pricing": { name: "Pricing" },
  "/restaurants": { name: "Restaurants" },
  "/faq": { name: "FAQ" },
  "/contact": { name: "Contact" },
  "/signup": { name: "Sign Up" },
  "/login": { name: "Sign In" },
  "/privacy": { name: "Privacy Policy" },
  "/terms": { name: "Terms of Service" },
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const route = routeMap[pathname]

  if (!route) return null

  return (
    <BreadcrumbListJsonLd
      items={[
        { name: "Home", url: SITE_URL },
        { name: route.name, url: `${SITE_URL}${pathname}` },
      ]}
    />
  )
}
