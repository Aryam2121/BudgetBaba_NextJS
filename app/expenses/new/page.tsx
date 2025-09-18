"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

const categories = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Other"]

export default function NewExpensePage() {
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [category, setCategory] = useState("")
  const [vendor, setVendor] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [budgetAlerts, setBudgetAlerts] = useState<any[]>([])

  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const response = await api.addExpense({
        amount: Number.parseFloat(amount),
        date,
        category: category || undefined,
        vendor: vendor || undefined,
        note: note || undefined,
      })

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return
      }

      setSuccess(true)
      setBudgetAlerts(response.data?.budgetInfo?.alerts || [])

      toast({
        title: "Success!",
        description: "Expense added successfully. Email notification sent!",
      })

      // Reset form
      setAmount("")
      setVendor("")
      setNote("")
      setCategory("")

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-700 mb-2">Expense Added Successfully!</h2>
                  <p className="text-gray-600 mb-4">
                    Your expense has been recorded and an email notification has been sent.
                  </p>

                  {budgetAlerts.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-orange-700 mb-2">Budget Alerts:</h3>
                      {budgetAlerts.map((alert, index) => (
                        <Alert key={index} className="mb-2">
                          <AlertDescription className="text-orange-700">{alert.message}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button onClick={() => router.push("/dashboard")} className="w-full">
                      Go to Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => setSuccess(false)} className="w-full">
                      Add Another Expense
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Add New Expense</h1>
            <p className="text-slate-600">Record a new expense and get instant budget insights</p>
          </div>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Expense Details</CardTitle>
              <CardDescription>Fill in the information below to add your expense</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-categorize or select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Leave empty for automatic categorization</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor/Store</Label>
                    <Input
                      id="vendor"
                      type="text"
                      placeholder="e.g., Zomato, Amazon, Uber"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    placeholder="Add any additional details about this expense..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Expense...
                      </>
                    ) : (
                      "Add Expense"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
