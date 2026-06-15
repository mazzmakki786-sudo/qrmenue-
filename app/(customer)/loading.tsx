export default function CustomerLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-14 border-b border-[#F0F0F0] flex items-center px-4 md:px-6">
        <div className="h-6 w-24 bg-[#F0F0F0] rounded animate-pulse" />
      </div>
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-[#F0F0F0] rounded-xl">
              <div className="w-12 h-12 bg-[#F0F0F0] rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
