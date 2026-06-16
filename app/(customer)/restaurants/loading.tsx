export default function RestaurantsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-24 pb-8 px-4 max-w-[600px] mx-auto">
        <div className="mb-6 animate-pulse">
          <div className="h-8 w-40 bg-[#F5F5F5] rounded" />
        </div>
        <div className="flex gap-2 mb-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-20 bg-[#F5F5F5] rounded-full shrink-0" />
          ))}
        </div>
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-3 w-16 bg-[#F5F5F5] rounded animate-pulse" />
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center gap-4 p-4 border border-[#F0F0F0] rounded-xl">
                  <div className="w-14 h-14 rounded-xl bg-[#F5F5F5] animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F5F5F5] rounded animate-pulse w-1/2" />
                    <div className="h-3 bg-[#F5F5F5] rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
