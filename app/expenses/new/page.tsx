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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { 
  Loader2, 
  ArrowLeft, 
  CheckCircle, 
  Plus,
  Receipt,
  DollarSign,
  Calendar,
  Tag,
  Store,
  FileText,
  Lightbulb,
  Clock,
  Target,
  Zap
} from "lucide-react"
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
        {/* Enhanced Header with gradient background */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>
          <div className="relative p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Add New Expense
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Record a new expense and get instant budget insights
                    </p>
                  </div>
                </div>
                
                {/* Quick Info Cards */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    <Receipt className="h-4 w-4 mr-2" />
                    Smart Categorization
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                    <Target className="h-4 w-4 mr-2" />
                    Budget Tracking
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Instant Alerts
                  </Badge>
                </div>
              </div>
              
              {/* Visual elements */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl shadow-lg transform rotate-12">
                  <Receipt className="h-12 w-12 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-lg transform -rotate-6">
                  <DollarSign className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-amber-200 rounded-lg">
                <Lightbulb className="h-6 w-6 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-2">💡 Quick Tips</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <p className="text-amber-700 text-sm">• Add expenses immediately for better tracking</p>
                  <p className="text-amber-700 text-sm">• Use descriptive notes for easier categorization</p>
                  <p className="text-amber-700 text-sm">• Include vendor details for better reporting</p>
                  <p className="text-amber-700 text-sm">• Check budget alerts after adding expenses</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Expense Details</CardTitle>
                  <CardDescription>Fill in the information below to add your expense</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Amount (₹) *</span>
                    </Label>
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
                      className="text-lg font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Date *</span>
                    </Label>
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
                    <Label htmlFor="category" className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-purple-600" />
                      <span>Category</span>
                    </Label>
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
                    <Label htmlFor="vendor" className="flex items-center space-x-2">
                      <Store className="h-4 w-4 text-orange-600" />
                      <span>Vendor/Store</span>
                    </Label>
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
                  <Label htmlFor="note" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-600" />
                    <span>Note</span>
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="Add any additional details about this expense..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={loading}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Expense...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expense
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} disabled={loading} className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
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
