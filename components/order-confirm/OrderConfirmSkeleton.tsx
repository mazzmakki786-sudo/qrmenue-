export default function OrderConfirmSkeleton() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] animate-pulse">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
        <div className="flex items-center gap-4 px-4 h-16 max-w-5xl mx-auto">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-xl bg-[#F0F0F0] shrink-0" />
          <div className="h-5 w-32 md:w-44 bg-[#F0F0F0] rounded" />
        </div>
      </header>

      <main className="max-w-[500px] md:max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        {/* Status card */}
        <section className="bg-white border border-border rounded-2xl p-6 md:p-10 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F0F0F0] rounded-full md:rounded-2xl mx-auto mb-4 md:mb-5" />
          <div className="h-5 md:h-6 w-32 md:w-44 bg-[#F0F0F0] rounded mx-auto mb-2" />
          <div className="h-4 w-24 md:w-32 bg-[#F0F0F0] rounded mx-auto mb-1" />
          <div className="h-3 w-48 md:w-64 bg-[#F0F0F0] rounded mx-auto" />
        </section>

        {/* Timeline skeleton */}
        <section className="bg-white border border-border rounded-2xl p-5 md:p-6">
          <div className="hidden md:flex items-center justify-center gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#F0F0F0] rounded-full" />
                {i < 3 && <div className="w-16 h-0.5 bg-[#F0F0F0]" />}
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#F0F0F0] rounded-full shrink-0" />
                <div className="h-4 w-24 bg-[#F0F0F0] rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Contact buttons skeleton */}
        <div className="flex gap-2.5 md:justify-center">
          <div className="flex-1 md:w-56 md:flex-none h-11 bg-[#F0F0F0] rounded-xl" />
          <div className="w-[88px] md:w-32 h-11 bg-[#F0F0F0] rounded-xl" />
        </div>

        {/* Desktop: 2-col grid skeleton */}
        <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
          {/* Summary card */}
          <section className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="p-5 md:px-6 md:py-4 border-b border-border">
              <div className="h-4 w-28 bg-[#F0F0F0] rounded" />
            </div>
            <div className="p-5 md:px-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-40 bg-[#F0F0F0] rounded" />
                  <div className="h-3 w-16 bg-[#F0F0F0] rounded" />
                </div>
              ))}
            </div>
            <div className="p-5 md:px-6 bg-[#FAFAFA] border-t border-border">
              <div className="flex justify-between">
                <div className="h-4 w-12 bg-[#F0F0F0] rounded" />
                <div className="h-4 w-16 bg-[#F0F0F0] rounded" />
              </div>
            </div>
          </section>

          {/* Details card */}
          <section className="bg-white border border-border rounded-2xl p-5 md:p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-20 bg-[#F0F0F0] rounded" />
                <div className="h-3 w-24 bg-[#F0F0F0] rounded" />
              </div>
            ))}
          </section>
        </div>

        {/* Bottom actions */}
        <div className="space-y-3 md:flex md:gap-3 md:space-y-0 pt-2">
          <div className="md:flex-1 h-11 bg-[#F0F0F0] rounded-xl" />
          <div className="md:flex-1 h-11 bg-[#F0F0F0] rounded-xl" />
          <div className="md:flex-1 h-11 bg-[#F0F0F0] rounded-xl" />
        </div>
      </main>
    </div>
  )
}
