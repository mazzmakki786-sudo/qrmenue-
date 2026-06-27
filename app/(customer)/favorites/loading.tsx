export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          <div>
            <div className="h-8 sm:h-9 w-40 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white border border-gray-100 rounded-xl animate-pulse">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
