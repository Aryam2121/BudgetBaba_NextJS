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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
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
  Send,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
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

interface SplitsState {
  splits: Split[]
  summary: {
    total: number
    settled: number
    unsettled: number
    totalOwed: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function SplitsPage() {
  const { user } = useAuth()
  const [splitsState, setSplitsState] = useState<SplitsState>({
    splits: [],
    summary: { total: 0, settled: 0, unsettled: 0, totalOwed: 0 },
    pagination: { page: 1, limit: 10, total: 0, pages: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadSplits()
  }, [activeTab, currentPage, sortBy, sortOrder])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length === 0 || searchTerm.length >= 2) {
        setCurrentPage(1)
        loadSplits()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSplits()
    }, 30000)
    return () => clearInterval(interval)
  }, [activeTab, currentPage, sortBy, sortOrder, searchTerm])

  const loadSplits = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    
    try {
      const filters: any = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder
      }

      if (activeTab !== "all") {
        filters.status = activeTab
      }

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim()
      }

      const response = await api.getSplits(filters)

      if (response.data) {
        // Handle response data properly with type safety
        const responseData = response.data as any
        setSplitsState({
          splits: responseData.splits || responseData.data || responseData || [],
          summary: responseData.summary || { total: 0, settled: 0, unsettled: 0, totalOwed: 0 },
          pagination: responseData.pagination || { page: currentPage, limit: 10, total: responseData.splits?.length || 0, pages: 1 }
        })
      } else if (response.error) {
        console.error("Failed to load splits:", response.error)
      }
    } catch (error) {
      console.error("Failed to load splits:", error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const refreshSplits = async () => {
    setRefreshing(true)
    await loadSplits(false)
    setRefreshing(false)
  }

  const handleMarkAsPaid = async (splitId: string, participantEmail: string) => {
    setActionLoading(`${splitId}-${participantEmail}`)
    try {
      const response = await api.markSplitAsPaid(splitId, participantEmail)
      if (response.data) {
        await loadSplits(false) // Refresh without loading state
      } else if (response.error) {
        alert(`Failed to mark as paid: ${response.error}`)
      }
    } catch (error) {
      console.error("Failed to mark as paid:", error)
      alert("Failed to mark as paid")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendReminder = async (splitId: string, participantEmail: string) => {
    setActionLoading(`reminder-${splitId}-${participantEmail}`)
    try {
      const response = await api.sendSplitReminder(splitId, participantEmail)
      if (response.data) {
        alert("Reminder sent successfully!")
      } else if (response.error) {
        alert(`Failed to send reminder: ${response.error}`)
      }
    } catch (error) {
      console.error("Failed to send reminder:", error)
      alert("Failed to send reminder")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteSplit = async (splitId: string) => {
    if (confirm("Are you sure you want to delete this split?")) {
      setActionLoading(`delete-${splitId}`)
      try {
        const response = await api.deleteSplit(splitId)
        if (response.data) {
          await loadSplits(false) // Refresh without loading state
        } else if (response.error) {
          alert(`Failed to delete split: ${response.error}`)
        }
      } catch (error) {
        console.error("Failed to delete split:", error)
        alert("Failed to delete split")
      } finally {
        setActionLoading(null)
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

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-12" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-md" />
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DashboardLayout>
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
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-500" />
                Split Expenses
              </h1>
              <p className="text-muted-foreground mt-1">Manage shared expenses with friends and family</p>
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
                    <p className="text-3xl font-bold">{splitsState.summary.total || 0}</p>
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
                    <p className="text-3xl font-bold">{splitsState.summary.settled || 0}</p>
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
                    <p className="text-3xl font-bold">{splitsState.summary.unsettled || 0}</p>
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
                      ₹{splitsState.splits.filter((s: Split) => !s.isCreator && !s.userPaid).reduce((sum: number, s: Split) => sum + s.userAmount, 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search splits by title or participant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort Controls */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="amount">Sort by Amount</SelectItem>
                    <SelectItem value="title">Sort by Title</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSortToggle}
                  className="px-3"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshSplits}
                  disabled={refreshing}
                  className="px-3"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
              <TabsTrigger value="all">
                All Splits 
                {splitsState.summary.total > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {splitsState.summary.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unsettled">
                Unsettled
                {splitsState.summary.unsettled > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {splitsState.summary.unsettled}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settled">
                Settled
                {splitsState.summary.settled > 0 && (
                  <Badge className="ml-2 bg-green-500 hover:bg-green-600">
                    {splitsState.summary.settled}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {splitsState.splits.length === 0 ? (
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
                  {splitsState.splits.map((split: Split) => (
                    <Card key={split._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Receipt className="h-5 w-5 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{split.title}</span>
                            </CardTitle>
                            <CardDescription className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-sm">
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
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getStatusBadge(split)}
                            {split.isCreator && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSplit(split._id)}
                                disabled={actionLoading === `delete-${split._id}`}
                                className="text-red-600 hover:text-red-700 p-2"
                              >
                                {actionLoading === `delete-${split._id}` ? (
                                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {split.description && (
                          <p className="text-gray-600 mb-4 italic">"{split.description}"</p>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {/* Creator */}
                              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Avatar className="h-6 w-6 flex-shrink-0">
                                    <AvatarFallback className="text-xs bg-blue-500 text-white">
                                      {split.createdBy.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium truncate">
                                    {split.createdBy.name} {split.createdBy.email === user?.email && "(You)"}
                                  </span>
                                </div>
                                <Badge className="bg-green-500 hover:bg-green-600 text-xs flex-shrink-0">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Paid
                                </Badge>
                              </div>

                              {/* Other Participants */}
                              {split.participants.map((participant: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Avatar className="h-6 w-6 flex-shrink-0">
                                      <AvatarFallback className="text-xs">
                                        {participant.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">
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
                                  <div className="flex items-center gap-2 flex-shrink-0">
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
                                              disabled={actionLoading === `reminder-${split._id}-${participant.email}`}
                                            >
                                              {actionLoading === `reminder-${split._id}-${participant.email}` ? (
                                                <div className="w-3 h-3 animate-spin rounded-full border border-gray-600 border-t-transparent" />
                                              ) : (
                                                <Mail className="h-3 w-3" />
                                              )}
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-6 px-2 text-xs"
                                              onClick={() => handleMarkAsPaid(split._id, participant.email)}
                                              disabled={actionLoading === `${split._id}-${participant.email}`}
                                            >
                                              {actionLoading === `${split._id}-${participant.email}` ? (
                                                <div className="w-3 h-3 animate-spin rounded-full border border-gray-600 border-t-transparent" />
                                              ) : (
                                                <UserCheck className="h-3 w-3" />
                                              )}
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

                  {/* Pagination */}
                  {splitsState.pagination.pages > 1 && (
                    <div className="flex items-center justify-between border-t bg-white px-4 py-3 sm:px-6 rounded-lg">
                      <div className="flex flex-1 justify-between sm:hidden">
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          variant="outline"
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= splitsState.pagination.pages}
                          variant="outline"
                          size="sm"
                        >
                          Next
                        </Button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                            <span className="font-medium">
                              {Math.min(currentPage * 10, splitsState.pagination.total)}
                            </span>{' '}
                            of <span className="font-medium">{splitsState.pagination.total}</span> results
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            variant="outline"
                            size="sm"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <span className="px-3 py-1 text-sm bg-gray-100 rounded-md">
                            {currentPage} of {splitsState.pagination.pages}
                          </span>
                          <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= splitsState.pagination.pages}
                            variant="outline"
                            size="sm"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
