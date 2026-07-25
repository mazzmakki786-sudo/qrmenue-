import { permanentRedirect } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params
  // Redirect to canonical root-level URL to eliminate duplicate content
  permanentRedirect(`/${slug}`)
}
