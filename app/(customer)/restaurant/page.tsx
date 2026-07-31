import { permanentRedirect } from "next/navigation"

export default function RestaurantIndexPage() {
  permanentRedirect("/restaurants")
}
