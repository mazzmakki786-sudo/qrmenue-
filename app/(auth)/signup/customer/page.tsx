"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function CustomerSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { error: insertError } = await supabase.from("customers").insert({
        id: authData.user.id,
        name: name || null,
        email: email || null,
      })
      if (insertError) {
        console.error("Customer insert error:", insertError.message)
      }
    }

    setLoading(false)

    if (authData.session) {
      router.push("/restaurants")
    } else {
      router.push("/login?message=Check your email to verify your account")
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link href="/signup" className="text-sm text-[#555555] hover:text-black inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Back
        </Link>
      </div>
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-sm text-[#555555] mt-1">Join as a customer to browse and order</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
        <Input label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} />
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="text-sm text-[#555555] text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#25D366] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
