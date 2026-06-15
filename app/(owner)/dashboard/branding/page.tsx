"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { QR_GRADIENT_PRESETS, type QRGradientPreset } from "@/lib/branding"
import { Check, Upload, Palette, QrCode, Info, ImageIcon } from "lucide-react"
import NextImage from "next/image"

export default function BrandingPage() {
  const { restaurant, planLimits, loading } = useSubscription()
  const [primaryColor, setPrimaryColor] = useState("#25D366")
  const [accentColor, setAccentColor] = useState("#000000")
  const [bannerEnabled, setBannerEnabled] = useState(false)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null)
  const [bannerLinkUrl, setBannerLinkUrl] = useState("")
  const [qrGradient, setQrGradient] = useState<QRGradientPreset>("classic")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasCustomBranding = planLimits.customBranding
  const isPremium = restaurant?.plan === "premium"

  useEffect(() => {
    if (!restaurant) return

    setPrimaryColor((restaurant as any).brand_primary_color || "#25D366")
    setAccentColor((restaurant as any).brand_accent_color || "#000000")
    setBannerEnabled((restaurant as any).banner_enabled ?? false)
    setBannerImageUrl((restaurant as any).banner_image_url || null)
    setBannerLinkUrl((restaurant as any).banner_link_url || "")
  }, [restaurant])

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!restaurant) return
    setSaving(true)

    const supabase = createClient()

    let newBannerUrl = bannerImageUrl

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

    await supabase
      .from("restaurants")
      .update({
        brand_primary_color: primaryColor,
        brand_accent_color: accentColor,
        banner_enabled: bannerEnabled,
        banner_image_url: bannerEnabled ? newBannerUrl : null,
        banner_link_url: bannerEnabled ? bannerLinkUrl || null : null,
      })
      .eq("id", restaurant.id)

    setSaving(false)
    setSaved(true)
    setBannerImageUrl(newBannerUrl)
    setBannerFile(null)
    setBannerPreview(null)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    )
  }

  if (!hasCustomBranding) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F0F0F0] flex items-center justify-center mx-auto mb-4">
          <Palette className="w-8 h-8 text-[#999]" />
        </div>
        <h2 className="text-xl font-bold mb-2">Personal Branding</h2>
        <p className="text-sm text-[#555] max-w-sm">
          Personal branding is available on the <strong>Growth</strong> and{" "}
          <strong>Premium</strong> plans. Upgrade to customize your menu colors,
          remove QRMenu.pk branding, and more.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <section>
        <h1 className="text-3xl font-bold text-black">Personal Branding</h1>
        <p className="text-sm text-[#555] mt-1">
          Customize your restaurant&apos;s look and feel on the customer menu
        </p>
      </section>

      {/* Preview */}
      <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-black mb-4">Color Preview</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#555]">Primary</span>
            <div className="w-10 h-10 rounded-xl border border-[#F0F0F0]" style={{ background: primaryColor }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#555]">Accent</span>
            <div className="w-10 h-10 rounded-xl border border-[#F0F0F0]" style={{ background: accentColor }} />
          </div>
          <div
            className="flex-1 h-10 rounded-xl"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
          />
        </div>
      </section>

      {/* Colors */}
      <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-6 space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-black">Menu Colors</h3>

        <div>
          <label className="block text-sm font-medium text-black mb-2">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-12 rounded-xl border border-[#F0F0F0] cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 h-12 rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-sm focus:outline-none focus:border-black transition-colors font-mono"
              placeholder="#25D366"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-12 h-12 rounded-xl border border-[#F0F0F0] cursor-pointer"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="flex-1 h-12 rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-sm focus:outline-none focus:border-black transition-colors font-mono"
              placeholder="#000000"
            />
          </div>
        </div>
      </section>

      {/* QR Gradient */}
      <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-black">QR Code Style</h3>
        </div>
        <p className="text-xs text-[#555]">Choose a color preset for your QR code</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(QR_GRADIENT_PRESETS) as [QRGradientPreset, typeof QR_GRADIENT_PRESETS[QRGradientPreset]][]).map(
            ([key, preset]) => (
              <button
                key={key}
                onClick={() => setQrGradient(key)}
                className={`relative rounded-xl border-2 p-3 transition-all ${
                  qrGradient === key
                    ? "border-black bg-[#F8F8F8]"
                    : "border-[#F0F0F0] hover:border-[#999]"
                }`}
              >
                {qrGradient === key && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className="w-full h-8 rounded-lg mb-2"
                  style={{ background: preset.fgColor }}
                />
                <p className="text-xs font-medium text-black">{preset.label}</p>
                <p className="text-[10px] text-[#999] font-mono mt-0.5">{preset.fgColor}</p>
              </button>
            )
          )}
        </div>
      </section>

      {/* Premium Banner */}
      {isPremium && (
        <section className="bg-white border border-[#F0F0F0] rounded-[14px] p-6 space-y-5">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-black">
              Promotional Banner
            </h3>
            <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Premium
            </span>
          </div>
          <p className="text-xs text-[#555]">
            Show a promotional banner on your customer menu. Great for offers, events, or
            social media links.
          </p>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                bannerEnabled ? "bg-black" : "bg-[#CCC]"
              } relative`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  bannerEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </div>
            <input
              type="checkbox"
              checked={bannerEnabled}
              onChange={(e) => setBannerEnabled(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm text-black font-medium">Enable banner</span>
          </label>

          {bannerEnabled && (
            <>
              {/* Banner Image Upload */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Banner Image</label>
                {bannerPreview || bannerImageUrl ? (
                  <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden mb-3">
                    <NextImage
                      src={bannerPreview || bannerImageUrl || ""}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                      sizes="600px"
                    />
                    <button
                      onClick={() => {
                        setBannerFile(null)
                        setBannerPreview(null)
                        setBannerImageUrl(null)
                      }}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[3/1] rounded-xl border-2 border-dashed border-[#E8E8E8] flex flex-col items-center justify-center gap-2 text-[#999] hover:border-[#999] transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Upload banner image</span>
                    <span className="text-xs">Recommended: 1200x400px</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerSelect}
                  className="hidden"
                />
              </div>

              {/* Banner Link */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Banner Link (optional)
                </label>
                <input
                  type="url"
                  value={bannerLinkUrl}
                  onChange={(e) => setBannerLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex h-12 w-full rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <p className="text-[11px] text-[#999] mt-1">
                  Customers will be taken to this URL when they tap the banner
                </p>
              </div>

              {/* Preview */}
              {bannerPreview && (
                <div className="bg-[#F9FAFB] rounded-xl p-4">
                  <p className="text-xs font-medium text-[#555] mb-2">Preview on menu:</p>
                  <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden">
                    <NextImage
                      src={bannerPreview}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                      sizes="600px"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {!isPremium && (
        <section className="bg-[#F9FAFB] border border-[#F0F0F0] rounded-xl p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#25D366] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-black">Premium Feature</h4>
            <p className="text-xs text-[#555] mt-1">
              Promotional banners on the customer menu are exclusive to the Premium plan.
              <a
                href="/dashboard/subscription"
                className="text-[#25D366] font-medium hover:underline ml-1"
              >
                Upgrade to Premium
              </a>
            </p>
          </div>
        </section>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saved ? "Saved!" : saving ? "Saving..." : "Save Branding"}
        </Button>
        {saved && (
          <span className="text-sm text-[#16A34A] font-medium flex items-center gap-1">
            <Check className="w-4 h-4" /> Changes saved
          </span>
        )}
      </div>
    </div>
  )
}
