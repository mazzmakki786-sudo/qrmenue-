export default function MenuPageLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Hero skeleton */}
      <div className="h-44 bg-[#F0F0F0] w-full rounded-b-2xl" />

      <div className="px-4 pt-5 max-w-[600px] mx-auto">
        {/* Title and subtitle */}
        <div className="space-y-2 mb-6">
          <div className="h-6 w-40 bg-[#F0F0F0] rounded" />
          <div className="h-4 w-56 bg-[#F0F0F0] rounded" />
        </div>

        {/* 2-column grid of dish cards */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#F9FAFB] rounded-2xl overflow-hidden">
              <div className="aspect-square bg-[#F0F0F0]" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 bg-[#F0F0F0] rounded w-3/4" />
                <div className="h-3 bg-[#F0F0F0] rounded w-1/2" />
                <div className="h-4 bg-[#F0F0F0] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}