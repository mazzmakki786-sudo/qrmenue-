export default function SuperAdminLoading() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 md:gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-[#F0F0F0] rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-xl border border-[#F0F0F0] animate-pulse" />
        ))}
      </div>
      <div className="h-12 bg-[#F0F0F0] rounded-[10px] animate-pulse" />
      <div className="h-64 bg-white rounded-[14px] border border-[#E8E8E8] animate-pulse" />
    </div>
  )
}
