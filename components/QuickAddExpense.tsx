"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Loader2, Plus } from "lucide-react"

const categories = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Other"]

interface QuickAddExpenseProps {
  onExpenseAdded?: () => void
}

export function QuickAddExpense({ onExpenseAdded }: QuickAddExpenseProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [vendor, setVendor] = useState("")
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await api.addExpense({
        amount: Number.parseFloat(amount),
        date: new Date().toISOString().split("T")[0],
        category: category || undefined,
        vendor: vendor || undefined,
      })

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
        description: "Expense added successfully",
      })

      // Reset form
      setAmount("")
      setCategory("")
      setVendor("")

      // Notify parent component
      if (onExpenseAdded) {
        onExpenseAdded()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Quick Add</span>
        </CardTitle>
        <CardDescription>Add an expense quickly</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-amount">Amount (₹)</Label>
            <Input
              id="quick-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-vendor">Vendor (optional)</Label>
            <Input
              id="quick-vendor"
              type="text"
              placeholder="e.g., Zomato, Amazon"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-category">Category (optional)</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-categorize" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Expense"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
