import Link from "next/link"

export default function MenuNotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-text-muted">?</span>
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Menu not found</h2>
        <p className="text-sm text-text-secondary mt-1">This restaurant menu could not be found.</p>
        <Link
          href="/restaurants"
          className="inline-block mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all"
        >
          Browse Restaurants
        </Link>
      </div>
    </div>
  )
}