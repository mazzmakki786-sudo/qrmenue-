export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-36 bg-[#F0F0F0] rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white border border-border rounded-xl p-4 space-y-3">
            <div className="h-3 w-20 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-8 w-24 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-72 bg-white border border-border rounded-xl p-4">
        <div className="h-4 w-28 bg-[#F0F0F0] rounded mb-4 animate-pulse" />
        <div className="h-60 bg-[#F0F0F0] rounded animate-pulse" />
      </div>
    </div>
  )
}
