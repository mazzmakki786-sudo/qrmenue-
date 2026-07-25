"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface ChartData {
  date: string
  revenue: number
  orders: number
}

interface Props {
  data: ChartData[]
}

export default function OrderChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-gray-400">
        No data yet
      </div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
            formatter={(value: number) => [value, "Orders"]}
            labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
          />
          <Bar dataKey="orders" fill="#000" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
