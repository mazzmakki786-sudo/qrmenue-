"use client"

import { useState, useCallback } from "react"
import type { Deal, DealFormData } from "@/types"

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/owner/deals")
      if (!res.ok) throw new Error("Failed to fetch deals")
      const json = await res.json()
      setDeals(json.deals || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createDeal = useCallback(async (data: DealFormData): Promise<Deal | null> => {
    try {
      const res = await fetch("/api/owner/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed") }
      const json = await res.json()
      await fetchDeals()
      return json.deal
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [fetchDeals])

  const updateDeal = useCallback(async (id: string, data: Partial<DealFormData>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/owner/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) return false
      await fetchDeals()
      return true
    } catch { return false }
  }, [fetchDeals])

  const toggleActive = useCallback(async (id: string, isActive: boolean): Promise<boolean> => {
    return updateDeal(id, { is_active: isActive })
  }, [updateDeal])

  const deleteDeal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/owner/deals/${id}`, { method: "DELETE" })
      if (!res.ok) return false
      await fetchDeals()
      return true
    } catch { return false }
  }, [fetchDeals])

  const refresh = useCallback(async () => {
    await fetchDeals()
  }, [fetchDeals])

  return {
    deals, loading, error,
    fetchDeals, createDeal, updateDeal, toggleActive, deleteDeal, refresh,
  }
}
