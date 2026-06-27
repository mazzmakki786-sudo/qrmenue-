"use client"

import { useRouter } from "next/navigation"
import { Store, User, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()

  return (
    <div className="w-full flex flex-col items-center">
      {/* Back nav */}
      <div className="w-full mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#555] hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-1">Join QRMenu.pk</h1>
        <p className="text-sm text-[#555]">Choose how you want to get started</p>
      </div>

      {/* Options */}
      <div className="w-full space-y-3">
        <button
          onClick={() => router.push("/signup/customer")}
          className="group w-full flex items-center gap-4 p-5 rounded-2xl border border-[#F0F0F0] hover:border-black hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">I'm a Customer</p>
            <p className="text-sm text-[#555]">Browse menus, place orders</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-black transition-colors shrink-0" />
        </button>

        <button
          onClick={() => router.push("/signup/restaurant")}
          className="group w-full flex items-center gap-4 p-5 rounded-2xl border border-[#F0F0F0] hover:border-[#25D366] hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">I Own a Restaurant</p>
            <p className="text-sm text-[#555]">Create digital menu, manage orders</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-black transition-colors shrink-0" />
        </button>
      </div>

      {/* Footer nav */}
      <div className="flex flex-col items-center gap-3 mt-6 w-full">
        <Link href="/login" className="text-sm text-[#555] hover:text-black transition-colors">
          Already have an account? <span className="text-[#25D366] font-semibold">Sign in</span>
        </Link>
        <Link href="/" className="text-xs text-[#999] hover:text-black transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  )
}
