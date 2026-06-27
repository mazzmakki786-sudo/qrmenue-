import Link from "next/link"
import { Home } from "lucide-react"

export default function CustomerNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-gray-400">?</span>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm text-gray-500 mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/restaurants"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Home className="w-4 h-4" />
        Browse Restaurants
      </Link>
    </div>
  )
}
