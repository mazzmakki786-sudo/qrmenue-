export default function OrderDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse" />
        <div className="h-7 w-40 bg-[#F0F0F0] rounded animate-pulse" />
      </div>

      {/* Status card */}
      <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F0F0F0] animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-3 w-20 bg-[#F0F0F0] rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 h-10 bg-[#F0F0F0] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white border border-border rounded-2xl p-5 space-y-3">
        <div className="h-5 w-28 bg-[#F0F0F0] rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F0F0F0] animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-28 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Customer info */}
      <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
        <div className="h-5 w-28 bg-[#F0F0F0] rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
              <div className="h-4 w-24 bg-[#F0F0F0] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
