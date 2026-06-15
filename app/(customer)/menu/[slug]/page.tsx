import { createClient } from "@/lib/supabase/server"
import { MenuHeader } from "@/components/customer/MenuHeader"
import { MenuContent } from "@/components/customer/MenuContent"
import { notFound } from "next/navigation"
import { GRACE_PERIOD_DAYS } from "@/lib/subscription"
import { RestaurantJsonLd } from "@/components/JsonLd"
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
    .select("name, name_ur, description, city, cuisine_type, logo_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!restaurant) {
    return { title: "Menu Not Found" }
  }

  const cityName = restaurant.city || "Pakistan"
  const cuisine = restaurant.cuisine_type || "Restaurant"
  const title = `${restaurant.name} Menu — ${cuisine} in ${cityName}`
  const description =
    restaurant.description ||
    `View ${restaurant.name}'s digital menu. Browse dishes, prices, and order directly via WhatsApp. Powered by QRMenu.pk — Pakistan's #1 QR menu platform.`

  return {
    title,
    description,
    openGraph: {
      title: `${restaurant.name} Menu — ${cuisine} in ${cityName} | QRMenu.pk`,
      description,
      type: "website",
      url: `https://qr-menue-one.vercel.app/menu/${slug}`,
      siteName: "QRMenu.pk",
      images: [
        {
          url: restaurant.logo_url || "https://qr-menue-one.vercel.app/og-image.svg",
          width: 1200,
          height: 630,
          alt: `${restaurant.name} menu on QRMenu.pk`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${restaurant.name} Menu — ${cuisine} in ${cityName} | QRMenu.pk`,
      description,
      images: [restaurant.logo_url || "https://qr-menue-one.vercel.app/og-image.svg"],
    },
    alternates: {
      canonical: `https://qr-menue-one.vercel.app/menu/${slug}`,
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

  const isTrial = restaurant.plan === "trial"
  if (isTrial && restaurant.trial_end) {
    const trialEnd = new Date(restaurant.trial_end)
    const graceEnd = new Date(trialEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
    if (new Date() > graceEnd) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h1 className="text-xl font-bold mb-2">Menu Unavailable</h1>
            <p className="text-sm text-[#555] mb-6">
              This restaurant&apos;s trial period has ended. The menu is temporarily offline.
            </p>
            <p className="text-xs text-[#555]">
              Please check back later or contact the restaurant directly.
            </p>
          </div>
        </div>
      )
    }
  }

  const categories: (Category & { dishes: Dish[] })[] = restaurant.categories || []

  return (
    <>
      <RestaurantJsonLd
        name={restaurant.name}
        description={restaurant.description}
        logoUrl={restaurant.logo_url}
        city={restaurant.city}
        cuisineType={restaurant.cuisine_type}
        slug={slug}
        categories={categories.map((cat) => ({
          name_en: cat.name_en,
          dishes: cat.dishes.map((d) => ({
            name_en: d.name_en,
            description_en: d.description_en,
            price: d.price,
            image_url: d.image_url,
            is_available: d.is_available,
          })),
        }))}
      />
      <div className="max-w-[600px] mx-auto min-h-screen pb-32 bg-white px-4">
        <MenuHeader
          name={restaurant.name}
          nameUr={restaurant.name_ur}
          logoUrl={restaurant.logo_url}
          city={restaurant.city}
          cuisineType={restaurant.cuisine_type}
          description={null}
        />
        <MenuContent
          categories={categories}
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
        />
      </div>
    </>
  )
}
