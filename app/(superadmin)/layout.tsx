"use client"

import { ErrorBoundary } from "@/components/shared/ErrorBoundary"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8F8F8]">
        <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </ErrorBoundary>
  )
}
