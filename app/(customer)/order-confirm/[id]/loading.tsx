export default function OrderConfirmLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 md:hidden">
      {/* Top AppBar skeleton */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
        <div className="flex items-center gap-4 px-4 h-16 max-w-[500px] mx-auto">
          <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse shrink-0" />
          <div className="h-5 w-28 bg-[#F0F0F0] rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-[500px] mx-auto px-4 py-6 space-y-6">
        {/* Status card skeleton */}
        <section className="bg-white border border-border rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-[#F0F0F0] rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-32 bg-[#F0F0F0] rounded mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-24 bg-[#F0F0F0] rounded mx-auto mb-1 animate-pulse" />
          <div className="h-3 w-48 bg-[#F0F0F0] rounded mx-auto animate-pulse" />
        </section>

        {/* Action buttons skeleton */}
        <div className="flex gap-2.5">
          <div className="flex-1 h-11 bg-[#F0F0F0] rounded-xl animate-pulse" />
          <div className="w-[88px] h-11 bg-[#F0F0F0] rounded-xl animate-pulse" />
        </div>

        {/* Order summary skeleton */}
        <section className="bg-white border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-5 w-28 bg-[#F0F0F0] rounded animate-pulse" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-40 bg-[#F0F0F0] rounded animate-pulse" />
              <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
            </div>
          ))}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 bg-[#F0F0F0] rounded animate-pulse" />
              <div className="h-5 w-20 bg-[#F0F0F0] rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-[#F5F5F5] rounded-xl p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-24 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Bottom actions skeleton */}
        <div className="space-y-3 pt-2">
          <div className="h-11 bg-[#F0F0F0] rounded-xl animate-pulse" />
          <div className="h-11 bg-[#F0F0F0] rounded-xl animate-pulse" />
          <div className="h-11 bg-[#F0F0F0] rounded-xl animate-pulse" />
        </div>
      </main>

      {/* ===== DESKTOP SKELETON ===== */}
      <div className="hidden md:block min-h-screen bg-[#F8F8F8]">
        <header className="bg-white border-b border-border sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-8 h-16 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F0F0F0] rounded-xl animate-pulse" />
            <div className="h-5 w-36 bg-[#F0F0F0] rounded animate-pulse" />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-8 py-10 space-y-6">
          {/* Status card skeleton */}
          <div className="bg-white border border-border rounded-2xl p-10 text-center">
            <div className="w-20 h-20 bg-[#F0F0F0] rounded-2xl mx-auto mb-5 animate-pulse" />
            <div className="h-6 w-40 bg-[#F0F0F0] rounded mx-auto mb-2 animate-pulse" />
            <div className="h-4 w-32 bg-[#F0F0F0] rounded mx-auto mb-4 animate-pulse" />
            <div className="h-3 w-64 bg-[#F0F0F0] rounded mx-auto animate-pulse" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <div className="h-12 w-56 bg-[#F0F0F0] rounded-xl animate-pulse" />
            <div className="h-12 w-40 bg-[#F0F0F0] rounded-xl animate-pulse" />
          </div>

          {/* Order summary */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="h-4 w-28 bg-[#F0F0F0] rounded animate-pulse" />
            </div>
            <div className="px-6 py-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-48 bg-[#F0F0F0] rounded animate-pulse" />
                  <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-[#FAFAFA] border-t border-border">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-5 w-20 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Detail grid */}
          <div className="bg-white border border-border rounded-2xl p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-24 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-32 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="flex gap-3 pt-2">
            <div className="flex-1 h-11 bg-[#F0F0F0] rounded-xl animate-pulse" />
            <div className="flex-1 h-11 bg-[#F0F0F0] rounded-xl animate-pulse" />
            <div className="flex-1 h-11 bg-[#F0F0F0] rounded-xl animate-pulse" />
          </div>
        </main>
      </div>
    </div>
  )
}
