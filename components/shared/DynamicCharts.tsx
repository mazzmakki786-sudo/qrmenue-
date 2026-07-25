"use client"

import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import type { DailyStats } from "@/types"

// Dynamic import of recharts — loaded only when an OrdersChart is actually rendered
const OrdersChartInner = dynamic(() => import("@/components/owner/OrdersChart").then((m) => m.OrdersChart), {
  ssr: false,
  loading: () => (
    <Card>
      <div className="h-56 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-gray-400">Loading chart...</span>
      </div>
    </Card>
  ),
})

interface Props {
  data7d: DailyStats[]
  data30d: DailyStats[]
}

export function DynamicOrdersChart({ data7d, data30d }: Props) {
  return <OrdersChartInner data7d={data7d} data30d={data30d} />
}

// Analytics page chart
export const AnalyticsOrderChart = dynamic(
  () => import("@/app/(owner)/dashboard/analytics/OrderChart"),
  { ssr: false, loading: () => <div className="h-48 bg-gray-50 rounded-xl animate-pulse" /> }
)

export const SuperAdminChart = dynamic(
  () => import("@/components/superadmin/AnalyticsView").then((m) => ({ default: m.AnalyticsView })),
  { ssr: false, loading: () => <div className="h-64 bg-gray-50 rounded-xl animate-pulse" /> }
)
