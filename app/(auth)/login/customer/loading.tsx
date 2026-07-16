export default function CustomerLoginLoading() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Back button */}
      <div className="w-full mb-6">
        <div className="inline-flex items-center gap-2 min-h-[44px]">
          <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse" />
          <div className="h-4 w-12 bg-[#F0F0F0] rounded animate-pulse" />
        </div>
      </div>

      {/* Icon + Title + Subtitle */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 bg-[#F0F0F0] rounded-xl mb-4 animate-pulse" />
        <div className="h-6 w-40 bg-[#F0F0F0] rounded mb-2 animate-pulse" />
        <div className="h-4 w-56 bg-[#F0F0F0] rounded animate-pulse" />
      </div>

      {/* Google button */}
      <div className="w-full h-11 bg-[#F0F0F0] rounded-xl mb-5 animate-pulse" />

      {/* Divider */}
      <div className="relative w-full flex items-center justify-center mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#F0F0F0]" />
        </div>
        <span className="relative px-4 bg-white text-xs text-[#999]">or</span>
      </div>

      {/* Form fields + submit */}
      <div className="w-full space-y-4">
        <div className="h-11 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
        <div className="h-11 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
        <div className="h-11 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
      </div>

      {/* Links */}
      <div className="flex flex-col items-center gap-3 mt-6">
        <div className="h-4 w-48 bg-[#F0F0F0] rounded animate-pulse" />
        <div className="h-3 w-28 bg-[#F0F0F0] rounded animate-pulse" />
      </div>
    </div>
  )
}
