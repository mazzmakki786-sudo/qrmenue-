"use client"

import Link from "next/link"
import type { Restaurant } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useState, useMemo } from "react"
import { Search, ExternalLink, Utensils, ShoppingBag, Calendar, Clock, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props {
  restaurants: (Restaurant & {
    total_orders?: number
    dish_count?: number
    last7_orders?: number
    last30_orders?: number
    revenue?: number
    trial_end?: string
  })[]
  users: Record<string, { email: string; last_sign_in_at: string | null }>
  setRestaurants?: React.Dispatch<React.SetStateAction<any[]>>
}

const planBadgeVariant: Record<string, "trial" | "starter" | "growth" | "premium"> = {
  trial: "trial",
  starter: "starter",
  growth: "growth",
  premium: "premium",
}

const PAGE_SIZE = 25

export function RestaurantTable({ restaurants, users, setRestaurants }: Props) {
  const [search, setSearch] = useState("")
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmToggle, setConfirmToggle] = useState<{ id: string; name: string; currentActive: boolean } | null>(null)

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const ownerEmail = (r.owner_id && users[r.owner_id]?.email) || ""
      return (
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.city.toLowerCase().includes(search.toLowerCase()) ||
        ownerEmail.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [restaurants, users, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleToggle = async (id: string, currentActive: boolean) => {
    if (togglingId) return
    setTogglingId(id)
    setConfirmToggle(null)

    const next = !currentActive

    if (setRestaurants) {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: next } : r))
      )
    }

    try {
      const res = await fetch(`/api/superadmin/restaurants/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: next }),
      })
      if (!res.ok) {
        if (setRestaurants) {
          setRestaurants((prev) =>
            prev.map((r) => (r.id === id ? { ...r, is_active: currentActive } : r))
          )
        }
      }
    } catch (err) {
      if (setRestaurants) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: currentActive } : r))
        )
      }
      console.error(err)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div>
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          placeholder="Search by name, city, or owner email..."
          className="w-full h-12 pl-10 pr-4 rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] text-base placeholder:text-[#999] focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-12 text-center">
          <p className="text-[#999] text-sm">No restaurants yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0F0F0] text-left text-[#999] bg-[#FAFAFA]">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Orders</th>
                  <th className="px-4 py-3 font-medium text-right">7d</th>
                  <th className="px-4 py-3 font-medium text-right">30d</th>
                  <th className="px-4 py-3 font-medium text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => {
                  const owner = r.owner_id ? users[r.owner_id] : undefined
                  const trialDaysLeft = r.plan === "trial" && r.trial_end
                    ? Math.max(0, Math.ceil((new Date(r.trial_end).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                    : 0
                  return (
                    <tr key={r.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA]">
                      <td className="px-4 py-3">
                        <Link href={`/superadmin/restaurants/${r.id}`} className="font-medium hover:underline">
                          {r.name}
                        </Link>
                        <p className="text-xs text-[#999]">/{r.slug}</p>
                        {r.plan === "trial" && trialDaysLeft <= 3 && (
                          <p className="text-[10px] text-[#D97706] font-semibold mt-0.5">
                            Trial: {trialDaysLeft === 0 ? "Today" : `${trialDaysLeft}d left`}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#555]">
                        <p className="truncate max-w-[200px]">{owner?.email || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-[#555]">{r.city}</td>
                      <td className="px-4 py-3">
                        <Badge variant={planBadgeVariant[r.plan] || "starter"} className="capitalize">
                          {r.plan}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setConfirmToggle({ id: r.id, name: r.name, currentActive: r.is_active })
                          }}
                          disabled={togglingId === r.id}
                          className="flex items-center gap-1.5 disabled:opacity-50 hover:opacity-80 transition-opacity"
                        >
                          {togglingId === r.id ? (
                            <Loader2 className="w-5 h-5 text-[#555] animate-spin" />
                          ) : r.is_active ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-[#16A34A]" />
                              <span className="text-xs text-[#16A34A]">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-[#999]" />
                              <span className="text-xs text-[#999]">Off</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[#555] text-right">{r.total_orders || 0}</td>
                      <td className="px-4 py-3 text-[#555] text-right">{r.last7_orders || 0}</td>
                      <td className="px-4 py-3 text-[#555] text-right">{r.last30_orders || 0}</td>
                      <td className="px-4 py-3 text-[#555] text-right font-medium">{formatPrice(r.revenue || 0)}</td>
                      <td className="px-4 py-3 text-[#555] text-right text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-[#F0F0F0]">
            {paginated.map((r) => {
              const owner = r.owner_id ? users[r.owner_id] : undefined
              const trialDaysLeft = r.plan === "trial" && r.trial_end
                ? Math.max(0, Math.ceil((new Date(r.trial_end).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                : 0
              return (
                <div key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link href={`/superadmin/restaurants/${r.id}`} className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{r.name}</p>
                      <p className="text-xs text-[#999] truncate">/{r.slug}</p>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setConfirmToggle({ id: r.id, name: r.name, currentActive: r.is_active })
                      }}
                      disabled={togglingId === r.id}
                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      {togglingId === r.id ? (
                        <Loader2 className="w-7 h-7 text-[#555] animate-spin" />
                      ) : r.is_active ? (
                        <ToggleRight className="w-7 h-7 text-[#16A34A]" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-[#999]" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#555] mb-2 truncate">{owner?.email || "No owner"}</p>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant={planBadgeVariant[r.plan] || "starter"} className="capitalize">
                      {r.plan}
                    </Badge>
                    <span className="text-xs text-[#999]">{r.city}</span>
                    {r.plan === "trial" && trialDaysLeft <= 3 && (
                      <span className="text-[10px] text-[#D97706] font-semibold">
                        Trial: {trialDaysLeft === 0 ? "Today" : `${trialDaysLeft}d`}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-[#999]">Orders</p>
                      <p className="font-semibold">{r.total_orders || 0}</p>
                    </div>
                    <div>
                      <p className="text-[#999]">7d</p>
                      <p className="font-semibold">{r.last7_orders || 0}</p>
                    </div>
                    <div>
                      <p className="text-[#999]">Revenue</p>
                      <p className="font-semibold">{formatPrice(r.revenue || 0)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#F0F0F0]">
              <span className="text-xs text-[#999]">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-full text-xs font-semibold border border-[#E8E8E8] text-[#555] hover:bg-[#F0F0F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <span className="text-xs text-[#555] font-medium">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-full text-xs font-semibold border border-[#E8E8E8] text-[#555] hover:bg-[#F0F0F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmToggle} onOpenChange={(open) => { if (!open) setConfirmToggle(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmToggle?.currentActive ? "Suspend Restaurant" : "Activate Restaurant"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#555]">
            {confirmToggle?.currentActive
              ? `Are you sure you want to suspend "${confirmToggle?.name}"? The restaurant will stop receiving new orders.`
              : `Are you sure you want to activate "${confirmToggle?.name}"? The restaurant will be able to receive orders again.`}
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setConfirmToggle(null)}
              className="flex-1 px-4 py-3 rounded-xl border border-[#F0F0F0] text-sm font-semibold hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (confirmToggle) {
                  handleToggle(confirmToggle.id, confirmToggle.currentActive)
                }
              }}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors ${
                confirmToggle?.currentActive ? "bg-[#DC2626] hover:bg-red-700" : "bg-[#16A34A] hover:bg-green-700"
              }`}
            >
              {confirmToggle?.currentActive ? "Suspend" : "Activate"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
