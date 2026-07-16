export default function QRLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-20 bg-[#F0F0F0] rounded animate-pulse" />
      <div className="flex flex-col items-center py-8">
        <div className="w-48 h-48 bg-[#F0F0F0] rounded-xl animate-pulse mb-6" />
        <div className="h-4 w-40 bg-[#F0F0F0] rounded mb-3 animate-pulse" />
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-[#F0F0F0] rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-[#F0F0F0] rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
