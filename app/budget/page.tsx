"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Loader2, ArrowLeft, Target, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function BudgetPage() {
  const [monthlyBudget, setMonthlyBudget] = useState("")
  const [loading, setLoading] = useState(false)
  const [budgetInfo, setBudgetInfo] = useState<any>(null)
  const [loadingInfo, setLoadingInfo] = useState(true)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setMonthlyBudget(user.monthlyBudget?.toString() || "")
      loadBudgetInfo()
    }
  }, [user])

  const loadBudgetInfo = async () => {
    try {
      const response = await api.getMonthlySummary()
      if (response.data) {
        setBudgetInfo(response.data.budgetInfo)
      }
    } catch (error) {
      console.error("Failed to load budget info:", error)
    } finally {
      setLoadingInfo(false)
    }
  }

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.updateBudget(Number.parseFloat(monthlyBudget) || 0)

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success!",
        description: "Monthly budget updated successfully.",
      })

      // Reload budget info
      await loadBudgetInfo()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getBudgetStatus = () => {
    if (!budgetInfo || !budgetInfo.monthlyBudget) return null

    const percentage = (budgetInfo.totalSpent / budgetInfo.monthlyBudget) * 100

    if (percentage >= 100) {
      return { color: "text-red-600", bg: "bg-red-50", status: "Over Budget", icon: AlertTriangle }
    } else if (percentage >= 90) {
      return { color: "text-orange-600", bg: "bg-orange-50", status: "Near Limit", icon: AlertTriangle }
    } else if (percentage >= 70) {
      return { color: "text-yellow-600", bg: "bg-yellow-50", status: "On Track", icon: TrendingUp }
    } else {
      return { color: "text-green-600", bg: "bg-green-50", status: "Good", icon: Target }
    }
  }

  const budgetStatus = getBudgetStatus()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Budget Management</h1>
            <p className="text-slate-600">Set and monitor your monthly spending limits</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Settings */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Monthly Budget</CardTitle>
                <CardDescription>Set your monthly spending limit to get budget alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateBudget} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Budget (₹)</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter your monthly budget"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">Set to 0 to disable budget tracking</p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Budget"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Budget Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Month Status</CardTitle>
                <CardDescription>Your spending progress for this month</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingInfo ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : budgetInfo && budgetInfo.monthlyBudget > 0 ? (
                  <div className="space-y-4">
                    {budgetStatus && (
                      <div className={`p-4 rounded-lg ${budgetStatus.bg}`}>
                        <div className="flex items-center space-x-2">
                          <budgetStatus.icon className={`h-5 w-5 ${budgetStatus.color}`} />
                          <span className={`font-medium ${budgetStatus.color}`}>{budgetStatus.status}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Spent</span>
                        <span className="font-medium">₹{budgetInfo.totalSpent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Budget</span>
                        <span className="font-medium">₹{budgetInfo.monthlyBudget.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Remaining</span>
                        <span
                          className={`font-medium ${budgetInfo.budgetLeft > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          ₹{budgetInfo.budgetLeft.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {Math.min(100, (budgetInfo.totalSpent / budgetInfo.monthlyBudget) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            budgetInfo.totalSpent >= budgetInfo.monthlyBudget
                              ? "bg-red-500"
                              : budgetInfo.totalSpent >= budgetInfo.monthlyBudget * 0.9
                                ? "bg-orange-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(100, (budgetInfo.totalSpent / budgetInfo.monthlyBudget) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Set a monthly budget to track your spending progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Budget Alerts */}
          {budgetInfo?.alerts && budgetInfo.alerts.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Budget Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {budgetInfo.alerts.map((alert: any, index: number) => (
                    <Alert
                      key={index}
                      className={
                        alert.severity === "high"
                          ? "border-red-200 bg-red-50"
                          : alert.severity === "medium"
                            ? "border-orange-200 bg-orange-50"
                            : "border-yellow-200 bg-yellow-50"
                      }
                    >
                      <AlertDescription
                        className={
                          alert.severity === "high"
                            ? "text-red-700"
                            : alert.severity === "medium"
                              ? "text-orange-700"
                              : "text-yellow-700"
                        }
                      >
                        {alert.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto-categorization Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Smart Categorization</CardTitle>
              <CardDescription>How expenses are automatically categorized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Food & Dining</h4>
                  <p className="text-gray-600">Zomato, Swiggy, restaurants, cafes, groceries</p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Transport</h4>
                  <p className="text-gray-600">Uber, Ola, fuel, parking, public transport</p>
                </div>
                <div>
                  <h4 className="font-medium text-purple-700 mb-2">Shopping</h4>
                  <p className="text-gray-600">Amazon, Flipkart, fashion, electronics</p>
                </div>
                <div>
                  <h4 className="font-medium text-orange-700 mb-2">Entertainment</h4>
                  <p className="text-gray-600">Netflix, movies, games, subscriptions</p>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Bills & Utilities</h4>
                  <p className="text-gray-600">Electricity, internet, mobile recharge</p>
                </div>
                <div>
                  <h4 className="font-medium text-teal-700 mb-2">Healthcare</h4>
                  <p className="text-gray-600">Hospitals, medicines, insurance</p>
                </div>
              </div>
              <Alert className="mt-4">
                <AlertDescription>
                  <strong>Tip:</strong> You can always override the automatic category when adding an expense, or the
                  system will learn from vendor names and descriptions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
