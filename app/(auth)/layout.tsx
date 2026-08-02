export const dynamic = "force-dynamic"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12 safe-top safe-bottom">
      <div className="w-full max-w-sm md:max-w-md">
        {children}
      </div>
    </div>
  )
}
