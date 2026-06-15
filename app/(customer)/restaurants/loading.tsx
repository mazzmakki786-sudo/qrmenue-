export default function RestaurantsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-24 pb-8 px-4 max-w-[600px] mx-auto">
        <div className="mb-6 animate-pulse">
          <div className="h-8 w-40 bg-[#F0F0F0] rounded" />
          <div className="h-4 w-56 bg-[#F0F0F0] rounded mt-2" />
        </div>
        <div className="flex gap-2 mb-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-20 bg-[#F0F0F0] rounded-full shrink-0" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-[#F0F0F0] rounded-xl animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  )
}
