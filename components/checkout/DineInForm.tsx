"use client"

import { Input } from "@/components/ui/input"

interface Props {
  name: string
  phone: string
  tableNumber: string
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onTableChange: (v: string) => void
}

export function DineInForm({ name, phone, tableNumber, onNameChange, onPhoneChange, onTableChange }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border space-y-4">
      <Input label="Your Name *" id="name" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter your name" />
      <Input label="Phone Number *" id="phone" value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="0300-XXXXXXX" />
      <Input label="Table Number *" id="table" value={tableNumber} onChange={(e) => onTableChange(e.target.value)} placeholder="e.g. 5" />
    </div>
  )
}
