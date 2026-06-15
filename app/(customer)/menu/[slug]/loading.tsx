export default function MenuPageLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="h-48 bg-[#F0F0F0] w-full" />
      <div className="px-4 pt-4 space-y-6">
        <div className="space-y-3">
          <div className="h-6 w-32 bg-[#F0F0F0] rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-[#F9FAFB] rounded-2xl">
              <div className="w-24 h-24 bg-[#F0F0F0] rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-32 bg-[#F0F0F0] rounded" />
                <div className="h-3 w-48 bg-[#F0F0F0] rounded" />
                <div className="h-4 w-16 bg-[#F0F0F0] rounded mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
