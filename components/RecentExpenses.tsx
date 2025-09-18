"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SplitExpenseDialog } from "@/components/SplitExpenseDialog"
import { formatDistanceToNow } from "date-fns"

interface Expense {
  _id: string
  amount: number
  category: string
  vendor?: string
  note?: string
  date: string
  createdAt: string
  isSplit?: boolean
}

interface RecentExpensesProps {
  expenses: Expense[]
  onExpenseUpdated?: () => void
}

const categoryColors: Record<string, string> = {
  Food: "bg-green-100 text-green-800",
  Transport: "bg-blue-100 text-blue-800",
  Shopping: "bg-purple-100 text-purple-800",
  Entertainment: "bg-pink-100 text-pink-800",
  Bills: "bg-red-100 text-red-800",
  Healthcare: "bg-teal-100 text-teal-800",
  Education: "bg-indigo-100 text-indigo-800",
  Other: "bg-gray-100 text-gray-800",
}

export function RecentExpenses({ expenses, onExpenseUpdated }: RecentExpensesProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No expenses recorded yet</p>
            <p className="text-sm mt-2">Add your first expense to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Your latest {expenses.length} transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <Badge className={categoryColors[expense.category] || categoryColors["Other"]}>
                    {expense.category}
                  </Badge>
                  <span className="font-medium">₹{expense.amount.toFixed(2)}</span>
                  {expense.isSplit && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Split
                    </Badge>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {expense.vendor && <span className="font-medium">{expense.vendor}</span>}
                  {expense.vendor && expense.note && " • "}
                  {expense.note && <span>{expense.note}</span>}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
                </div>
              </div>
              <div className="ml-4">
                <SplitExpenseDialog 
                  expense={expense} 
                  onSplitCreated={onExpenseUpdated}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
