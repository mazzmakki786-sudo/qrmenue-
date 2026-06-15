export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-[#F0F0F0] rounded" />
      <div className="h-24 bg-[#F0F0F0] rounded-[14px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 bg-[#F0F0F0] rounded-[14px]" />
        <div className="h-32 bg-[#F0F0F0] rounded-[14px]" />
      </div>
      <div className="h-64 bg-[#F0F0F0] rounded-[14px]" />
      <div className="h-48 bg-[#F0F0F0] rounded-[14px]" />
    </div>
  )
}
