import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Owner Dashboard",
  description:
    "Manage your restaurant's digital menu, orders, deals, analytics, and subscription from the Digital QR Menue dashboard.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
