"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Plus, Trash2, Table2, Lock, ArrowUp } from "lucide-react"

type Table = {
  id: string
  table_number: string
  capacity: number
  is_active: boolean
  is_occupied: boolean
  created_at: string
}

const TABLES_ENABLED_PLANS = ["growth", "growth-yearly", "premium", "premium-yearly"]

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [tableNumber, setTableNumber] = useState("")
  const [capacity, setCapacity] = useState(4)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState<string>("trial")

  const canHaveTables = TABLES_ENABLED_PLANS.includes(plan)

  const fetchTables = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch plan info first
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("plan")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (restaurant) {
        setPlan(restaurant.plan)
        if (!TABLES_ENABLED_PLANS.includes(restaurant.plan)) {
          setLoading(false)
          return
        }
      }

      const res = await fetch("/api/owner/tables")
      if (res.ok) {
        const data = await res.json()
        setTables(data.tables)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTables() }, [fetchTables])

  const handleAdd = async () => {
    if (!tableNumber.trim()) {
      setError("Table number is required")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/owner/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_number: tableNumber.trim(), capacity }),
      })
      if (res.ok) {
        const data = await res.json()
        setTables((prev) => [...prev, data.table])
        setShowAddDialog(false)
        setTableNumber("")
        setCapacity(4)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to add table")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleMarkVacant = async (id: string) => {
    const table = tables.find((t) => t.id === id)
    if (!table?.is_occupied) return

    const confirmed = window.confirm(`Mark table ${table.table_number} as vacant? Only do this if the order was already completed or cancelled outside the system.`)
    if (!confirmed) return

    try {
      const res = await fetch(`/api/owner/tables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_occupied: false }),
      })
      if (res.ok) {
        setTables((prev) => prev.map((t) => t.id === id ? { ...t, is_occupied: false } : t))
      } else {
        const data = await res.json()
        alert(data.error || "Failed to mark table as vacant")
      }
    } catch {
      alert("Something went wrong")
    }
  }

  const handleDelete = async (id: string) => {
    const table = tables.find((t) => t.id === id)
    if (table?.is_occupied) {
      alert(`Table ${table.table_number} is currently occupied. Please wait until the order is completed before deleting.`)
      return
    }

    const confirmed = window.confirm("Delete this table? This cannot be undone.")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/owner/tables/${id}`, { method: "DELETE" })
      if (res.ok) {
        setTables((prev) => prev.filter((t) => t.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete table")
      }
    } catch {
      alert("Something went wrong while deleting the table")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full" />
      </div>
    )
  }

  // ── Plan upgrade prompt ──
  if (!canHaveTables) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Table Management</h1>
        </div>

        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold mb-2">Tables are locked</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Table management is available on <strong>Growth</strong> and <strong>Premium</strong> plans.
            Upgrade to start adding tables for your customers.
          </p>
          <Link
            href="/dashboard/subscription"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
          >
            <ArrowUp className="w-4 h-4" />
            Upgrade Plan
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Table Management</h1>
          <p className="text-sm text-gray-500 mt-1">{tables.length} table{tables.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Table
        </Button>
      </div>

      {tables.length === 0 ? (
        <Card className="p-12 text-center">
          <Table2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tables yet. Add your first table.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`relative p-4 rounded-xl border-2 text-center transition-colors ${
                table.is_occupied
                  ? "border-red-300 bg-red-50"
                  : "border-green-300 bg-green-50"
              }`}
            >
              <button
                onClick={() => handleDelete(table.id)}
                className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 hover:bg-white/50 rounded"
                title="Delete table"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <p className="text-lg font-bold mt-1">{table.table_number}</p>
              <p className="text-xs text-gray-500">Cap: {table.capacity}</p>
              <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                table.is_occupied
                  ? "bg-red-200 text-red-800"
                  : "bg-green-200 text-green-800"
              }`}>
                {table.is_occupied ? "Occupied" : "Vacant"}
              </span>
              {table.is_occupied && (
                <button
                  onClick={() => handleMarkVacant(table.id)}
                  className="block mx-auto mt-2 text-xs text-red-600 hover:text-red-800 underline underline-offset-2"
                  title="Manual override — mark as vacant when order is completed outside the system"
                >
                  Mark Vacant
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={(open: boolean) => { if (!open) setShowAddDialog(false); }}>
        <DialogContent>
          <div className="max-w-sm mx-auto">
            <h2 className="text-lg font-semibold mb-4">Add Table</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table Number</label>
                <Input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. 1, A1, Patio-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity (persons)</label>
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  min={1}
                />
              </div>
              <Button onClick={handleAdd} disabled={saving} className="w-full">
                {saving ? "Adding..." : "Add Table"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
