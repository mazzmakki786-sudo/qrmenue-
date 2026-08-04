export default function MenuPageLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/30 h-14 flex items-center shadow-sm">
        <div className="flex items-center justify-between w-full px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#F0F0F0] animate-pulse" />
              <div className="hidden sm:block h-3 w-24 bg-[#F0F0F0] rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-[#F0F0F0] rounded-full animate-pulse" />
            <div className="hidden md:block h-8 w-24 bg-[#F0F0F0] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="relative w-full h-52 bg-[#F0F0F0] animate-pulse" />

        <div className="px-4 pt-4 max-w-[600px] mx-auto">
          <div className="flex items-end gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F0F0F0] animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 max-w-full bg-[#F0F0F0] rounded animate-pulse" />
              <div className="h-3 w-28 bg-[#F0F0F0] rounded animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            <div className="h-6 w-20 bg-[#F0F0F0] rounded-full animate-pulse" />
            <div className="h-3 w-28 bg-[#F0F0F0] rounded animate-pulse" />
            <div className="h-3 w-20 bg-[#F0F0F0] rounded animate-pulse" />
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shrink-0 h-9 w-20 rounded-full bg-[#F0F0F0] animate-pulse" />
            ))}
          </div>

          <div className="space-y-6 pb-4">
            {[...Array(3)].map((_, section) => (
              <div key={section}>
                <div className="h-4 w-24 bg-[#F0F0F0] rounded animate-pulse mb-3" />
                <div className="grid grid-cols-2 gap-2.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-[#F0F0F0] overflow-hidden animate-pulse bg-[#F9FAFB]">
                      <div className="aspect-square bg-[#F0F0F0]" />
                      <div className="p-3 space-y-2">
                        <div className="h-3.5 bg-[#F0F0F0] rounded w-3/4" />
                        <div className="h-3 bg-[#F0F0F0] rounded w-1/2" />
                        <div className="h-4 bg-[#F0F0F0] rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-3 left-0 right-0 px-4 z-40 pointer-events-none">
          <div className="max-w-[600px] mx-auto">
            <div className="h-12 bg-[#F0F0F0] rounded-2xl animate-pulse shadow-sm pointer-events-auto" />
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="relative w-full h-56 bg-[#F0F0F0] animate-pulse" />

        <div className="bg-white pb-10 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-start gap-6 py-6">
              <div className="w-20 h-20 rounded-2xl bg-[#F0F0F0] animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-64 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="h-4 w-48 bg-[#F0F0F0] rounded animate-pulse" />
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <div className="h-6 w-24 bg-[#F0F0F0] rounded-full animate-pulse" />
                  <div className="h-4 w-28 bg-[#F0F0F0] rounded animate-pulse" />
                  <div className="h-4 w-20 bg-[#F0F0F0] rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            <aside className="w-48 shrink-0">
              <div className="sticky top-[72px] space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 rounded-xl bg-[#F0F0F0] animate-pulse" />
                ))}
              </div>
            </aside>

            <main className="flex-1 min-w-0 space-y-8">
              <div className="h-16 w-full max-w-xl bg-[#F0F0F0] rounded-2xl animate-pulse" />
              <div className="space-y-12">
                {[...Array(3)].map((_, section) => (
                  <div key={section}>
                    <div className="h-5 w-32 bg-[#F0F0F0] rounded animate-pulse mb-4" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-[#F0F0F0] overflow-hidden animate-pulse bg-[#F9FAFB]">
                          <div className="aspect-square bg-[#F0F0F0]" />
                          <div className="p-4 space-y-2">
                            <div className="h-4 w-3/4 bg-[#F0F0F0] rounded" />
                            <div className="h-3 w-1/2 bg-[#F0F0F0] rounded" />
                            <div className="h-4 w-1/3 bg-[#F0F0F0] rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </main>

            <aside className="w-80 shrink-0">
              <div className="sticky top-20 space-y-4">
                <div className="bg-white rounded-xl border border-border overflow-hidden animate-pulse">
                  <div className="p-4 border-b border-border">
                    <div className="h-4 w-28 bg-[#F0F0F0] rounded" />
                  </div>
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F0F0F0] shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-24 bg-[#F0F0F0] rounded" />
                          <div className="h-3 w-16 bg-[#F0F0F0] rounded" />
                        </div>
                        <div className="h-3 w-16 bg-[#F0F0F0] rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 pt-2 border-t border-border mx-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-12 bg-[#F0F0F0] rounded" />
                      <div className="h-5 w-20 bg-[#F0F0F0] rounded" />
                    </div>
                    <div className="h-12 w-full bg-[#F0F0F0] rounded-xl" />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
