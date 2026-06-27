export default function RestaurantDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
          <div className="w-8" />
        </div>
      </div>

      <main className="pt-12 pb-24 px-4">
        {/* Logo + Info skeleton */}
        <div className="flex items-center gap-5 py-6 border-b border-gray-100 mb-5">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        </div>

        {/* Contact info skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-gray-100 rounded animate-pulse w-1/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* Opening hours skeleton */}
        <div className="border border-gray-100 rounded-xl p-4 mb-5">
          <div className="h-4 w-28 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Menu skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-3 ml-3" />
              <div className="space-y-2">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex gap-3.5 p-3.5 border border-gray-100 rounded-2xl">
                    <div className="w-24 h-24 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                      <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2" />
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
