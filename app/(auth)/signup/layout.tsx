import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Digital QR Menue account. Start your free trial and get your restaurant online with a QR code menu in under 5 minutes.",
  alternates: {
    canonical: "https://www.digitalmenue.com/signup",
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
