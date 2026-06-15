"use client"

import { useRouter } from "next/navigation"
import { Store, User, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold">Join QRMenu.pk</h1>
        <p className="text-sm text-[#555555] mt-1">Choose how you want to get started</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => router.push("/signup/customer")}
          className="group w-full flex items-center gap-4 p-5 rounded-2xl border border-[#F0F0F0] hover:border-black hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">I'm a Customer</p>
            <p className="text-sm text-[#555555]">Browse menus, place orders</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#555555] group-hover:text-black transition-colors" />
        </button>

        <button
          onClick={() => router.push("/signup/restaurant")}
          className="group w-full flex items-center gap-4 p-5 rounded-2xl border border-[#F0F0F0] hover:border-black hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">I Own a Restaurant</p>
            <p className="text-sm text-[#555555]">Create digital menu, manage orders</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#555555] group-hover:text-black transition-colors" />
        </button>
      </div>

      <p className="text-sm text-[#555555] text-center mt-8">
        Already have an account?{" "}
        <Link href="/login" className="text-[#25D366] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
