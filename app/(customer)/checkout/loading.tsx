export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Mobile skeleton */}
      <div className="md:hidden">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3 px-4 h-14 max-w-[600px] mx-auto">
            <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse" />
            <div>
              <div className="h-4 w-24 bg-[#F0F0F0] rounded animate-pulse" />
              <div className="h-3 w-20 bg-[#F0F0F0] rounded mt-1 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="bg-white border-b border-border">
          <div className="flex items-center justify-center gap-2 px-4 py-3 max-w-[600px] mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[#F0F0F0] animate-pulse" />
                <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
                {i < 2 && <div className="w-8 h-px bg-[#F0F0F0]" />}
              </div>
            ))}
          </div>
        </div>

        {/* Summary bar */}
        <div className="bg-white border-b border-border">
          <div className="flex items-center justify-between px-4 py-3 max-w-[600px] mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F0F0F0] animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-20 bg-[#F0F0F0] rounded animate-pulse" />
          </div>
        </div>

        {/* Form sections */}
        <div className="px-4 py-5 pb-32 space-y-5 max-w-[600px] mx-auto">
          {/* Order Type */}
          <div className="bg-white rounded-2xl p-5 border border-border space-y-3">
            <div className="h-4 w-20 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-1 h-10 bg-[#F0F0F0] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="bg-white rounded-2xl p-5 border border-border space-y-4">
            <div className="h-4 w-24 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-10 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl p-5 border border-border space-y-3">
            <div className="h-4 w-28 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Fixed place order button */}
        <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-border p-4 z-40">
          <div className="max-w-[600px] mx-auto">
            <div className="h-12 bg-[#F0F0F0] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Desktop skeleton */}
      <div className="hidden md:block min-h-screen bg-[#F9FAFB]">
        <header className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse" />
            <div>
              <div className="h-5 w-24 bg-[#F0F0F0] rounded animate-pulse" />
              <div className="h-3 w-20 bg-[#F0F0F0] rounded mt-1 animate-pulse" />
            </div>
          </div>
        </header>

        {/* Step indicators */}
        <div className="bg-white border-b border-border">
          <div className="flex items-center justify-center gap-3 px-6 py-4 max-w-5xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#F0F0F0] animate-pulse" />
                <div className="h-4 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                {i < 2 && <div className="w-12 h-0.5 bg-[#F0F0F0]" />}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Left columns */}
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-xl border border-border p-6 space-y-3">
                <div className="h-4 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="flex gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-1 h-12 bg-[#F0F0F0] rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border p-6 space-y-4">
                <div className="h-4 w-24 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-11 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
                <div className="h-11 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
              </div>
              <div className="bg-white rounded-xl border border-border p-6 space-y-3">
                <div className="h-4 w-28 bg-[#F0F0F0] rounded animate-pulse" />
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
                ))}
              </div>
            </div>

            {/* Right summary */}
            <div className="w-80 shrink-0">
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="h-4 w-28 bg-[#F0F0F0] rounded animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F0F0F0] animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-24 bg-[#F0F0F0] rounded animate-pulse" />
                        <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-border mx-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 w-12 bg-[#F0F0F0] rounded animate-pulse" />
                    <div className="h-5 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                  </div>
                  <div className="h-12 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
