"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface ChartData {
  date: string
  revenue: number
  orders: number
}

interface OrderChartProps {
  data: ChartData[]
  dataKey: "orders" | "revenue"
  color: string
}

export default function OrderChart({ data, dataKey, color }: OrderChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-[#999]">
        No data yet
      </div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#999" }}
            tickFormatter={(v: string) => {
              const d = new Date(v)
              return `${d.getMonth() + 1}/${d.getDate()}`
            }}
          />
          <YAxis tick={{ fontSize: 10, fill: "#999" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #F0F0F0", fontSize: 12 }}
            formatter={(value: number) => {
              if (dataKey === "revenue") return [`Rs ${value.toLocaleString("en-PK")}`, "Revenue"]
              return [value, "Orders"]
            }}
            labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
