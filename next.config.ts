import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL || "https://digitalmenue.com" },
  { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-CSRF-Token, X-Requested-With" },
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Max-Age", value: "86400" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://*.google-analytics.com https://*.googletagmanager.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://*.google-analytics.com https://*.googletagmanager.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
]

// Cache-Control headers for static assets — long max-age for immutable files
const assetCacheHeaders = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
]

// Cache-Control for images (next/image optimized) — 30 days
const imageCacheHeaders = [
  { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
]

// Cache-Control for fonts — 1 year
const fontCacheHeaders = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
]

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-label",
      "@radix-ui/react-separator",
      "@radix-ui/react-switch",
    ],
    webpackBuildWorker: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 640, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 2592000, // 30 days
  },
  redirects: async () => [
    // SEO — consolidate competing landing pages into primary pillar hub
    {
      source: "/qr-code-menu-free",
      destination: "/digital-menu-for-restaurants",
      permanent: true,
    },
    {
      source: "/digital-menu-qr-code",
      destination: "/digital-menu-for-restaurants",
      permanent: true,
    },
    {
      source: "/qr-code-restaurant-menu",
      destination: "/digital-menu-for-restaurants",
      permanent: true,
    },
    {
      source: "/free-digital-menu",
      destination: "/digital-menu-for-restaurants",
      permanent: true,
    },
    {
      source: "/best-digital-menu-for-restaurants",
      destination: "/digital-menu-for-restaurants",
      permanent: true,
    },
    {
      source: "/scan-menu-code-online-free",
      destination: "/digital-menu-for-restaurants",
      permanent: true,
    },
    {
      source: "/qr-menu-app",
      destination: "/digital-menu-app",
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
    // Cache static assets aggressively
    {
      source: "/_next/static/:path*",
      headers: assetCacheHeaders,
    },
    // Cache optimized images
    {
      source: "/_next/image/:path*",
      headers: imageCacheHeaders,
    },
    // Cache fonts
    {
      source: "/fonts/:path*",
      headers: fontCacheHeaders,
    },
  ],
  // Reduce unused JS by excluding heavy modules from server bundle
  serverExternalPackages: ["bcryptjs", "nodemailer", "web-push"],
}

export default nextConfig
