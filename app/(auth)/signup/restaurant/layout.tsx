import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Restaurant Sign Up",
  description:
    "Register your restaurant on Digital QR Menue. Create your free digital QR menu, add dishes, and start receiving WhatsApp orders in under 5 minutes.",
  alternates: {
    canonical: "https://www.digitalmenue.com/signup/restaurant",
  },
}

export default function RestaurantSignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
