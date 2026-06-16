'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">!</span>
        </div>
        <h2 className="text-[16px] font-semibold text-black">Something went wrong</h2>
        <p className="text-[14px] text-[#999] mt-1">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 px-5 py-2 bg-black text-white rounded-xl text-[14px] font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
