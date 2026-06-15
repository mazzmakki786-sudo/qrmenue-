import type { NextConfig } from "next"

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
}

export default nextConfig
