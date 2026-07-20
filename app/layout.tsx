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
    default: `Digital QR Menu for Restaurants in Pakistan | Free QR Code Menu & WhatsApp Ordering`,
    template: `%s | Digital QR Menu Pakistan`,
  },
  description:
    "Create a free digital QR menu for your restaurant in Pakistan. Eliminate printing costs, get orders directly on WhatsApp, and save 30% on Foodpanda commissions. Start your free QR code menu trial today.",
  keywords: [
    "menu qr code",
    "menu qr code restaurant",
    "digital restaurant menu",
    "digital food menu",
    "digital QR menu",
    "digital qr code menu",
    "digital qr menu for restaurant",
    "how to create digital menu with qr code",
    "digital menu design",
    "online order",
    "online ordering system",
    "online order food near me",
    "online restaurant ordering",
    "online restaurant ordering system",
    "online restaurant ordering platforms",
    "online restaurant ordering website",
    "qr code order online",
    "free qr code order online",
    "get order on whatsapp",
    "get order updates on whatsapp",
    "how to get order on whatsapp",
    "how to take orders on whatsapp",
    "how to place an order on whatsapp",
    "digital restaurants",
    "digital restaurant menu qr code",
    "true digital restaurants",
    "scan and get orders",
    "online menu",
    "pizza online menu",
    "QR code menu free",
    "Qr code menu pakistan",
    "Scan menu code online free",
    "Restaurants with QR code menus",
    "QR menu Pakistan",
    "digital menu for restaurant",
    "QR code menu system",
    "restaurant ordering system Pakistan",
    "online menu generator",
    "contactless menu",
    "WhatsApp ordering restaurant",
    "free QR menu",
    "restaurant menu QR code",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `Pakistan's #1 Digital QR Menu for Restaurants — Free QR Code Menu & WhatsApp Online Ordering System`,
    description:
      "Create a free digital QR menu for your restaurant. Customers scan, browse your digital food menu, and order directly via WhatsApp. Zero commission. No app download. Start your free QR code menu trial today.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Free Digital QR Menu for Restaurants with WhatsApp Ordering in Pakistan`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Digital QR Menu for Restaurants in Pakistan — Free QR Code Menu & WhatsApp Ordering`,
    description:
      "Create a free digital QR menu for your restaurant. Customers scan, browse your digital food menu, and order directly via WhatsApp. Zero commission. No app download.",
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
  icons: [
    { rel: "icon", type: "image/png", url: "/favicon-96x96.png", sizes: "96x96" },
    { rel: "icon", type: "image/svg+xml", url: "/icon.svg" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
  ],
  appleWebApp: {
    capable: true,
    title: "Digital menu",
    statusBarStyle: "black-translucent",
  },
  manifest: "/site.webmanifest",
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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-DH740HGMFX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DH740HGMFX', {
                send_page_view: true,
                anonymize_ip: true,
              });
            `,
          }}
        />
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
