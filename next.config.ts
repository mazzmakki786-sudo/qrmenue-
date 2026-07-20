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

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-dialog', '@radix-ui/react-tabs'],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  redirects: async () => [
    {
      source: "/:path*",
      has: [{ type: "host", value: "qr-menue-one.vercel.app" }],
      destination: "https://digitalmenue.com/:path*",
      permanent: true,
    },
    {
      source: "/:path*",
      has: [{ type: "host", value: "qrmenu.vercel.app" }],
      destination: "https://digitalmenue.com/:path*",
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
}

export default nextConfig
