"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { uid } from "@/lib/realtime"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { Search, Phone, Mail, ShoppingBag, Calendar, MapPin, ExternalLink } from "lucide-react"

export function CustomerTable() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 25

  const supabase = createClient()

  const fetchCustomers = async () => {
    const res = await fetch("/api/superadmin/customers")
    if (res.ok) {
      const json = await res.json()
      setCustomers(json.customers || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Real-time subscription on customers
  useEffect(() => {
    const channel = supabase
      .channel(uid("customers-changes"))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        () => fetchCustomers()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Real-time subscription on orders
  useEffect(() => {
    const channel = supabase
      .channel(uid("orders-customer-stats"))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchCustomers()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const term = search.toLowerCase()
      return (
        (c.name || "").toLowerCase().includes(term) ||
        (c.phone || "").toLowerCase().includes(term) ||
        (c.email || "").toLowerCase().includes(term) ||
        (c.city || "").toLowerCase().includes(term)
      )
    })
  }, [customers, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  if (loading) {
    return (
      <div className="h-64 bg-white rounded-[14px] border border-[#E8E8E8] animate-pulse" />
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
          <p className="text-[24px] font-bold">{customers.length}</p>
          <p className="text-sm text-[#555]">Total Customers</p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
          <p className="text-[24px] font-bold">
            {customers.filter((c) => c.total_orders > 0).length}
          </p>
          <p className="text-sm text-[#555]">Active (with orders)</p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
          <p className="text-[24px] font-bold">
            {formatPrice(
              customers.reduce((s, c) => s + (c.total_spent || 0), 0)
            )}
          </p>
          <p className="text-sm text-[#555]">Total Spent</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          placeholder="Search by name, phone, email, or city..."
          className="w-full h-12 pl-10 pr-4 rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] text-base placeholder:text-[#999] focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] p-12 text-center">
          <p className="text-[#999] text-sm">No customers yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-[14px] border border-[#E8E8E8] overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0F0F0] text-left text-[#999] bg-[#FAFAFA]">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium text-right">Orders</th>
                  <th className="px-4 py-3 font-medium text-right">Total Spent</th>
                  <th className="px-4 py-3 font-medium text-right">Last Order</th>
                  <th className="px-4 py-3 font-medium text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => (
                  <tr key={c.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.name || "Unnamed"}</p>
                      <p className="text-xs text-[#999] truncate max-w-[150px]">{c.id}</p>
                    </td>
                    <td className="px-4 py-3 text-[#555]">
                      {c.phone && <p className="text-xs">{c.phone}</p>}
                      {c.email && <p className="text-xs text-[#999] truncate max-w-[200px]">{c.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-[#555]">{c.city || "—"}</td>
                    <td className="px-4 py-3 text-[#555] text-right">{c.total_orders || 0}</td>
                    <td className="px-4 py-3 text-[#555] text-right font-medium">
                      {formatPrice(c.total_spent || 0)}
                    </td>
                    <td className="px-4 py-3 text-[#555] text-right text-xs">
                      {c.last_order
                        ? new Date(c.last_order).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3 text-[#555] text-right text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-[#F0F0F0]">
            {paginated.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold">{c.name || "Unnamed"}</p>
                  {c.total_orders > 0 && (
                    <Badge variant="available">Active</Badge>
                  )}
                </div>
                <div className="space-y-1 mb-2 text-xs text-[#555]">
                  {c.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </p>
                  )}
                  {c.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> {c.email}
                    </p>
                  )}
                  {c.city && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {c.city}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-[#555]">
                    <ShoppingBag className="w-3 h-3" /> {c.total_orders || 0} orders
                  </span>
                  <span className="font-semibold">{formatPrice(c.total_spent || 0)}</span>
                </div>
              </div>
            ))}
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
    </div>
  )
}
