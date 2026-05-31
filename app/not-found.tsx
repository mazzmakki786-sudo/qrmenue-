import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F8F8F8] flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl font-bold text-[#999]">?</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-sm text-[#555] mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="primary">Back to Home</Button>
      </Link>
    </div>
  )
}
