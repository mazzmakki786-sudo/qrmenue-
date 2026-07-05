import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your order. Choose delivery, pickup, or dine-in and pay with JazzCash, Easypaisa, or cash on delivery.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
