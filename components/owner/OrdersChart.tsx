"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Card } from "@/components/ui/card"
import type { DailyStats } from "@/types"

interface Props {
  data7d: DailyStats[]
  data30d: DailyStats[]
}

export function OrdersChart({ data7d, data30d }: Props) {
  const [view, setView] = useState<"7d" | "30d">("7d")
  const data = view === "7d" ? data7d : data30d

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Orders {view === "7d" ? "Last 7 Days" : "Last 30 Days"}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setView("7d")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              view === "7d" ? "bg-black text-white" : "bg-[#F8F8F8] text-[#555]"
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setView("30d")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              view === "30d" ? "bg-black text-white" : "bg-[#F8F8F8] text-[#555]"
            }`}
          >
            30d
          </button>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis dataKey="order_date" tick={{ fontSize: 11 }} stroke="#999" tickFormatter={(v) => new Date(v).toLocaleDateString("en", { weekday: "short" })} />
            <YAxis tick={{ fontSize: 11 }} stroke="#999" allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="total_orders" stroke="#000" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
