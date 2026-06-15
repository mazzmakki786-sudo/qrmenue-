export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-14 border-b border-[#F0F0F0] flex items-center justify-between px-4 md:px-6">
        <div className="h-5 w-24 bg-[#F0F0F0] rounded animate-pulse" />
        <div className="h-8 w-20 bg-[#F0F0F0] rounded-lg animate-pulse" />
      </div>
      <div className="px-4 md:px-6 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-6 w-48 bg-[#F0F0F0] rounded mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-80 bg-[#F0F0F0] rounded mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-64 bg-[#F0F0F0] rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-[#F0F0F0] rounded-2xl p-6 space-y-4">
              <div className="h-4 w-16 bg-[#F0F0F0] rounded animate-pulse" />
              <div className="h-8 w-32 bg-[#F0F0F0] rounded animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-3 w-full bg-[#F0F0F0] rounded animate-pulse" />
                ))}
              </div>
              <div className="h-10 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
