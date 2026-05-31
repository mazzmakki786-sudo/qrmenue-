import { createClient } from "@/lib/supabase/server"
import { MenuHeader } from "@/components/customer/MenuHeader"
import { MenuContent } from "@/components/customer/MenuContent"
import { notFound } from "next/navigation"
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
    .single()

  if (!restaurant) notFound()

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
      <MenuContent categories={categories} />
    </div>
  )
}
