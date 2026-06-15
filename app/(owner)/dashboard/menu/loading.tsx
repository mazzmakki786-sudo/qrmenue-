export default function MenuLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-[#F0F0F0] rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-[#F0F0F0] rounded-xl" />
        ))}
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-[#F0F0F0] rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-[#F0F0F0] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
