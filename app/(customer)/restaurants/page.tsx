import type { Metadata } from "next"
import { RestaurantsClient } from "./RestaurantsClient"
import { ItemListJsonLd } from "@/components/JsonLd"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Restaurants in Pakistan — Browse Menus",
  description:
    "Find and browse restaurants across Pakistan. View menus, prices, and order via WhatsApp. Lahore, Karachi, Islamabad and more cities.",
  openGraph: {
    title: "Restaurants in Pakistan — Browse Menus | QRMenu.pk",
    description:
      "Find and browse restaurants across Pakistan. View menus, prices, and order via WhatsApp.",
    type: "website",
    url: "https://qr-menue-one.vercel.app/restaurants",
    siteName: "QRMenu.pk",
  },
  alternates: {
    canonical: "https://qr-menue-one.vercel.app/restaurants",
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
      url: `https://qr-menue-one.vercel.app/menu/${r.slug}`,
      description: r.description || undefined,
    })) ?? []

  return (
    <>
      <ItemListJsonLd items={items} />
      <RestaurantsClient />
    </>
  )
}
