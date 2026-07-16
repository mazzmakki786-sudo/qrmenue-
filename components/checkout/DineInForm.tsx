"use client"

import { Input } from "@/components/ui/input"
import { Table2, Users } from "lucide-react"

export interface TableOption {
  id: string
  table_number: string
  capacity: number
}

interface Props {
  name: string
  phone: string
  tableNumber: string
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onTableChange: (v: string) => void
  /** Available tables returned from the public API. When provided a grid selector is shown instead of a text input. */
  tables?: TableOption[]
}

export function DineInForm({ name, phone, tableNumber, onNameChange, onPhoneChange, onTableChange, tables }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border space-y-4">
      <Input label="Your Name" id="name" required value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter your name" />
      <Input label="Phone Number" id="phone" value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="0300-XXXXXXX (optional for dine-in)" />

      {/* Table selection: show a styled grid when tables are available */}
      {tables && tables.length > 0 ? (
        <div>
          <label className="block text-sm font-medium mb-2">Select a Table</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tables.map((t) => {
              const selected = tableNumber === t.table_number
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTableChange(selected ? "" : t.table_number)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-text-secondary hover:border-primary/30 hover:bg-[#FAFAFA]"
                  }`}
                >
                  <Table2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">{t.table_number}</span>
                  <span className="text-[10px] flex items-center gap-0.5 opacity-70">
                    <Users className="w-3 h-3" />
                    {t.capacity}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Fallback: plain text input when no tables API data (legacy support) */
        <Input label="Table Number" id="table" required value={tableNumber} onChange={(e) => onTableChange(e.target.value)} placeholder="e.g. 5" />
      )}
    </div>
  )
}
