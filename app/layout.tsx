import type { Metadata, Viewport } from "next"
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n/context"
import { OrganizationJsonLd, WebsiteJsonLd, SoftwareApplicationJsonLd, ReviewJsonLd } from "@/components/JsonLd"
import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const notoUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-urdu",
  display: "swap",
  weight: ["400", "700"],
  preload: false,
})

const APP_NAME = "Digital QR Menue"
const SITE_NAME = "Digitalmenue.com"
const SITE_URL = "https://digitalmenue.com"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — QR Code Menu & WhatsApp Ordering for Pakistan Restaurants`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Create a free QR code menu for your restaurant in Pakistan. Customers scan, browse, and order on WhatsApp. No app, no commission. Start your 7-day free trial.",
  keywords: [
    "QR menu Pakistan",
    "digital menu for restaurant",
    "QR code menu system",
    "restaurant ordering system Pakistan",
    "online menu generator",
    "contactless menu",
    "WhatsApp ordering restaurant",
    "free QR menu",
    "restaurant menu QR code",
    "menu digital Pakistan",
    "ریسٹورنٹ کے لیے کیو آر مینو",
    "ڈیجیٹل مینو پاکستان",
    "کیو آر کوڈ مینو",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — QR Code Menu & WhatsApp Ordering for Pakistan Restaurants`,
    description:
      "Create a free QR code menu for your restaurant in Pakistan. Customers scan, browse, and order on WhatsApp. No app, no commission. Start your 7-day free trial.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — QR Code Menu & WhatsApp Ordering Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — QR Code Menu & WhatsApp Ordering for Pakistan Restaurants`,
    description:
      "Create a free QR code menu for your restaurant in Pakistan. No app, no commission. Start your 7-day free trial.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: SITE_URL,
      ur: SITE_URL,
      "x-default": SITE_URL,
    },
  },
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
  },
  other: { "mobile-web-app-capable": "yes" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoUrdu.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased overflow-x-hidden">
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <SoftwareApplicationJsonLd />
        <ReviewJsonLd />
        <DynamicBreadcrumb />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
