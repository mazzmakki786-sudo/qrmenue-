"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput, validatePassword } from "@/components/ui/password-input"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"

export default function CustomerSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const pwError = validatePassword(password)
    if (pwError) {
      setError(pwError)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/signup/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      setLoading(false)
      router.push("/login?message=Check your email to verify your account")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mb-8">
        <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm text-[#555] hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-1">Create Account</h1>
        <p className="text-sm text-[#555]">Join as a customer to browse and order</p>
      </div>

      <form onSubmit={handleSignup} className="w-full space-y-4">
        <Input label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
        <PasswordInput
          label="Password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          required
          showRequirements
        />

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-xs text-[#DC2626]">{error}</p>
          </div>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

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
