export default function RestaurantDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-12 pb-24 px-4 max-w-[600px] mx-auto">
        <div className="h-44 bg-[#F5F5F5] rounded-2xl animate-pulse mt-3 mb-4" />
        <div className="h-3 bg-[#F5F5F5] rounded animate-pulse w-3/4 mb-2" />
        <div className="flex gap-2 mb-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 flex-1 p-2.5 border border-[#F0F0F0] rounded-lg">
              <div className="w-7 h-7 rounded-lg bg-[#F5F5F5] animate-pulse shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-[#F5F5F5] rounded animate-pulse w-1/3" />
                <div className="h-3 bg-[#F5F5F5] rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-[#F5F5F5] rounded animate-pulse w-24 mb-3 ml-3" />
              <div className="space-y-2">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex gap-3 p-3 border border-[#F0F0F0] rounded-xl">
                    <div className="w-20 h-20 rounded-lg bg-[#F5F5F5] animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-[#F5F5F5] rounded animate-pulse w-2/3" />
                      <div className="h-2 bg-[#F5F5F5] rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
