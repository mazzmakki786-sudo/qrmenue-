import { permanentRedirect } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OldMenuRedirect({ params }: Props) {
  const { slug } = await params
  // 308 permanent redirect to canonical root-level URL for SEO consolidation
  permanentRedirect(`/${slug}`)
}
