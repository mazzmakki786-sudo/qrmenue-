import type { Metadata, Viewport } from "next"
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n/context"
import { WebsiteJsonLd, SoftwareApplicationJsonLd, LocalBusinessJsonLd } from "@/components/JsonLd"
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
const SITE_URL = "https://www.digitalmenue.com"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Digitalmenue.com | QR Menu & WhatsApp Ordering Pakistan`,
    template: `%s | Digitalmenue.com`,
  },
  description:
    "Pakistan ke restaurants ke liye behtareen QR Code menu card. Save 30% Foodpanda commission & get direct orders on WhatsApp. Free trial shuru karein.",
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
    title: `Pakistan's #1 QR Code Menu & WhatsApp Ordering System for Restaurants`,
    description:
      "Ab menu print karne ka kharcha khatam! Apne customers ko dein behtareen digital menu card aur orders receive karein seedha apne WhatsApp par. Aaj hi free trial shuru karein.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — QR Code Menu & WhatsApp Ordering Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Pakistan's #1 QR Code Menu & WhatsApp Ordering System for Restaurants`,
    description:
      "Ab menu print karne ka kharcha khatam! Apne customers ko dein behtareen digital menu card aur orders receive karein seedha apne WhatsApp par. Aaj hi free trial shuru karein.",
    images: ["/og-image.png"],
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
      ur: `${SITE_URL}/restaurants`,
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
      <head>
        <link rel="preconnect" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased overflow-x-hidden">
        <WebsiteJsonLd />
        <SoftwareApplicationJsonLd />
        <LocalBusinessJsonLd />
        <DynamicBreadcrumb />
        <I18nProvider>{children}</I18nProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async function() {
                  try {
                    var reg = await navigator.serviceWorker.register('/sw.js')
                    // If waiting, skip waiting so new SW takes over immediately
                    if (reg.waiting) {
                      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
                    }
                    reg.addEventListener('updatefound', function() {
                      var installing = reg.installing
                      if (installing) {
                        installing.addEventListener('statechange', function() {
                          if (this.state === 'activated') {
                            window.location.reload()
                          }
                        })
                      }
                    })
                  } catch(err) {
                    console.warn('SW registration failed:', err)
                  }
                })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
