"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera } from "lucide-react"
import type { Restaurant } from "@/types"
import Image from "next/image"

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [form, setForm] = useState({
    name: "", name_ur: "", phone: "", city: "", address: "",
    cuisine_type: "", language: "en",
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchRestaurant = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: fetchError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .single()

      if (fetchError) throw new Error(fetchError.message)

      if (data) {
        setRestaurant(data)
        setForm({
          name: data.name, name_ur: data.name_ur || "",
          phone: data.phone || "", city: data.city,
          address: data.address || "",
          cuisine_type: data.cuisine_type || "",
          language: data.language,
        })
        setLogoUrl(data.logo_url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRestaurant() }, [])

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!restaurant) return
    setSaving(true)
    const supabase = createClient()

    let newLogoUrl = logoUrl

    if (logoFile) {
      const ext = logoFile.name.split(".").pop()
      const path = `restaurant-logos/${restaurant.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("dish-images")
        .upload(path, logoFile)

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("dish-images")
          .getPublicUrl(path)
        newLogoUrl = urlData.publicUrl
      }
    }

    await supabase.from("restaurants").update({
      ...form,
      logo_url: newLogoUrl,
    }).eq("id", restaurant.id)

    setSaving(false)
    setSaved(true)
    setLogoUrl(newLogoUrl)
    setLogoFile(null)
    setLogoPreview(null)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="mb-6">
          <div className="h-8 w-24 bg-[#F0F0F0] rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-[#F0F0F0] rounded animate-pulse mt-2" />
        </div>
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4">
          <div className="h-4 w-32 bg-[#F0F0F0] rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F0F0F0] animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-36 bg-[#F0F0F0] rounded animate-pulse" />
              <div className="h-3 w-24 bg-[#F0F0F0] rounded animate-pulse" />
            </div>
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-[#F0F0F0] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return <div className="text-center text-[#999] py-12">No restaurant found.</div>
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Profile</h1>
        <p className="text-sm text-[#555] mt-1">Manage your restaurant profile and preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-black">Restaurant Info</h2>

        {/* Logo Upload */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#F9FAFB] flex items-center justify-center overflow-hidden border border-[#F0F0F0]">
              {logoPreview ? (
                <Image src={logoPreview} alt="Preview" width={64} height={64} className="w-full h-full object-cover" />
              ) : logoUrl ? (
                <Image src={logoUrl} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#555]">
                  {form.name ? form.name[0] : "R"}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Camera className="w-3 h-3" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />
          </div>
          <div className="text-sm text-[#555]">
            <p className="font-medium text-black">{form.name || "Your Restaurant"}</p>
            <p className="text-xs">Upload logo (optional)</p>
          </div>
        </div>

        <Input label="Restaurant Name *" id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <Input label="Restaurant Name (Urdu)" id="name_ur" value={form.name_ur} onChange={(e) => setForm((p) => ({ ...p, name_ur: e.target.value }))} />
        <Input label="Cuisine Type" id="cuisine_type" value={form.cuisine_type} onChange={(e) => setForm((p) => ({ ...p, cuisine_type: e.target.value }))} placeholder="e.g. BBQ, Fast Food, Chinese" />
        <Input label="Phone / WhatsApp *" id="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <Input label="City *" id="city" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
        <Input label="Address" id="address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
        <div className="space-y-1.5">
          <label htmlFor="language" className="block text-sm font-medium text-black">Default Language</label>
          <select
            id="language"
            value={form.language}
            onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
            className="flex h-12 w-full rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base focus:outline-none focus:border-black transition-colors"
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
