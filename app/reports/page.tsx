"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { formatCurrency } from '@/lib/currency'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExpenseLineChart } from '@/components/charts/ExpenseLineChart'
import { ExpensePieChart } from '@/components/charts/ExpensePieChart'
import { api } from '@/lib/api'
import { fetchAllExpenses } from '@/lib/api-utils'
import { toast } from 'sonner'
import {
  Download,
  Filter,
  Calendar as CalendarIcon,
  FileText,
  PieChart,
  BarChart3,
  TrendingUp,
  DollarSign,
  Eye,
  Search,
  RefreshCw,
  Users,
  Tag,
  Clock,
  Archive,
  Settings,
  Share2,
  Mail
} from 'lucide-react'

interface ReportFilter {
  dateFrom: Date | null
  dateTo: Date | null
  categories: string[]
  minAmount: string
  maxAmount: string
  users: string[]
  exportFormat: 'pdf' | 'csv' | 'excel'
  includeCharts: boolean
  includeSummary: boolean
}

interface ReportData {
  totalExpenses: number
  totalTransactions: number
  averageTransaction: number
  categoryBreakdown: { category: string; total: number; count: number }[]
  monthlyTrend: { month: string; total: number }[]
  topCategories: { category: string; total: number; percentage: number }[]
  userBreakdown: { user: string; total: number; count: number }[]
  expenses: any[]
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [filters, setFilters] = useState<ReportFilter>({
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
    dateTo: new Date(),
    categories: [],
    minAmount: '',
    maxAmount: '',
    users: [],
    exportFormat: 'pdf',
    includeCharts: true,
    includeSummary: true
  })
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableUsers, setAvailableUsers] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      loadReportData()
    }
  }, [user])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      // Load expenses and monthly summary
      const [expenses, summaryResponse] = await Promise.all([
        fetchAllExpenses(),
        api.getMonthlySummary()
      ])

      // Extract available categories and users
      const categories = [...new Set(expenses.map((e: any) => e.category).filter(Boolean))]
      const users = [...new Set(expenses.map((e: any) => e.userId || e.user || 'Unknown').filter(Boolean))]
      
      setAvailableCategories(categories)
      setAvailableUsers(users)

      // Generate initial report with current data
      await generateReport(expenses, summaryResponse.data)
      
    } catch (error) {
      console.error('Error loading report data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (expenses?: any[], summaryData?: any) => {
    try {
      setGenerating(true)
      
      let expenseData = expenses
      let summary = summaryData
      
      if (!expenseData) {
        expenseData = await fetchAllExpenses()
      }
      
      if (!summary) {
        const summaryResponse = await api.getMonthlySummary()
        summary = summaryResponse.data
      }

      // Apply filters
      let filteredExpenses = expenseData.filter((expense: any) => {
        const expenseDate = new Date(expense.date || expense.createdAt)
        
        // Date filter
        if (filters.dateFrom && expenseDate < filters.dateFrom) return false
        if (filters.dateTo && expenseDate > filters.dateTo) return false
        
        // Category filter
        if (filters.categories.length > 0 && !filters.categories.includes(expense.category)) return false
        
        // Amount filter
        if (filters.minAmount && expense.amount < parseFloat(filters.minAmount)) return false
        if (filters.maxAmount && expense.amount > parseFloat(filters.maxAmount)) return false
        
        // User filter
        if (filters.users.length > 0 && !filters.users.includes(expense.userId || expense.user || 'Unknown')) return false
        
        return true
      })

      // Calculate report metrics
      const totalExpenses = filteredExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
      const totalTransactions = filteredExpenses.length
      const averageTransaction = totalTransactions > 0 ? totalExpenses / totalTransactions : 0

      // Category breakdown
      const categoryMap = new Map<string, { total: number; count: number }>()
      filteredExpenses.forEach((expense: any) => {
        const category = expense.category || 'Uncategorized'
        const current = categoryMap.get(category) || { total: 0, count: 0 }
        categoryMap.set(category, {
          total: current.total + (expense.amount || 0),
          count: current.count + 1
        })
      })

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count
      })).sort((a, b) => b.total - a.total)

      // Monthly trend
      const monthMap = new Map<string, number>()
      filteredExpenses.forEach((expense: any) => {
        const date = new Date(expense.date || expense.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + (expense.amount || 0))
      })

      const monthlyTrend = Array.from(monthMap.entries()).map(([month, total]) => ({
        month,
        total
      })).sort((a, b) => a.month.localeCompare(b.month))

      // Top categories with percentages
      const topCategories = categoryBreakdown.slice(0, 10).map(cat => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0
      }))

      // User breakdown
      const userMap = new Map<string, { total: number; count: number }>()
      filteredExpenses.forEach((expense: any) => {
        const user = expense.userId || expense.user || 'Unknown'
        const current = userMap.get(user) || { total: 0, count: 0 }
        userMap.set(user, {
          total: current.total + (expense.amount || 0),
          count: current.count + 1
        })
      })

      const userBreakdown = Array.from(userMap.entries()).map(([user, data]) => ({
        user,
        total: data.total,
        count: data.count
      })).sort((a, b) => b.total - a.total)

      setReportData({
        totalExpenses,
        totalTransactions,
        averageTransaction,
        categoryBreakdown,
        monthlyTrend,
        topCategories,
        userBreakdown,
        expenses: filteredExpenses
      })

      toast.success('Report generated successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = async () => {
    if (!reportData) {
      toast.error('No report data to export')
      return
    }

    try {
      setGenerating(true)
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const fileName = `expense-report-${new Date().toISOString().split('T')[0]}.${filters.exportFormat}`
      
      // Create downloadable content based on format
      let content = ''
      let mimeType = ''
      
      if (filters.exportFormat === 'csv') {
        // CSV Export
        const headers = ['Date', 'Description', 'Category', 'Amount', 'User']
        const csvRows = [
          headers.join(','),
          ...reportData.expenses.map(expense => [
            new Date(expense.date || expense.createdAt).toLocaleDateString(),
            `"${expense.description || ''}"`,
            expense.category || 'Uncategorized',
            expense.amount || 0,
            expense.userId || expense.user || 'Unknown'
          ].join(','))
        ]
        content = csvRows.join('\n')
        mimeType = 'text/csv'
      } else if (filters.exportFormat === 'excel') {
        // For Excel, we'll create a CSV with tab separation
        const headers = ['Date', 'Description', 'Category', 'Amount', 'User']
        const csvRows = [
          headers.join('\t'),
          ...reportData.expenses.map(expense => [
            new Date(expense.date || expense.createdAt).toLocaleDateString(),
            expense.description || '',
            expense.category || 'Uncategorized',
            expense.amount || 0,
            expense.userId || expense.user || 'Unknown'
          ].join('\t'))
        ]
        content = csvRows.join('\n')
        mimeType = 'application/vnd.ms-excel'
      } else {
        // PDF Export (simplified text format)
        content = `EXPENSE REPORT
Generated: ${new Date().toLocaleDateString()}
Period: ${filters.dateFrom?.toLocaleDateString()} - ${filters.dateTo?.toLocaleDateString()}

SUMMARY:
Total Expenses: $${reportData.totalExpenses.toFixed(2)}
Total Transactions: ${reportData.totalTransactions}
Average Transaction: $${reportData.averageTransaction.toFixed(2)}

TOP CATEGORIES:
${reportData.topCategories.map(cat => 
  `${cat.category}: $${cat.total.toFixed(2)} (${cat.percentage.toFixed(1)}%)`
).join('\n')}

DETAILED TRANSACTIONS:
${reportData.expenses.map(expense => 
  `${new Date(expense.date || expense.createdAt).toLocaleDateString()} - ${expense.description} - ${formatCurrency(expense.amount, 'USD')} - ${expense.category}`
).join('\n')}
`
        mimeType = 'text/plain'
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Report exported as ${filters.exportFormat.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    } finally {
      setGenerating(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      dateFrom: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
      dateTo: new Date(),
      categories: [],
      minAmount: '',
      maxAmount: '',
      users: [],
      exportFormat: 'pdf',
      includeCharts: true,
      includeSummary: true
    })
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Generate detailed reports and export your expense data
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
              <Button 
                onClick={() => generateReport()}
                disabled={generating}
                className="brand-btn"
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Generate Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <Card className="lg:col-span-1 dashboard-panel">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
                <CardDescription>
                  Customize your report parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {filters.dateFrom ? filters.dateFrom.toLocaleDateString() : 'From Date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateFrom || undefined}
                          onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date || null }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {filters.dateTo ? filters.dateTo.toLocaleDateString() : 'To Date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateTo || undefined}
                          onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date || null }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ 
                                ...prev, 
                                categories: [...prev.categories, category] 
                              }))
                            } else {
                              setFilters(prev => ({ 
                                ...prev, 
                                categories: prev.categories.filter(c => c !== category) 
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`category-${category}`} className="text-sm">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                  <Label>Amount Range</Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Min Amount"
                      value={filters.minAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max Amount"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Users */}
                {availableUsers.length > 1 && (
                  <div className="space-y-2">
                    <Label>Users</Label>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                      {availableUsers.map(user => (
                        <div key={user} className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${user}`}
                            checked={filters.users.includes(user)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters(prev => ({ 
                                  ...prev, 
                                  users: [...prev.users, user] 
                                }))
                              } else {
                                setFilters(prev => ({ 
                                  ...prev, 
                                  users: prev.users.filter(u => u !== user) 
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={`user-${user}`} className="text-sm">
                            {user}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Export Options */}
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select 
                    value={filters.exportFormat} 
                    onValueChange={(value: 'pdf' | 'csv' | 'excel') => 
                      setFilters(prev => ({ ...prev, exportFormat: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Export Inclusions */}
                <div className="space-y-2">
                  <Label>Include in Export</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-charts"
                        checked={filters.includeCharts}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, includeCharts: !!checked }))
                        }
                      />
                      <Label htmlFor="include-charts" className="text-sm">Charts & Graphs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-summary"
                        checked={filters.includeSummary}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, includeSummary: !!checked }))
                        }
                      />
                      <Label htmlFor="include-summary" className="text-sm">Summary Statistics</Label>
                    </div>
                  </div>
                </div>

                {/* Export Button */}
                <Button 
                  onClick={handleExport} 
                  disabled={!reportData || generating}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </CardContent>
            </Card>

            {/* Main Report Content */}
            <div className="lg:col-span-3 space-y-6">
              {loading ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse dashboard-panel">
                      <CardHeader>
                        <div className="h-6 bg-slate-200 rounded w-1/3" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-40 bg-slate-200 rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reportData ? (
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="dashboard-panel">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="dashboard-panel">
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <DollarSign className="h-8 w-8 text-green-500" />
                            <div className="ml-4">
                              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                              <p className="text-2xl font-bold text-foreground">
                                ${reportData.totalExpenses.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="dashboard-panel">
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div className="ml-4">
                              <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                              <p className="text-2xl font-bold text-foreground">
                                {reportData.totalTransactions}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="dashboard-panel">
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-purple-500" />
                            <div className="ml-4">
                              <p className="text-sm font-medium text-muted-foreground">Average</p>
                              <p className="text-2xl font-bold text-foreground">
                                ${reportData.averageTransaction.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Insights */}
                    <Card className="dashboard-panel">
                      <CardHeader>
                        <CardTitle>Report Summary</CardTitle>
                        <CardDescription>
                          Key insights from your filtered data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Alert>
                            <TrendingUp className="h-4 w-4" />
                            <AlertDescription>
                              Your top spending category is <strong>{reportData.topCategories[0]?.category}</strong> 
                              with ${reportData.topCategories[0]?.total.toFixed(2)} 
                              ({reportData.topCategories[0]?.percentage.toFixed(1)}% of total expenses)
                            </AlertDescription>
                          </Alert>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-muted/40 rounded-lg">
                              <div className="text-2xl font-bold text-foreground">
                                {reportData.monthlyTrend.length}
                              </div>
                              <div className="text-sm text-muted-foreground">Months of Data</div>
                            </div>
                            <div className="text-center p-4 bg-muted/40 rounded-lg">
                              <div className="text-2xl font-bold text-foreground">
                                {reportData.categoryBreakdown.length}
                              </div>
                              <div className="text-sm text-muted-foreground">Categories</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="charts" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card className="dashboard-panel">
                        <CardHeader>
                          <CardTitle>Monthly Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ExpenseLineChart 
                            data={reportData.monthlyTrend.map(item => ({
                              month: item.month,
                              amount: item.total
                            }))}
                          />
                        </CardContent>
                      </Card>
                      
                      <Card className="dashboard-panel">
                        <CardHeader>
                          <CardTitle>Category Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ExpensePieChart 
                            data={reportData.topCategories.slice(0, 8).map(item => ({
                              category: item.category,
                              amount: item.total
                            }))}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="breakdown" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Category Breakdown */}
                      <Card className="dashboard-panel">
                        <CardHeader>
                          <CardTitle>Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {reportData.categoryBreakdown.slice(0, 10).map((category, index) => (
                              <div key={category.category} className="flex items-center justify-between p-2 bg-muted/40 rounded">
                                <div className="flex items-center space-x-3">
                                  <div className="text-sm font-medium">#{index + 1}</div>
                                  <div>
                                    <div className="font-semibold">{category.category}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {category.count} transaction{category.count !== 1 ? 's' : ''}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">${category.total.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {((category.total / reportData.totalExpenses) * 100).toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* User Breakdown */}
                      {reportData.userBreakdown.length > 1 && (
                        <Card className="dashboard-panel">
                          <CardHeader>
                            <CardTitle>User Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {reportData.userBreakdown.map((user, index) => (
                                <div key={user.user} className="flex items-center justify-between p-2 bg-muted/40 rounded">
                                  <div className="flex items-center space-x-3">
                                    <div className="text-sm font-medium">#{index + 1}</div>
                                    <div>
                                      <div className="font-semibold">{user.user}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {user.count} transaction{user.count !== 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold">${user.total.toFixed(2)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {((user.total / reportData.totalExpenses) * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="transactions" className="space-y-6">
                    <Card className="dashboard-panel">
                      <CardHeader>
                        <CardTitle>Detailed Transactions</CardTitle>
                        <CardDescription>
                          All transactions matching your filters ({reportData.expenses.length} items)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Description</th>
                                <th className="text-left p-2">Category</th>
                                <th className="text-right p-2">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.expenses.slice(0, 50).map((expense, index) => (
                                <tr key={index} className="border-b hover:bg-muted/40">
                                  <td className="p-2 text-sm">
                                    {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-2 text-sm">{expense.description || 'No description'}</td>
                                  <td className="p-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {expense.category || 'Uncategorized'}
                                    </Badge>
                                  </td>
                                  <td className="p-2 text-sm text-right font-medium">
                                    {formatCurrency(expense.amount || 0, 'USD')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {reportData.expenses.length > 50 && (
                            <div className="text-center p-4 text-sm text-muted-foreground">
                              Showing first 50 transactions. Export report to see all {reportData.expenses.length} transactions.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card className="dashboard-panel">
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Report Generated</h3>
                    <p className="text-slate-500 mb-4">Click "Generate Report" to create your custom expense report</p>
                    <Button onClick={() => generateReport()}>
                      <Search className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}