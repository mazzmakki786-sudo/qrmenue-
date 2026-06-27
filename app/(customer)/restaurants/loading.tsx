export default function RestaurantsLoading() {
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-100 rounded animate-pulse mb-6" />
          <div className="h-12 w-full max-w-2xl bg-gray-100 rounded-xl animate-pulse" />
        </div>

        <div className="flex gap-2 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-7 w-16 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>

        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="w-16 h-4 bg-gray-100 rounded" />
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
