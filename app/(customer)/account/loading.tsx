export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-white">
      <header
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] flex items-center justify-between px-4 animate-pulse"
        style={{ height: "calc(48px + env(safe-area-inset-top, 0px))", paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="h-5 w-24 bg-[#F0F0F0] rounded" />
        <div className="h-4 w-20 bg-[#F0F0F0] rounded" />
      </header>

      <main className="pt-16 pb-8 px-4 max-w-[600px] mx-auto">
        <div className="space-y-6 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-28 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-4 w-6 bg-[#F0F0F0] rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="p-3.5 rounded-xl border border-[#F0F0F0] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-16 bg-[#F0F0F0] rounded" />
                        <div className="h-4 w-14 bg-[#F0F0F0] rounded-full" />
                      </div>
                      <div className="h-3 w-12 bg-[#F0F0F0] rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-40 bg-[#F0F0F0] rounded" />
                      <div className="h-3 w-14 bg-[#F0F0F0] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
