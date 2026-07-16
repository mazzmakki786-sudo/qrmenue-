import type { Metadata } from "next"
import { RestaurantsClient } from "./RestaurantsClient"
import { ItemListJsonLd } from "@/components/JsonLd"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Restaurants in Pakistan — Browse Menus | Digital QR Menue",
  description:
    "Find restaurants in Lahore, Karachi, Islamabad and more. Browse digital menus, view dishes, and order via WhatsApp.",
  openGraph: {
    title: "Restaurants | Digital QR Menue",
    description: "Browse restaurant menus in Pakistan",
    type: "website",
    url: "https://www.digitalmenue.com/restaurants",
    siteName: "Digitalmenue.com",
  },
  alternates: {
    canonical: "https://www.digitalmenue.com/restaurants",
  },
}

export default async function RestaurantsPage() {
  const supabase = await createClient()
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, city, cuisine_type, logo_url, description, delivery_time_min, delivery_fee, is_open, opening_time, closing_time, opening_hours, plan, plan_end_date, trial_end, phone")
    .eq("is_active", true)
    .eq("is_suspended", false)
    .order("name")

  const items =
    restaurants?.map((r) => ({
      name: r.name,
      url: `https://www.digitalmenue.com/menu/${r.slug}`,
      description: r.description || undefined,
    })) ?? []

  const cities = [...new Set((restaurants ?? []).map((r) => r.city.trim()))].sort()

  return (
    <>
      <ItemListJsonLd items={items} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-6">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            Browse Restaurants
          </h1>
          <p className="text-xs md:text-sm text-[#555]">
            Digital menus across Pakistan. Browse, tap, and order.
          </p>
          <p className="text-xs md:text-sm text-[#555] mt-4 leading-relaxed">
            Digital QR Menue lets you find restaurants in Lahore, Karachi, Islamabad, and across Pakistan with digital QR code menus. Browse dishes with photos and prices, then order directly via WhatsApp — no app download, no commission, no signup required.
          </p>
        </div>
      </section>
      <RestaurantsClient
        initialRestaurants={restaurants ?? []}
        initialCities={cities}
      />
    </>
  )
}
