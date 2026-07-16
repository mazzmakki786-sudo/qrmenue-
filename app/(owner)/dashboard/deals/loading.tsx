export default function DealsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 bg-[#F0F0F0] rounded animate-pulse" />
        <div className="h-9 w-28 bg-[#F0F0F0] rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-white border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="h-5 w-32 bg-[#F0F0F0] rounded animate-pulse" />
              <div className="w-6 h-6 bg-[#F0F0F0] rounded-full animate-pulse" />
            </div>
            <div className="h-3 w-full bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-8 w-full bg-[#F0F0F0] rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
