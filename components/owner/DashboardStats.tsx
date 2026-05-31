"use client"

import { Card } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

interface Props {
  todayOrders: number
  todayRevenue: number
}

export function DashboardStats({ todayOrders, todayRevenue }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card>
        <p className="text-[28px] font-bold">{todayOrders}</p>
        <p className="text-sm text-[#555]">Orders Today</p>
      </Card>
      <Card>
        <p className="text-[28px] font-bold">{formatPrice(todayRevenue)}</p>
        <p className="text-sm text-[#555]">Revenue Today</p>
      </Card>
    </div>
  )
}
