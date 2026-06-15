"use client"

import { Input } from "@/components/ui/input"

interface Props {
  name: string
  phone: string
  address: string
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onAddressChange: (v: string) => void
}

export function DeliveryForm({ name, phone, address, onNameChange, onPhoneChange, onAddressChange }: Props) {
  return (
    <div className="space-y-4">
      <Input label="Your Name *" id="name" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter your name" />
      <Input label="Phone Number *" id="phone" value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="0300-XXXXXXX" />
      <div className="space-y-1.5">
        <label htmlFor="address" className="block text-sm font-medium text-[#111]">Delivery Address *</label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="House #, Street, Area, City"
          className="flex h-24 w-full rounded-[10px] bg-[#F9FAFB] border border-[#F0F0F0] px-4 py-3 text-base placeholder:text-[#999] focus:outline-none focus:border-black transition-colors resize-none"
        />
      </div>
    </div>
  )
}
