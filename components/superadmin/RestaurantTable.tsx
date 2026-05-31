"use client"

import Link from "next/link"
import type { Restaurant } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

interface Props {
  restaurants: (Restaurant & { total_orders?: number })[]
  search: string
  onSearchChange: (v: string) => void
}

const planBadgeVariant: Record<string, "trial" | "starter" | "growth" | "premium"> = {
  trial: "trial",
  starter: "starter",
  growth: "growth",
  premium: "premium",
}

export function RestaurantTable({ restaurants, search, onSearchChange }: Props) {
  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by name or city..."
        className="w-full h-12 rounded-[10px] bg-[#F8F8F8] border border-[#E8E8E8] px-4 text-base placeholder:text-[#999] focus:outline-none focus:border-black transition-colors mb-4"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F0F0F0] text-left text-[#999]">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">City</th>
              <th className="pb-3 font-medium">Plan</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Orders</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-[#F0F0F0]">
                <td className="py-3">
                  <Link href={`/superadmin/restaurants/${r.id}`} className="font-medium hover:underline">
                    {r.name}
                  </Link>
                </td>
                <td className="py-3 text-[#555]">{r.city}</td>
                <td className="py-3">
                  <Badge variant={planBadgeVariant[r.plan] || "starter"} className="capitalize">
                    {r.plan}
                  </Badge>
                </td>
                <td className="py-3">
                  <Badge variant={r.is_active ? "available" : "unavailable"}>
                    {r.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="py-3 text-[#555]">{r.total_orders || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
