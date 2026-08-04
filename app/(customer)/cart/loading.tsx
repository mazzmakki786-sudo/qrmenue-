export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="md:hidden">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 h-14 max-w-[600px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse" />
              <div>
                <div className="h-4 w-24 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[#F0F0F0] rounded mt-1 animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-16 bg-[#F0F0F0] rounded animate-pulse" />
          </div>
        </div>

        <div className="px-4 pt-3 pb-2 max-w-[600px] mx-auto">
          <div className="flex items-center gap-2.5 bg-white rounded-xl border border-border p-3">
            <div className="w-8 h-8 rounded-lg bg-[#F0F0F0] animate-pulse" />
            <div className="flex-1 h-4 w-32 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-4 w-14 bg-[#F0F0F0] rounded animate-pulse" />
          </div>
        </div>

        <div className="px-4 py-3 space-y-2 max-w-[600px] mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-3 flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-[#F0F0F0] animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-4 w-16 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="flex gap-1">
                  <div className="w-7 h-7 rounded-full bg-[#F0F0F0] animate-pulse" />
                  <div className="w-7 h-7 rounded-full bg-[#F0F0F0] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 max-w-[600px] mx-auto">
          <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
            <div className="h-4 w-28 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-12 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
              <div className="pt-2 border-t border-border flex justify-between">
                <div className="h-4 w-12 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-4 w-20 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-border p-4 z-40">
          <div className="max-w-[600px] mx-auto">
            <div className="h-12 bg-[#F0F0F0] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      <div className="hidden md:block min-h-screen bg-[#F9FAFB]">
        <header className="bg-white border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse" />
              <div>
                <div className="h-5 w-24 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-3 w-20 bg-[#F0F0F0] rounded mt-1 animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-16 bg-[#F0F0F0] rounded animate-pulse" />
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            <div className="flex-1 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-[#F0F0F0] animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-[#F0F0F0] rounded animate-pulse" />
                    <div className="h-3 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-8 bg-[#F0F0F0] rounded-full animate-pulse" />
                    <div className="w-8 h-8 bg-[#F0F0F0] rounded-full animate-pulse" />
                  </div>
                  <div className="h-4 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                </div>
              ))}
            </div>

            <div className="w-80 shrink-0">
              <div className="bg-white rounded-xl border border-border p-5 space-y-4">
                <div className="h-4 w-28 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-24 bg-[#F0F0F0] rounded animate-pulse" />
                    <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                    <div className="h-3 w-12 bg-[#F0F0F0] rounded animate-pulse" />
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <div className="h-5 w-12 bg-[#F0F0F0] rounded animate-pulse" />
                    <div className="h-5 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-11 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
