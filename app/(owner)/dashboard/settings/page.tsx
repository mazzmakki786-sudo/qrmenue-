"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QRCodeDisplay } from "@/components/shared/QRCodeDisplay"
import { Camera, Copy, Check } from "lucide-react"
import type { Restaurant } from "@/types"

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
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchRestaurant = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", user.id)
      .single()

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

  const menuUrl = restaurant
    ? `${process.env.NEXT_PUBLIC_APP_URL || "https://qrmenu.vercel.app"}/menu/${restaurant.slug}`
    : ""

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(menuUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!restaurant) {
    return <div className="text-center text-[#999] py-12">
      <div className="h-6 w-40 bg-[#E8E8E8] rounded animate-pulse mx-auto mb-4" />
      <div className="h-4 w-60 bg-[#E8E8E8] rounded animate-pulse mx-auto" />
    </div>
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold">Profile</h1>

      {/* Restaurant Info */}
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-4">
        <h2 className="text-sm font-semibold">Restaurant Info</h2>

        {/* Logo Upload */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#F8F8F8] flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#555]">
                  {form.name ? form.name[0] : "R"}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center"
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
            <p className="font-medium text-[#111]">{form.name || "Your Restaurant"}</p>
            <p>Upload logo (optional)</p>
          </div>
        </div>

        <Input label="Restaurant Name *" id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <Input label="Restaurant Name (Urdu)" id="name_ur" value={form.name_ur} onChange={(e) => setForm((p) => ({ ...p, name_ur: e.target.value }))} />
        <Input label="Cuisine Type" id="cuisine_type" value={form.cuisine_type} onChange={(e) => setForm((p) => ({ ...p, cuisine_type: e.target.value }))} placeholder="e.g. BBQ, Fast Food, Chinese" />
        <Input label="Phone / WhatsApp *" id="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <Input label="City *" id="city" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
        <Input label="Address" id="address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
        <div className="space-y-1.5">
          <label htmlFor="language" className="block text-sm font-medium text-[#111]">Default Language</label>
          <select
            id="language"
            value={form.language}
            onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
            className="flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base focus:outline-none focus:border-black transition-colors"
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Your URL */}
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5 space-y-3">
        <h2 className="text-sm font-semibold">Your Restaurant URL</h2>
        <div className="flex items-center gap-2 p-3 bg-[#F8F8F8] rounded-[10px]">
          <code className="text-sm flex-1 break-all">{menuUrl}</code>
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 p-2 hover:bg-[#E8E8E8] rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#555]" />}
          </button>
        </div>
        <p className="text-xs text-[#555]">
          Share this link with your customers or generate a QR code below.
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-5">
        <h2 className="text-sm font-semibold mb-4">Your QR Code</h2>
        <QRCodeDisplay
          restaurantSlug={restaurant.slug}
          restaurantName={restaurant.name}
        />
      </div>
    </div>
  )
}
