export default function SubscriptionLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-36 bg-[#F0F0F0] rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-white border border-border rounded-2xl p-6 space-y-4">
            <div className="h-5 w-20 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-10 w-32 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-3 w-full bg-[#F0F0F0] rounded animate-pulse" />
              ))}
            </div>
            <div className="h-10 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
