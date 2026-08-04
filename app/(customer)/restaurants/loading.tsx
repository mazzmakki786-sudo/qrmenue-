export default function RestaurantsLoading() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <section className="bg-gradient-to-br from-black via-[#1A1A1A] to-[#2D2D2D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-6 sm:pb-10">
          <div className="text-center">
            <div className="h-5 w-48 bg-white/10 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-9 sm:h-10 w-64 bg-white/10 rounded-lg mx-auto mb-3 animate-pulse" />
            <div className="h-5 w-80 max-w-full bg-white/10 rounded mx-auto animate-pulse" />
            <div className="h-11 sm:h-12 w-full max-w-xl bg-white/10 rounded-2xl mx-auto mt-6 animate-pulse" />
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24">
        <div className="flex items-center gap-2 overflow-x-auto mb-4 sm:mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shrink-0 h-9 w-20 bg-white rounded-full border border-[#E8E8E8] animate-pulse" />
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-28 bg-[#EDEDED] rounded animate-pulse" />
        </div>

        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-border rounded-xl animate-pulse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F5F5F5] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#F5F5F5] rounded w-1/3" />
                <div className="h-3 bg-[#F5F5F5] rounded w-1/2" />
                <div className="h-3 bg-[#F5F5F5] rounded w-1/4" />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 shrink-0 self-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#F5F5F5]" />
                <div className="w-12 sm:w-20 h-7 sm:h-9 rounded-lg sm:rounded-xl bg-[#F5F5F5]" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
