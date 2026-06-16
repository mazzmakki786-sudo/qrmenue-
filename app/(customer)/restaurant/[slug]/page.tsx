import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { RestaurantDetailClient } from "./RestaurantDetailClient"
import type { Category, Dish } from "@/types"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, description, city, cuisine_type, logo_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!restaurant) {
    return { title: "Restaurant Not Found" }
  }

  const title = `${restaurant.name} — ${restaurant.cuisine_type || "Restaurant"} in ${restaurant.city}`
  const description =
    restaurant.description ||
    `View ${restaurant.name}'s menu. Browse dishes, prices, and order directly via WhatsApp. Powered by QRMenu.pk`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://qrmenu.pk/restaurant/${slug}`,
      siteName: "QRMenu.pk",
      images: [
        {
          url: restaurant.logo_url || "https://qrmenu.pk/og-image.svg",
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
    },
    alternates: {
      canonical: `https://qrmenu.pk/restaurant/${slug}`,
    },
  }
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*, categories(*, dishes(*))")
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("is_suspended", false)
    .single()

  if (!restaurant) notFound()

  const categories: (Category & { dishes: Dish[] })[] = restaurant.categories || []

  return (
    <RestaurantDetailClient
      restaurant={{
        id: restaurant.id,
        name: restaurant.name,
        name_ur: restaurant.name_ur,
        slug: restaurant.slug,
        city: restaurant.city,
        cuisine_type: restaurant.cuisine_type,
        logo_url: restaurant.logo_url,
        description: restaurant.description,
        phone: restaurant.phone,
        address: restaurant.address,
      }}
      categories={categories}
    />
  )
}
