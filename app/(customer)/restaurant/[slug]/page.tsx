import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params
  // Redirect to canonical /menu/[slug] to eliminate duplicate content
  redirect(`/menu/${slug}`)
}
