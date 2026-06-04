import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const APP_NAME = "QRMenu.pk"

export const metadata: Metadata = {
  title: `${APP_NAME} — Digital Menu & Ordering Platform`,
  description: "Pakistan's QR-based digital menu and ordering platform for restaurants",
  icons: { icon: "/favicon.svg" },
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black-translucent" },
  other: { "mobile-web-app-capable": "yes" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
