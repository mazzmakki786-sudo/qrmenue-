import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Store, ChevronRight } from "lucide-react"
import { GRACE_PERIOD_DAYS } from "@/lib/subscription"
import { RestaurantDetailClient } from "@/app/(customer)/restaurant/[slug]/RestaurantDetailClient"
import type { Category, Dish } from "@/types"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 300

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
    return { title: "Menu Not Found" }
  }

  const title = `${restaurant.name} — ${restaurant.cuisine_type || "Restaurant"} in ${restaurant.city} | QRMenu.pk`

  return {
    title,
    description: restaurant.description || `View ${restaurant.name}'s digital menu. Browse dishes, prices, and order directly via WhatsApp. Powered by QRMenu.pk — Pakistan's #1 QR menu platform.`,
    openGraph: {
      title,
      description: restaurant.description || `View ${restaurant.name}'s digital menu. Browse dishes, prices, and order directly via WhatsApp.`,
      type: "website",
      url: `https://qrmenu.pk/menu/${slug}`,
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
      canonical: `https://qrmenu.pk/menu/${slug}`,
    },
  }
}

function RestaurantUnavailable({ restaurantName }: { restaurantName: string }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#F5F5F5] flex items-center justify-center">
          <Store className="w-7 h-7 text-[#999]" />
        </div>
        <h1 className="text-lg font-bold text-[#333] mb-2">{restaurantName}</h1>
        <p className="text-sm text-[#777] mb-6 leading-relaxed">
          This restaurant is not accepting orders right now. Please try again later.
        </p>
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#333] text-white text-sm font-medium rounded-xl hover:bg-black transition-colors"
        >
          <Store className="w-4 h-4" />
          Browse Other Restaurants
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default async function MenuPage({ params }: Props) {
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

  // Trial grace period check
  const isTrial = restaurant.plan === "trial"
  if (isTrial && restaurant.trial_end) {
    const trialEnd = new Date(restaurant.trial_end)
    const graceEnd = new Date(trialEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
    if (new Date() > graceEnd) {
      return <RestaurantUnavailable restaurantName={restaurant.name} />
    }
  }

  if (!isTrial && restaurant.plan_end_date) {
    const planEnd = new Date(restaurant.plan_end_date)
    if (new Date() > planEnd) {
      return <RestaurantUnavailable restaurantName={restaurant.name} />
    }
  }

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
        delivery_fee: restaurant.delivery_fee,
        delivery_time_min: restaurant.delivery_time_min,
        is_open: restaurant.is_open ?? true,
        opening_time: restaurant.opening_time,
        closing_time: restaurant.closing_time,
        opening_hours: restaurant.opening_hours ?? null,
        lat: restaurant.lat ?? null,
        lng: restaurant.lng ?? null,
      }}
      categories={categories}
    />
  )
}
