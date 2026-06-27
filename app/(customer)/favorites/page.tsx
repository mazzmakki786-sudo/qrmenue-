import type { Metadata } from "next"
import { FavoritesClient } from "./FavoritesClient"

export const metadata: Metadata = {
  title: "My Favorites — QRMenu.pk",
  description: "View your favorite restaurants on QRMenu.pk",
  robots: { index: false, follow: true },
}

export default function FavoritesPage() {
  return <FavoritesClient />
}
