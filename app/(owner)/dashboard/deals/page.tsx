"use client"

import { useEffect, useState, useCallback } from "react"
import { DealCard } from "@/components/owner/DealCard"
import { AddDealForm } from "@/components/owner/AddDealForm"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Percent, Plus, Tag, X, AlertTriangle } from "lucide-react"
import type { Deal, Dish, DealFormData } from "@/types"
import { useSubscription } from "@/lib/hooks/useSubscription"

type FilterTab = "all" | "active" | "expired" | "upcoming"

export default function DealsManagementPage() {
  const sub = useSubscription()
  const { restaurant } = sub
  const [deals, setDeals] = useState<Deal[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDeals = useCallback(async () => {
    if (!restaurant?.id) return
    setLoading(true)
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient()
      const [dealsRes, dishesRes] = await Promise.all([
        supabase.from("deals").select("*").eq("restaurant_id", restaurant.id).order("created_at", { ascending: false }),
        supabase.from("dishes").select("*").eq("restaurant_id", restaurant.id).order("name_en"),
      ])
      setDeals(dealsRes.data || [])
      setDishes(dishesRes.data || [])
    } catch {
      setError("Failed to load deals")
    } finally {
      setLoading(false)
    }
  }, [restaurant?.id])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  const handleCreateDeal = async (data: DealFormData) => {
    if (!restaurant?.id) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/owner/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(typeof json.error === "string" ? json.error : "Failed to create deal")
      }
      setShowAddModal(false)
      fetchDeals()
    } catch (err: any) {
      setError(err.message || "Failed to create deal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDeal = async (data: DealFormData) => {
    if (!editingDeal) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/owner/deals/${editingDeal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(typeof json.error === "string" ? json.error : "Failed to update deal")
      }
      setEditingDeal(null)
      fetchDeals()
    } catch (err: any) {
      setError(err.message || "Failed to update deal")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (dealId: string, isActive: boolean) => {
    try {
      await fetch(`/api/owner/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      })
      fetchDeals()
    } catch {}
  }

  const handleDeleteDeal = async () => {
    if (!deleteConfirm) return
    try {
      const res = await fetch(`/api/owner/deals/${deleteConfirm}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || "Failed to delete")
      }
      setDeleteConfirm(null)
      fetchDeals()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const now = new Date()
  const filteredDeals = deals.filter((d) => {
    if (activeFilter === "all") return true
    if (activeFilter === "active") {
      const isExpired = d.end_date && new Date(d.end_date) < now
      const isFuture = d.start_date && new Date(d.start_date) > now
      return d.is_active && !isExpired && !isFuture
    }
    if (activeFilter === "expired") {
      const isExpired = d.end_date && new Date(d.end_date) < now
      return !d.is_active || !!isExpired
    }
    if (activeFilter === "upcoming") {
      const isFuture = d.start_date && new Date(d.start_date) > now
      return d.is_active && !!isFuture
    }
    return true
  })

  const activeDeals = deals.filter((d) => {
    const isExpired = d.end_date && new Date(d.end_date) < now
    return d.is_active && !isExpired
  }).length

  const filters: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: deals.length },
    { key: "active", label: "Active", count: activeDeals },
    { key: "expired", label: "Expired", count: deals.length - activeDeals },
  ]

  const closeModal = () => {
    setShowAddModal(false)
    setEditingDeal(null)
    setError(null)
  }

  if (loading) {
    return (
      <div>
        <div className="h-8 w-40 bg-[#F0F0F0] rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[#F0F0F0] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-[#111]">Deals & Offers</h1>
          <p className="text-xs text-[#999] mt-0.5">Create and manage your promotions</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Deal
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#999] mb-1">
            <Tag className="w-3 h-3" />
            Total Deals
          </div>
          <p className="text-lg font-bold text-[#111]">{deals.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#16A34A] mb-1">
            <Percent className="w-3 h-3" />
            Active
          </div>
          <p className="text-lg font-bold text-[#16A34A]">{activeDeals}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#555] mb-1">
            <Percent className="w-3 h-3" />
            Types
          </div>
          <p className="text-sm font-bold text-[#111]">
            {deals.filter((d) => d.deal_type === "percentage").length}% &middot; {deals.filter((d) => d.deal_type === "flat").length}Rs &middot; {deals.filter((d) => d.deal_type === "bundle").length}Bundle
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-black text-white"
                : "bg-white text-[#555] border border-[#F0F0F0] hover:bg-[#F9FAFB]"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-[#FEF3C7] border border-[#D97706]/30 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-[#92400E]">{error}</div>
          <button onClick={() => setError(null)} className="text-[#92400E] p-1 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-[#D97706]/10 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      )}

      {filteredDeals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F0F0F0] p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#F9FAFB] flex items-center justify-center mx-auto mb-3">
            <Percent className="w-6 h-6 text-[#999]" />
          </div>
          <p className="text-sm text-[#555] mb-1">
            {activeFilter === "all" ? "No deals yet" : `No ${activeFilter} deals`}
          </p>
          <p className="text-xs text-[#999] mb-4">
            {activeFilter === "all" ? "Create your first deal to attract more customers" : "No deals match this filter"}
          </p>
          {activeFilter === "all" && (
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Create First Deal
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              linkedDish={dishes.find((d) => d.id === deal.dish_id) || null}
              onEdit={(d) => setEditingDeal(d)}
              onDelete={(id) => setDeleteConfirm(id)}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <Dialog open={showAddModal || !!editingDeal} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {editingDeal ? <>Edit Deal</> : <>Create New Deal</>}
            </DialogTitle>
          </DialogHeader>
          <AddDealForm
            dishes={dishes}
            initialData={editingDeal ? {
              title_en: editingDeal.title_en,
              title_ur: editingDeal.title_ur || undefined,
              description_en: editingDeal.description_en || undefined,
              description_ur: editingDeal.description_ur || undefined,
              dish_id: editingDeal.dish_id || undefined,
              deal_type: editingDeal.deal_type,
              deal_value: editingDeal.deal_value,
              is_active: editingDeal.is_active,
            } : undefined}
            submitting={submitting}
            onSubmit={editingDeal ? handleUpdateDeal : handleCreateDeal}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#DC2626] text-base">
              <AlertTriangle className="w-4 h-4" /> Delete Deal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#555]">Are you sure you want to delete this deal? This action cannot be undone.</p>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <button onClick={handleDeleteDeal} className="flex-1 px-4 py-3 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                Delete Deal
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
