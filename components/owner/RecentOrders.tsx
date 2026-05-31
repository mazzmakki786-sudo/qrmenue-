"use client"

import type { Order } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

interface Props {
  orders: Order[]
}

const statusColors: Record<string, "available" | "unavailable" | "trial" | "starter" | "growth" | "premium"> = {
  received: "available",
  preparing: "growth",
  ready: "premium",
  completed: "available",
  cancelled: "unavailable",
}

export function RecentOrders({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[#999]">
        No orders yet
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Recent Orders</h3>
      <div className="space-y-2">
        {orders.slice(0, 10).map((order) => (
          <Link
            key={order.id}
            href={`/dashboard/orders/${order.id}`}
            className="flex items-center justify-between p-3 rounded-[10px] bg-white border border-[#E8E8E8] hover:border-[#CCC] transition-colors"
          >
            <div>
              <p className="text-sm font-medium">{order.order_number}</p>
              <p className="text-xs text-[#555]">{order.customer_name} • {order.order_type.replace("_", " ")}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatPrice(order.total_price)}</p>
              <Badge variant={statusColors[order.order_status] || "starter"} className="capitalize">
                {order.order_status}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
