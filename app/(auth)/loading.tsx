export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm md:max-w-md space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 bg-[#F0F0F0] rounded-2xl mx-auto mb-4 animate-pulse" />
          <div className="h-7 w-48 bg-[#F0F0F0] rounded mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-36 bg-[#F0F0F0] rounded mx-auto animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="h-12 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
        </div>

        <div className="h-12 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
        <div className="h-4 w-40 bg-[#F0F0F0] rounded mx-auto animate-pulse" />
      </div>
    </div>
  )
}
