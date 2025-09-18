"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ExpenseLineChartProps {
  data: Array<{
    _id: {
      month: number
      year: number
    }
    total: number
    count: number
  }>
}

export function ExpenseLineChart({ data }: ExpenseLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No trend data available</p>
      </div>
    )
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const chartData = data
    .map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      amount: item.total,
      transactions: item.count,
      sortKey: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}`,
    }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">Amount: ₹{data.amount.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Transactions: {data.transactions}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
