"use client"

import { Input } from "@/components/ui/input"

interface Props {
  name: string
  phone: string
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
}

export function TakeawayForm({ name, phone, onNameChange, onPhoneChange }: Props) {
  return (
    <div className="space-y-4">
      <Input label="Your Name *" id="name" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter your name" />
      <Input label="Phone Number" id="phone" value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="0300-XXXXXXX" />
    </div>
  )
}
