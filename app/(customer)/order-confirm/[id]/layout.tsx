import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order Confirmed",
  description:
    "Your order has been placed successfully. Track your order status in real-time.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function OrderConfirmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
