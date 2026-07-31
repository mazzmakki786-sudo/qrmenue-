import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GRACE_PERIOD_DAYS } from "@/lib/subscription"
import { buildBrandingConfig } from "@/lib/branding"
import { RestaurantDetailClient } from "@/app/(customer)/restaurant/[slug]/RestaurantDetailClient"
import { RestaurantUnavailable } from "@/components/shared/RestaurantUnavailable"
import type { Category, Dish } from "@/types"
import type { Metadata } from "next"
import { RestaurantJsonLd, BreadcrumbListJsonLd } from "@/components/JsonLd"

interface Props {
  params: Promise<{ slug: string }>
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.digitalmenue.com"

export const revalidate = 60  // ISR: revalidate every 60s (fresh menu content)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, description, city, cuisine_type, logo_url, dishes(count)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!restaurant) {
    notFound()
  }

  // Empty menus (no dishes) are thin content — don't let Google index them
  const dishCount = (restaurant.dishes?.[0]?.count ?? 0) as number

  const cityPart = restaurant.city?.trim() ? ` in ${restaurant.city.trim()}` : ""
  const typePart = restaurant.cuisine_type?.trim() || "Restaurant"
  const title = `${restaurant.name} — ${typePart}${cityPart} | Digital QR Menue`

  return {
    title,
    description: restaurant.description || `View ${restaurant.name}'s digital menu. Browse dishes, prices, and order directly via WhatsApp. Powered by Digital QR Menue — Pakistan's #1 QR menu platform.`,
    robots: dishCount === 0 ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description: restaurant.description || `View ${restaurant.name}'s digital menu. Browse dishes, prices, and order directly via WhatsApp.`,
      type: "website",
      url: `${APP_URL}/${slug}`,
      siteName: "Digitalmenue.com",
      images: [
        {
          url: restaurant.logo_url || "https://www.digitalmenue.com/og-image.png",
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
    },
    alternates: {
      canonical: `${APP_URL}/${slug}`,
    },
  }
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

  const branding = buildBrandingConfig(
    restaurant.plan,
    { customBranding: false }, // will be refined when plan_limits is available
    {
      banner_enabled: restaurant.banner_enabled,
      banner_image_url: restaurant.banner_image_url,
      banner_link_url: restaurant.banner_link_url,
      brand_primary_color: restaurant.brand_primary_color,
      brand_accent_color: restaurant.brand_accent_color,
    }
  )

  return (
    <>
      <RestaurantJsonLd
        name={restaurant.name}
        description={restaurant.description}
        logoUrl={restaurant.logo_url}
        city={restaurant.city}
        cuisineType={restaurant.cuisine_type}
        slug={restaurant.slug}
        categories={categories}
      />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Restaurants", url: `${APP_URL}/restaurants` },
          { name: restaurant.name, url: `${APP_URL}/${restaurant.slug}` },
        ]}
      />
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
          banner_enabled: restaurant.banner_enabled,
          banner_image_url: restaurant.banner_image_url,
          banner_link_url: restaurant.banner_link_url,
        }}
        categories={categories}
        branding={branding}
      />
    </>
  )
}
