"use client"

import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

interface Props {
  name: string
  phone: string
  address: string
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onAddressChange: (v: string) => void
}

function openMapsForLocation() {
  if (!navigator.geolocation) {
    window.open("https://maps.google.com", "_blank")
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`
      window.open(url, "_blank")
    },
    () => {
      // Fallback: open Google Maps for manual sharing
      window.open("https://maps.google.com", "_blank")
    }
  )
}

export function DeliveryForm({ name, phone, address, onNameChange, onPhoneChange, onAddressChange }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border space-y-4">
      <Input label="Your Name *" id="name" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter your name" />
      <Input label="Phone Number *" id="phone" value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="0300-XXXXXXX" />
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="address" className="block text-sm font-medium text-text-primary">Delivery Address *</label>
          <button
            type="button"
            onClick={openMapsForLocation}
            className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
            title="Share your live location via Google Maps"
          >
            <MapPin className="w-3.5 h-3.5" />
            Share Location
          </button>
        </div>
        <textarea
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="House #, Street, Area, City"
          className="flex h-24 w-full rounded-[10px] bg-[#F9FAFB] border border-border px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
        />
        <p className="text-[10px] text-text-muted flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Or tap &quot;Share Location&quot; to send your live location via Google Maps
        </p>
      </div>
    </div>
  )
}
