"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Trash2, Users, DollarSign, Percent, Calculator, Mail } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Participant {
  email: string
  name: string
  userId?: string
  amount?: number
  percentage?: number
}

interface SplitExpenseProps {
  expense: {
    _id: string
    amount: number
    category: string
    vendor?: string
    note?: string
    date: string
    isSplit?: boolean
  }
  onSplitCreated?: () => void
}

export function SplitExpenseDialog({ expense, onSplitCreated }: SplitExpenseProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [splitType, setSplitType] = useState<"equal" | "exact" | "percentage">("equal")
  const [title, setTitle] = useState(`${expense.vendor || expense.category} Split`)
  const [description, setDescription] = useState(expense.note || "")
  const [participants, setParticipants] = useState<Participant[]>([
    { email: "", name: "" }
  ])
  const [creatorAmount, setCreatorAmount] = useState(0)
  const [creatorPercentage, setCreatorPercentage] = useState(0)

  const addParticipant = () => {
    setParticipants([...participants, { email: "", name: "" }])
  }

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const updateParticipant = (index: number, field: keyof Participant, value: string | number) => {
    const updated = participants.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    )
    setParticipants(updated)
  }

  const calculateEqualSplit = () => {
    const totalPeople = participants.length + 1 // +1 for creator
    return expense.amount / totalPeople
  }

  const validateSplit = () => {
    // Check if all participants have email and name
    const invalidParticipants = participants.some(p => !p.email.trim() || !p.name.trim())
    if (invalidParticipants) {
      setError("Please fill in email and name for all participants")
      return false
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = participants.some(p => !emailRegex.test(p.email))
    if (invalidEmails) {
      setError("Please enter valid email addresses")
      return false
    }

    if (splitType === "exact") {
      const participantTotal = participants.reduce((sum, p) => sum + (p.amount || 0), 0)
      const total = participantTotal + creatorAmount
      if (Math.abs(total - expense.amount) > 0.01) {
        setError(`Split amounts must equal ₹${expense.amount.toFixed(2)}. Current total: ₹${total.toFixed(2)}`)
        return false
      }
    }

    if (splitType === "percentage") {
      const participantTotal = participants.reduce((sum, p) => sum + (p.percentage || 0), 0)
      const total = participantTotal + creatorPercentage
      if (Math.abs(total - 100) > 0.01) {
        setError(`Percentages must equal 100%. Current total: ${total.toFixed(1)}%`)
        return false
      }
    }

    return true
  }

  const handleCreateSplit = async () => {
    if (!validateSplit()) return

    setLoading(true)
    setError("")

    try {
      const splitData = {
        expenseId: expense._id,
        title,
        description,
        participants,
        splitType,
        ...(splitType === "exact" && { creatorAmount }),
        ...(splitType === "percentage" && { creatorPercentage }),
      }

      const response = await api.createSplit(splitData)

      if (response.error) {
        setError(response.error)
      } else {
        setOpen(false)
        onSplitCreated?.()
        // Reset form
        setParticipants([{ email: "", name: "" }])
        setTitle(`${expense.vendor || expense.category} Split`)
        setDescription(expense.note || "")
        setSplitType("equal")
        setCreatorAmount(0)
        setCreatorPercentage(0)
      }
    } catch (error) {
      setError("Failed to create split. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={expense.isSplit}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          {expense.isSplit ? "Already Split" : "Split Expense"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Split Expense</DialogTitle>
          <DialogDescription>
            Split ₹{expense.amount.toFixed(2)} with friends and send them email notifications
          </DialogDescription>
          
          {/* Email Sender Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Email notifications will be sent from:</span>
              <span className="text-blue-700">{user?.name} ({user?.email})</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Participants will see this name in their inbox and can reply directly to you
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Split Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this split"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details..."
                rows={2}
              />
            </div>
          </div>

          {/* Split Type */}
          <div>
            <Label>Split Type</Label>
            <Tabs value={splitType} onValueChange={(value) => setSplitType(value as typeof splitType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equal" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Equal
                </TabsTrigger>
                <TabsTrigger value="exact" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Exact
                </TabsTrigger>
                <TabsTrigger value="percentage" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Percentage
                </TabsTrigger>
              </TabsList>

              <TabsContent value="equal" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Each person pays an equal amount</p>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        ₹{calculateEqualSplit().toFixed(2)} per person
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        ({participants.length + 1} people total)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exact" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Your Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={creatorAmount}
                          onChange={(e) => setCreatorAmount(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Total: ₹{(participants.reduce((sum, p) => sum + (p.amount || 0), 0) + creatorAmount).toFixed(2)} / ₹{expense.amount.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="percentage" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Your Percentage</Label>
                        <Input
                          type="number"
                          step="0.1"
                          max="100"
                          value={creatorPercentage}
                          onChange={(e) => setCreatorPercentage(parseFloat(e.target.value) || 0)}
                          placeholder="0.0"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Total: {(participants.reduce((sum, p) => sum + (p.percentage || 0), 0) + creatorPercentage).toFixed(1)}% / 100%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Participants</Label>
              <Button onClick={addParticipant} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </div>

            <div className="space-y-4">
              {participants.map((participant, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Email address"
                          type="email"
                          value={participant.email}
                          onChange={(e) => updateParticipant(index, "email", e.target.value)}
                        />
                        <Input
                          placeholder="Full name"
                          value={participant.name}
                          onChange={(e) => updateParticipant(index, "name", e.target.value)}
                        />
                      </div>

                      {splitType === "exact" && (
                        <div className="w-32">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={participant.amount || ""}
                            onChange={(e) => updateParticipant(index, "amount", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      )}

                      {splitType === "percentage" && (
                        <div className="w-32">
                          <Input
                            type="number"
                            step="0.1"
                            max="100"
                            placeholder="Percentage"
                            value={participant.percentage || ""}
                            onChange={(e) => updateParticipant(index, "percentage", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      )}

                      {splitType === "equal" && (
                        <div className="w-32 text-right">
                          <Badge variant="secondary">
                            ₹{calculateEqualSplit().toFixed(2)}
                          </Badge>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(index)}
                        disabled={participants.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSplit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Split...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Create Split & Send Emails
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
