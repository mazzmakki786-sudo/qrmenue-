import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Login",
  description:
    "Sign in to your Digital QR Menue customer account. Browse restaurant menus, save favorites, and track your orders.",
  alternates: {
    canonical: "https://www.digitalmenue.com/login/customer",
  },
}

export default function CustomerLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
