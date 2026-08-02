"use client"

import { useState } from "react"
import { Loader2, X, Eye, EyeOff } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddUserModal({ open, onClose, onSuccess }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), city: city.trim(), password }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.details && Array.isArray(json.details)) {
          const errors: Record<string, string> = {}
          json.details.forEach((d: any) => { errors[d.field] = d.message })
          setFieldErrors(errors)
        }
        setError(json.error || "Failed to create user")
        return
      }

      // Success
      resetForm()
      onSuccess()
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setCity("")
    setPassword("")
    setError(null)
    setFieldErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">Add New Owner</h3>
          <button onClick={handleClose} className="p-1 hover:bg-[#F0F0F0] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555]" />
          </button>
        </div>

        <p className="text-sm text-[#555] mb-4">
          Create a new restaurant owner account. A trial restaurant will be created automatically.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#555] mb-1">Restaurant Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#F0F0F0] text-sm outline-none focus:border-black transition-colors"
              placeholder="e.g. Pizza Palace"
              required
            />
            {fieldErrors.name && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#555] mb-1">Owner Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#F0F0F0] text-sm outline-none focus:border-black transition-colors"
              placeholder="owner@example.com"
              required
            />
            {fieldErrors.email && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.email}</p>}
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-[#555] mb-1">Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#F0F0F0] text-sm outline-none focus:border-black transition-colors"
              placeholder="Min 6 chars, mixed case + number + special"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[30px] text-[#999] hover:text-black">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {fieldErrors.password && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#F0F0F0] text-sm outline-none focus:border-black transition-colors"
                placeholder="+92 300 1234567"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#555] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#F0F0F0] text-sm outline-none focus:border-black transition-colors"
                placeholder="Lahore"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs text-[#DC2626]">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-[#F0F0F0] text-sm font-semibold hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Owner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
