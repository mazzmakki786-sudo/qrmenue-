import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cart",
  description:
    "Review your cart and proceed to checkout. Order from your favorite restaurants in Pakistan via Digital QR Menue.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
