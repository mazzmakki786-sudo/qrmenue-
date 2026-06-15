'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
        <button onClick={reset} className="mt-4 px-4 py-2 bg-black text-white rounded-md text-sm">Try again</button>
      </div>
    </div>
  )
}
