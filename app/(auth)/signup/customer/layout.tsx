import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Sign Up",
  description:
    "Create your free Digital QR Menue customer account. Save your favorite dishes and track your orders across restaurant QR menus.",
  alternates: {
    canonical: "https://www.digitalmenue.com/signup/customer",
  },
}

export default function CustomerSignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
