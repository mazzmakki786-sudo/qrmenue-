import { createClient } from "@/lib/supabase/server"
import { MenuHeader } from "@/components/customer/MenuHeader"
import { MenuContent } from "@/components/customer/MenuContent"
import { notFound } from "next/navigation"
import { GRACE_PERIOD_DAYS } from "@/lib/subscription"
import type { Category, Dish } from "@/types"

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-dynamic"

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
            <p className="text-xs text-[#999]">
              Please check back later or contact the restaurant directly.
            </p>
          </div>
        </div>
      )
    }
  }

  const categories: (Category & { dishes: Dish[] })[] = restaurant.categories || []

  return (
    <div>
      <MenuHeader
        name={restaurant.name}
        nameUr={restaurant.name_ur}
        logoUrl={restaurant.logo_url}
        city={restaurant.city}
        cuisineType={restaurant.cuisine_type}
      />
      <MenuContent
        categories={categories}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
    </div>
  )
}
