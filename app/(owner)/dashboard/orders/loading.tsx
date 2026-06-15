export default function OrdersLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 bg-[#F0F0F0] rounded" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-[#F0F0F0] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
