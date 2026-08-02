"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Clock, Power, ImageIcon, Upload, X, Trash2, Landmark } from "lucide-react"
import type { Restaurant } from "@/types"
import Image from "next/image"

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [form, setForm] = useState({
    name: "", name_ur: "", phone: "", city: "", address: "",
    cuisine_type: "", language: "en",
  })
  const [timing, setTiming] = useState({
    opening_time: "09:00",
    closing_time: "23:00",
    is_open: true,
    delivery_fee: 0,
    delivery_time_min: 30,
  })
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerFileInputRef = useRef<HTMLInputElement>(null)
  const [bannerEnabled, setBannerEnabled] = useState(false)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null)
  const [bannerLinkUrl, setBannerLinkUrl] = useState("")
  const [paymentTillId, setPaymentTillId] = useState("")
  const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null)
  const [paymentQrFile, setPaymentQrFile] = useState<File | null>(null)
  const [paymentQrPreview, setPaymentQrPreview] = useState<string | null>(null)
  const paymentQrInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const fetchRestaurant = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: fetchError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .single()

      if (fetchError) throw new Error(fetchError.message)

      if (data) {
        setRestaurant(data as any)
        setForm({
          name: data.name, name_ur: data.name_ur || "",
          phone: data.phone || "", city: data.city,
          address: data.address || "",
          cuisine_type: data.cuisine_type || "",
          language: data.language,
        })
        setTiming({
          opening_time: (data as any).opening_time || "09:00",
          closing_time: (data as any).closing_time || "23:00",
          is_open: (data as any).is_open ?? true,
          delivery_fee: (data as any).delivery_fee ?? 0,
          delivery_time_min: (data as any).delivery_time_min ?? 30,
        })
        setLogoUrl(data.logo_url)
        setBannerEnabled((data as any).banner_enabled ?? false)
        setBannerImageUrl((data as any).banner_image_url || null)
        setBannerLinkUrl((data as any).banner_link_url || "")
        setPaymentTillId((data as any).payment_till_id || "")
        setPaymentQrUrl((data as any).payment_qr_url || null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRestaurant() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSaveChanges = async (fields: Record<string, any>) => {
    if (!restaurant) return
    await supabase.from("restaurants").update(fields).eq("id", restaurant.id)
  }

  const handleSave = async () => {
    if (!restaurant) return
    setSaving(true)
    setSaved(false)

    let newLogoUrl = logoUrl
    let newBannerUrl = bannerImageUrl
    let newPaymentQrUrl = paymentQrUrl

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

    if (bannerFile) {
      const ext = bannerFile.name.split(".").pop()
      const path = `banners/${restaurant.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("dish-images")
        .upload(path, bannerFile)

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("dish-images")
          .getPublicUrl(path)
        newBannerUrl = urlData.publicUrl
      }
    }

    if (paymentQrFile) {
      const ext = paymentQrFile.name.split(".").pop()
      const path = `payment-qr/${restaurant.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("dish-images")
        .upload(path, paymentQrFile)

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("dish-images")
          .getPublicUrl(path)
        newPaymentQrUrl = urlData.publicUrl
      }
    }

    await supabase.from("restaurants").update({
      ...form,
      ...timing,
      logo_url: newLogoUrl,
      banner_enabled: bannerEnabled,
      banner_image_url: bannerEnabled ? newBannerUrl : null,
      banner_link_url: bannerEnabled ? bannerLinkUrl || null : null,
      payment_till_id: paymentTillId.trim() || null,
      payment_qr_url: newPaymentQrUrl,
    }).eq("id", restaurant.id)

    setSaving(false)
    setSaved(true)
    setLogoUrl(newLogoUrl)
    setBannerImageUrl(newBannerUrl)
    setBannerFile(null)
    setBannerPreview(null)
    setLogoFile(null)
    setLogoPreview(null)
    setPaymentQrUrl(newPaymentQrUrl)
    setPaymentQrFile(null)
    setPaymentQrPreview(null)
    setTimeout(() => setSaved(false), 3000)
  }

  const toggleOpen = () => {
    const next = !timing.is_open
    setTiming((p) => ({ ...p, is_open: next }))
    handleSaveChanges({ is_open: next })
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="mb-6">
          <div className="h-8 w-24 bg-[#F0F0F0] rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-[#F0F0F0] rounded animate-pulse mt-2" />
        </div>
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4">
          {[...Array(8)].map((_, i) => (
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
        <p className="text-sm text-[#555] mt-1">Manage your restaurant profile, timing, and preferences</p>
      </div>

      {/* Open/Closed Toggle Card */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${timing.is_open ? "bg-[#25D366]/10" : "bg-red-50"}`}>
              <Power className={`w-5 h-5 ${timing.is_open ? "text-[#25D366]" : "text-[#DC2626]"}`} />
            </div>
            <div>
              <p className="font-semibold text-sm">Restaurant Status</p>
              <p className={`text-xs ${timing.is_open ? "text-[#25D366]" : "text-[#DC2626]"}`}>
                {timing.is_open ? "Open — accepting orders" : "Closed — no orders accepted"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleOpen}
            className={`relative w-12 h-6 rounded-full transition-colors ${timing.is_open ? "bg-[#25D366]" : "bg-[#CCC]"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${timing.is_open ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-2 text-sm text-[#555]">
            <Clock className="w-4 h-4" />
            <span>{timing.opening_time} — {timing.closing_time}</span>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-black">Restaurant Info</h2>

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
      </div>

      {/* Banner Section */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-black">Banner Image</h2>
        </div>
        <p className="text-xs text-[#555]">
          Add a banner that appears at the top of your menu page. If no banner is set, your logo will be shown instead.
        </p>

        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`w-11 h-6 rounded-full transition-colors ${bannerEnabled ? "bg-black" : "bg-[#CCC]"} relative`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${bannerEnabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </div>
          <input type="checkbox" checked={bannerEnabled} onChange={(e) => setBannerEnabled(e.target.checked)} className="sr-only" />
          <span className="text-sm text-black font-medium">Enable banner</span>
        </label>

        {bannerEnabled && (
          <div className="space-y-3">
            {/* Banner Image Upload */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Banner Image</label>
              {bannerPreview || bannerImageUrl ? (
                <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden mb-2 bg-[#F8F8F8]">
                  <Image
                    src={bannerPreview || bannerImageUrl || ""}
                    alt="Banner"
                    fill
                    className="object-cover"
                    sizes="600px"
                  />
                  <button
                    onClick={() => { setBannerFile(null); setBannerPreview(null); setBannerImageUrl(null) }}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="w-full aspect-[3/1] rounded-xl border-2 border-dashed border-[#E8E8E8] flex flex-col items-center justify-center gap-2 text-[#999] hover:border-[#999] hover:text-[#555] transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Upload banner image</span>
                  <span className="text-xs">Recommended: 1200x400px</span>
                </button>
              )}
              <input ref={bannerFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setBannerFile(file)
                setBannerPreview(URL.createObjectURL(file))
              }} />
            </div>

            {/* Banner Link */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Banner Link (optional)</label>
              <input
                type="url"
                value={bannerLinkUrl}
                onChange={(e) => setBannerLinkUrl(e.target.value)}
                placeholder="https://..."
                className="flex h-12 w-full rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <p className="text-[11px] text-[#999] mt-1">Customers will be taken to this URL when they tap the banner</p>
            </div>
          </div>
        )}
      </div>

      {/* Bank Transfer / Wallet Payment */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-black">Bank Transfer / Wallet</h2>
        </div>
        <p className="text-xs text-[#555]">
          Add your JazzCash / Easypaisa TILL ID and QR code. Customers see these details on checkout when they select &quot;Bank Transfer&quot;, and on the order confirmation screen.
        </p>

        <div>
          <label className="block text-sm font-medium text-black mb-2">TILL / Wallet ID</label>
          <input
            type="text"
            value={paymentTillId}
            onChange={(e) => setPaymentTillId(e.target.value)}
            placeholder="e.g. 0312345678"
            className="flex h-12 w-full rounded-xl bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">Payment QR Code</label>
          {paymentQrPreview || paymentQrUrl ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden mb-2 bg-[#F8F8F8] border border-[#E8E8E8]">
              <Image
                src={paymentQrPreview || paymentQrUrl || ""}
                alt="Payment QR"
                fill
                className="object-contain p-1"
                sizes="128px"
                unoptimized
              />
              <button
                onClick={() => { setPaymentQrFile(null); setPaymentQrPreview(null); setPaymentQrUrl(null) }}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80 transition-colors"
                aria-label="Remove payment QR"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => paymentQrInputRef.current?.click()}
              className="w-32 h-32 rounded-xl border-2 border-dashed border-[#E8E8E8] flex flex-col items-center justify-center gap-2 text-[#999] hover:border-[#999] hover:text-[#555] transition-colors"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs text-center px-1">Upload QR image</span>
            </button>
          )}
          <input
            ref={paymentQrInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setPaymentQrFile(file)
              setPaymentQrPreview(URL.createObjectURL(file))
            }}
          />
          <p className="text-[11px] text-[#999] mt-1">Take a screenshot of your payment QR (from JazzCash, Easypaisa, or bank app) and upload it.</p>
        </div>
      </div>

      {/* Default Language */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-black">Default Language</h2>
        <div className="space-y-1.5">
          <label htmlFor="language" className="block text-sm font-medium text-black">Language</label>
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
      </div>

      {/* Operation Timing */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-black">Operation Hours</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Opening Time"
            id="opening_time"
            type="time"
            value={timing.opening_time}
            onChange={(e) => setTiming((p) => ({ ...p, opening_time: e.target.value }))}
          />
          <Input
            label="Closing Time"
            id="closing_time"
            type="time"
            value={timing.closing_time}
            onChange={(e) => setTiming((p) => ({ ...p, closing_time: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Delivery Fee (Rs)"
            id="delivery_fee"
            type="number"
            value={String(timing.delivery_fee)}
            onChange={(e) => setTiming((p) => ({ ...p, delivery_fee: Number(e.target.value) }))}
            placeholder="0"
          />
          <Input
            label="Delivery Time (min)"
            id="delivery_time_min"
            type="number"
            value={String(timing.delivery_time_min)}
            onChange={(e) => setTiming((p) => ({ ...p, delivery_time_min: Number(e.target.value) }))}
            placeholder="30"
          />
        </div>
      </div>

      <Button onClick={handleSave} loading={saving} className="w-full">
        {saved ? "Saved!" : "Save Changes"}
      </Button>
    </div>
  )
}
