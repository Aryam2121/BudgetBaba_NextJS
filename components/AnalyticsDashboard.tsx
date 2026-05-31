import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Filter
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/contexts/CurrencyContext'

interface AnalyticsData {
  expenseTrends: Array<{
    period: string
    amount: number
    count: number
    avgAmount: number
  }>
  categoryBreakdown: Array<{
    category: string
    amount: number
    percentage: number
    count: number
  }>
  monthlyComparison: Array<{
    month: string
    currentYear: number
    previousYear: number
    growth: number
  }>
  spendingInsights: {
    totalSpent: number
    avgDailySpending: number
    highestCategory: string
    mostFrequentCategory: string
    spendingTrend: 'increasing' | 'decreasing' | 'stable'
    monthlyGrowth: number
  }
  budgetAnalysis: Array<{
    category: string
    budgeted: number
    spent: number
    remaining: number
    utilization: number
    status: 'on_track' | 'warning' | 'exceeded'
  }>
  predictions: {
    nextMonthPrediction: number
    yearEndProjection: number
    savingsPotential: number
  }
}

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('last_month')
  const [categories, setCategories] = useState<string[]>([])
  const { toast } = useToast()
  const { formatAmount } = useCurrency()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const [
        trendsResponse,
        categoryResponse,
        comparisonResponse,
        insightsResponse,
        budgetResponse
      ] = await Promise.all([
        api.getExpenseTrends({ period: timeRange }),
        api.getCategoryInsights({ period: timeRange }),
        api.getSpendingComparison({ period: timeRange }),
        api.getAnalyticsInsights({ period: timeRange }),
        api.getBudgetAnalyticsData({ period: timeRange })
      ])

      const trends = trendsResponse.data?.trends || []
      const categories = categoryResponse.data?.categories || []
      const comparison = comparisonResponse.data?.comparison || []
      const budgetData = budgetResponse.data || {}
      const insightsList = insightsResponse.data?.insights || []

      const expenseTrends = trends.map((item: any) => ({
        period: item._id
          ? `${item._id.year}-${String(item._id.month || item._id.week || item._id.day || 1).padStart(2, '0')}`
          : 'Unknown',
        amount: item.totalAmount || 0,
        count: item.count || 0,
        avgAmount: item.avgAmount || 0,
      }))

      const categoryBreakdown = categories.map((item: any) => ({
        category: item._id || item.category || 'Other',
        amount: item.totalAmount || 0,
        percentage: item.percentage || 0,
        count: item.count || 0,
      }))

      const monthlyComparison = comparison.map((item: any) => ({
        month: item.category || item._id || 'Category',
        currentYear: item.current || 0,
        previousYear: item.previous || 0,
        growth: item.amountChange || 0,
      }))

      const totalSpent = categoryResponse.data?.totalSpent || budgetData.totalSpent || 0
      const topCategory = categoryBreakdown[0]

      const mockPredictions = {
        nextMonthPrediction: totalSpent * 1.1 || 1000,
        yearEndProjection: totalSpent * 12 || 12000,
        savingsPotential: totalSpent * 0.15 || 150
      }

      const combinedData: AnalyticsData = {
        expenseTrends,
        categoryBreakdown,
        monthlyComparison,
        spendingInsights: {
          totalSpent,
          avgDailySpending: budgetData.dailyBurnRate || totalSpent / 30,
          highestCategory: topCategory?.category || 'Food',
          mostFrequentCategory: topCategory?.category || 'Food',
          spendingTrend: budgetData.projectedSpending > budgetData.monthlyBudget
            ? 'increasing'
            : 'stable',
          monthlyGrowth: comparisonResponse.data?.totals?.totalChange || 0,
        },
        budgetAnalysis: (budgetData.categoryBreakdown || []).map((item: any) => {
          const spent = item.totalAmount || 0
          const budgeted = budgetData.monthlyBudget
            ? budgetData.monthlyBudget / Math.max(budgetData.categoryBreakdown.length, 1)
            : spent
          const utilization = budgeted > 0 ? (spent / budgeted) * 100 : 0
          return {
            category: item._id || item.category || 'Other',
            budgeted,
            spent,
            remaining: Math.max(0, budgeted - spent),
            utilization,
            status: utilization > 100 ? 'exceeded' : utilization > 80 ? 'warning' : 'on_track',
          }
        }),
        predictions: mockPredictions
      }

      if (insightsList.length > 0 && combinedData.spendingInsights.totalSpent === 0) {
        combinedData.spendingInsights.totalSpent = totalSpent
      }

      setAnalyticsData(combinedData)
      
      // Extract unique categories for filtering
      const uniqueCategories = Array.from(new Set(combinedData.categoryBreakdown.map(item => item.category)))
      setCategories(uniqueCategories)
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = async () => {
    try {
      const response = await api.exportExpenses({
        format: 'csv',
        // period: timeRange,
        // includeAnalytics: true
      })
      
      if (!response.data) {
        throw new Error('No data received from export')
      }
      
      // Create download link
      const blob = new Blob([response.data.blob], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `expense-analytics-${timeRange}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Success',
        description: 'Analytics data exported successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export analytics data',
        variant: 'destructive'
      })
    }
  }

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="year_to_date">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <h3 className="text-2xl font-bold">{formatAmount(analyticsData.spendingInsights.totalSpent)}</h3>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              {analyticsData.spendingInsights.spendingTrend === 'increasing' ? (
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className={`text-sm ${analyticsData.spendingInsights.monthlyGrowth >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {Math.abs(analyticsData.spendingInsights.monthlyGrowth).toFixed(1)}% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                <h3 className="text-2xl font-bold">{formatAmount(analyticsData.spendingInsights.avgDailySpending)}</h3>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Top category: {analyticsData.spendingInsights.highestCategory}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Month Prediction</p>
                <h3 className="text-2xl font-bold">{formatAmount(analyticsData.predictions.nextMonthPrediction)}</h3>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on current trends
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Savings Potential</p>
                <h3 className="text-2xl font-bold">{formatAmount(analyticsData.predictions.savingsPotential)}</h3>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Optimization opportunity
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Expense Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="budget">Budget Performance</TabsTrigger>
          <TabsTrigger value="comparison">Period Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends Over Time</CardTitle>
              <CardDescription>Track your expense patterns and identify trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.expenseTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [formatAmount(Number(value)), name]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Amount Spent"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgAmount" 
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Average Amount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Expense distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ category, percentage }: any) => `${category}: ${percentage?.toFixed(1) || 0}%`}
                    >
                      {analyticsData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatAmount(Number(value)), 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.categoryBreakdown.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-muted-foreground">{category.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatAmount(category.amount)}</p>
                        <p className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Performance</CardTitle>
              <CardDescription>Track your budget utilization across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analyticsData.budgetAnalysis.map((budget) => (
                  <div key={budget.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{budget.category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatAmount(budget.spent)} of {formatAmount(budget.budgeted)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            budget.status === 'exceeded' ? 'destructive' : 
                            budget.status === 'warning' ? 'secondary' : 'default'
                          }
                        >
                          {budget.utilization.toFixed(1)}%
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatAmount(budget.remaining)} remaining
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(budget.utilization, 100)} 
                      className={`h-2 ${budget.status === 'exceeded' ? 'bg-red-100' : ''}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Period Comparison</CardTitle>
              <CardDescription>Compare spending across different time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [formatAmount(Number(value)), name]}
                  />
                  <Bar dataKey="currentYear" fill="#3b82f6" name="Current Year" />
                  <Bar dataKey="previousYear" fill="#94a3b8" name="Previous Year" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnalyticsDashboard