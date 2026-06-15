import type { Metadata } from "next"
import { RestaurantsClient } from "./RestaurantsClient"
import { ItemListJsonLd } from "@/components/JsonLd"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Restaurants in Pakistan — Browse Menus | QRMenu.pk",
  description:
    "Find restaurants in Lahore, Karachi, Islamabad and more. Browse digital menus, view dishes, and order via WhatsApp.",
  openGraph: {
    title: "Restaurants | QRMenu.pk",
    description: "Browse restaurant menus in Pakistan",
    type: "website",
    url: "https://qrmenu.pk/restaurants",
    siteName: "QRMenu.pk",
  },
  alternates: {
    canonical: "https://qrmenu.pk/restaurants",
  },
}

export default async function RestaurantsPage() {
  const supabase = await createClient()
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("name, slug, description")
    .eq("is_active", true)
    .eq("is_suspended", false)
    .order("name")

  const items =
    restaurants?.map((r) => ({
      name: r.name,
      url: `https://qrmenu.pk/menu/${r.slug}`,
      description: r.description || undefined,
    })) ?? []

  return (
    <>
      <ItemListJsonLd items={items} />
      <RestaurantsClient />
    </>
  )
}
