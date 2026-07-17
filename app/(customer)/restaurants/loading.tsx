export default function RestaurantsLoading() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-black via-[#1A1A1A] to-[#2D2D2D]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 sm:pb-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-5 w-48 bg-white/10 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-9 sm:h-10 w-64 bg-white/10 rounded-lg mx-auto mb-3 animate-pulse" />
            <div className="h-5 w-80 bg-white/10 rounded mx-auto animate-pulse" />
            <div className="h-12 w-full max-w-xl bg-white/10 rounded-2xl mx-auto mt-6 animate-pulse" />
          </div>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24">
        {/* Filters skeleton */}
        <div className="flex items-center gap-2 mb-5 sm:mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-white rounded-full border border-[#E8E8E8] animate-pulse" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#F0F0F0] overflow-hidden animate-pulse">
              <div className="h-28 sm:h-32 bg-[#F5F5F5]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#F5F5F5] rounded w-2/3" />
                <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
                <div className="h-3 bg-[#F5F5F5] rounded w-1/3" />
                <div className="pt-3 border-t border-[#F0F0F0]">
                  <div className="h-3 bg-[#F5F5F5] rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
