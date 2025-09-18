"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Mail, 
  Trash2, 
  UserCheck, 
  AlertCircle,
  Calendar,
  Receipt,
  Send
} from "lucide-react"
import Link from "next/link"
import { EmailStatusIndicator, EmailStatusSummary } from "@/components/EmailStatusIndicator"

interface Split {
  _id: string
  title: string
  description?: string
  totalAmount: number
  splitType: string
  participants: Array<{
    email: string
    name: string
    amount: number
    isPaid: boolean
    paidAt?: string
    emailSent: boolean
    emailSentAt?: string
  }>
  isSettled: boolean
  settledAt?: string
  createdAt: string
  expenseId: {
    category: string
    vendor?: string
  }
  createdBy: {
    name: string
    email: string
  }
  userAmount: number
  userPaid: boolean
  isCreator: boolean
  totalOwed: number
  totalPaid: number
}

export default function SplitsPage() {
  const { user } = useAuth()
  const [splits, setSplits] = useState<Split[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [summary, setSummary] = useState<any>({})

  useEffect(() => {
    loadSplits()
  }, [activeTab])

  const loadSplits = async () => {
    try {
      const filters = activeTab === "all" ? {} : { status: activeTab as "settled" | "unsettled" }
      const response = await api.getSplits(filters)

      if (response.data) {
        setSplits(response.data.splits || [])
        setSummary(response.data.summary || {})
      }
    } catch (error) {
      console.error("Failed to load splits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (splitId: string, participantEmail: string) => {
    try {
      const response = await api.markSplitAsPaid(splitId, participantEmail)
      if (response.data) {
        loadSplits() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to mark as paid:", error)
    }
  }

  const handleSendReminder = async (splitId: string, participantEmail: string) => {
    try {
      await api.sendSplitReminder(splitId, participantEmail)
      alert("Reminder sent successfully!")
    } catch (error) {
      console.error("Failed to send reminder:", error)
      alert("Failed to send reminder")
    }
  }

  const handleDeleteSplit = async (splitId: string) => {
    if (confirm("Are you sure you want to delete this split?")) {
      try {
        await api.deleteSplit(splitId)
        loadSplits() // Refresh the list
      } catch (error) {
        console.error("Failed to delete split:", error)
        alert("Failed to delete split")
      }
    }
  }

  const getStatusBadge = (split: Split) => {
    if (split.isSettled) {
      return <Badge className="bg-green-500 hover:bg-green-600">Settled</Badge>
    }
    
    if (split.isCreator) {
      const unpaidCount = split.participants.filter(p => !p.isPaid).length
      if (unpaidCount > 0) {
        return <Badge variant="destructive">{unpaidCount} Pending</Badge>
      }
    } else {
      if (!split.userPaid) {
        return <Badge variant="destructive">You Owe</Badge>
      } else {
        return <Badge className="bg-blue-500 hover:bg-blue-600">Paid</Badge>
      }
    }
    
    return <Badge className="bg-green-500 hover:bg-green-600">Complete</Badge>
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-500" />
                Split Expenses
              </h1>
              <p className="text-slate-600 mt-1">Manage shared expenses with friends and family</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Email status will be shown per split */}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Splits</p>
                    <p className="text-3xl font-bold">{summary.total || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Settled</p>
                    <p className="text-3xl font-bold">{summary.settled || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold">{summary.unsettled || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">You Owe</p>
                    <p className="text-3xl font-bold">
                      ₹{splits.filter(s => !s.isCreator && !s.userPaid).reduce((sum, s) => sum + s.userAmount, 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
              <TabsTrigger value="all">All Splits</TabsTrigger>
              <TabsTrigger value="unsettled">Unsettled</TabsTrigger>
              <TabsTrigger value="settled">Settled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {splits.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No splits found</h3>
                    <p className="text-gray-600 mb-4">
                      {activeTab === "all" 
                        ? "You haven't created or participated in any splits yet."
                        : `No ${activeTab} splits found.`
                      }
                    </p>
                    <Link href="/dashboard">
                      <Button>Go to Dashboard</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {splits.map((split) => (
                    <Card key={split._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-blue-500" />
                              {split.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(split.createdAt).toLocaleDateString()}
                              </span>
                              <span>{split.expenseId.category}</span>
                              {split.expenseId.vendor && <span>• {split.expenseId.vendor}</span>}
                            </CardDescription>
                            
                            {/* Email Status Summary */}
                            <div className="mt-2">
                              <EmailStatusSummary 
                                participants={split.participants} 
                                creatorName={split.createdBy.name}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(split)}
                            {split.isCreator && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSplit(split._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {split.description && (
                          <p className="text-gray-600 mb-4 italic">"{split.description}"</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Amount Info */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Total Amount:</span>
                              <span className="text-lg font-bold">₹{split.totalAmount.toFixed(2)}</span>
                            </div>
                            
                            {!split.isCreator && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Your Share:</span>
                                <span className={`text-lg font-bold ${split.userPaid ? 'text-green-600' : 'text-red-600'}`}>
                                  ₹{split.userAmount.toFixed(2)}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-sm">
                              <span>Split Type:</span>
                              <Badge variant="outline" className="capitalize">
                                {split.splitType}
                              </Badge>
                            </div>
                          </div>

                          {/* Participants */}
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Participants ({split.participants.length + 1})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {/* Creator */}
                              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-blue-500 text-white">
                                      {split.createdBy.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">
                                    {split.createdBy.name} {split.createdBy.email === user?.email && "(You)"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Paid
                                  </Badge>
                                </div>
                              </div>

                              {/* Other Participants */}
                              {split.participants.map((participant, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {participant.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          {participant.name} {participant.email === user?.email && "(You)"}
                                        </span>
                                        {participant.email !== user?.email && (
                                          <EmailStatusIndicator 
                                            emailSent={participant.emailSent}
                                            emailSentAt={participant.emailSentAt}
                                            participantEmail={participant.email}
                                            size="sm"
                                          />
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500">₹{participant.amount.toFixed(2)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {participant.isPaid ? (
                                      <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Paid
                                      </Badge>
                                    ) : (
                                      <>
                                        <Badge variant="destructive" className="text-xs">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Pending
                                        </Badge>
                                        {split.isCreator && (
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-6 px-2 text-xs"
                                              onClick={() => handleSendReminder(split._id, participant.email)}
                                            >
                                              <Mail className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-6 px-2 text-xs"
                                              onClick={() => handleMarkAsPaid(split._id, participant.email)}
                                            >
                                              <UserCheck className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action for user's own payment */}
                        {!split.isCreator && !split.userPaid && (
                          <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              You need to pay ₹{split.userAmount.toFixed(2)} to {split.createdBy.name}. 
                              Contact them to arrange payment, and they can mark you as paid.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
