export default function BrandingLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-28 bg-[#F0F0F0] rounded animate-pulse" />
      <div className="bg-white border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#F0F0F0] rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-9 w-28 bg-[#F0F0F0] rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-[#F0F0F0] rounded animate-pulse" />
          <div className="h-10 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-[#F0F0F0] rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
