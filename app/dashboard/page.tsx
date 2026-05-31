"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useCurrency } from "@/contexts/CurrencyContext"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Filter,
  Bell,
  Plus,
  CreditCard,
  Target,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  Receipt
} from "lucide-react"
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart"
import { ExpensePieChart } from "@/components/charts/ExpensePieChart"
import { QuickAddExpense } from "@/components/QuickAddExpense"
import { RecentExpenses } from "@/components/RecentExpenses"
import { SplitExpenseDialog } from "@/components/SplitExpenseDialog"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { api } from "@/lib/api"
import { getExpensesList } from "@/lib/api-utils"
import Link from "next/link"

interface DashboardStats {
  totalExpenses: number
  monthlySpent: number
  remainingBudget: number
  savingsRate: number
  pendingSplits: number
  totalSplits: number
  categoriesCount: number
  avgDailySpend: number
  expenseChange?: number
}

interface ExpenseData {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: 'expense' | 'income'
}

interface SplitData {
  id: string
  title: string
  amount: number
  participants: string[]
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
}

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down"
  className?: string
  prefix?: string
  suffix?: string
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = "up", 
  className = "", 
  prefix = "", 
  suffix = "" 
}) => (
  <Card className={`relative overflow-hidden bg-card backdrop-blur-sm border-border shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group ${className}`}>
    {/* Animated Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
      <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {title}
      </CardTitle>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
        trend === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
      } group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent className="relative z-10">
      <div className="text-2xl font-bold text-foreground group-hover:text-foreground transition-colors">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      <div className="flex items-center space-x-1 mt-1">
        {trend === "up" ? (
          <ArrowUpRight className="h-3 w-3 text-green-500" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-red-500" />
        )}
        <span className={`text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {Math.abs(change)}% from last month
        </span>
      </div>
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const { user } = useAuth()
  const { formatAmount } = useCurrency()
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    monthlySpent: 0,
    remainingBudget: 0,
    savingsRate: 0,
    pendingSplits: 0,
    totalSplits: 0,
    categoriesCount: 0,
    avgDailySpend: 0
  })
  const [recentExpenses, setRecentExpenses] = useState<ExpenseData[]>([])
  const [recentSplits, setRecentSplits] = useState<SplitData[]>([])
  const [chartData, setChartData] = useState<{
    monthlyTrends: any[]
    categoryTotals: any[]
  }>({
    monthlyTrends: [],
    categoryTotals: []
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !loading) {
        fetchDashboardData(true)
      }
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [user, loading])

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      setError(null)

      // Enhanced parallel data fetching with better error handling
      const [statsResponse, expensesResponse, splitsResponse, summaryResponse] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getExpenses(),
        api.getSplits(),
        api.getMonthlySummary()
      ])

      // Process dashboard stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data) {
        const data = statsResponse.value.data
        setStats({
          totalExpenses: data.totalExpenses || 0,
          monthlySpent: data.monthlySpent || data.currentMonth || 0,
          remainingBudget: data.remainingBudget || data.budgetRemaining || 0,
          savingsRate: data.savingsRate || 0,
          pendingSplits: data.pendingSplits || 0,
          totalSplits: data.totalSplits || 0,
          categoriesCount: data.categoriesCount || data.categoryCount || 0,
          avgDailySpend: data.avgDailySpend || data.averageDailySpend || 0,
          expenseChange: data.expenseChange || data.monthlyChange || 0
        })
      }

      // Process recent expenses
      if (expensesResponse.status === 'fulfilled' && expensesResponse.value.data) {
        const expenses = getExpensesList(expensesResponse.value.data)
        
        setRecentExpenses(expenses.slice(0, 5).map((expense: any) => ({
          id: expense._id || expense.id,
          description: expense.description || expense.note || expense.vendor || 'Unknown expense',
          amount: parseFloat(expense.amount) || 0,
          category: expense.category || 'Other',
          date: new Date(expense.date).toLocaleDateString() || new Date().toLocaleDateString(),
          type: expense.type || 'expense'
        })))
      }

      // Process recent splits
      if (splitsResponse.status === 'fulfilled' && splitsResponse.value.data) {
        const splitsData = splitsResponse.value.data as any
        const splits = Array.isArray(splitsData) ? splitsData : splitsData.splits || []
        
        setRecentSplits(splits.slice(0, 3).map((split: any) => ({
          id: split._id || split.id,
          title: split.title || split.description || 'Shared Expense',
          amount: parseFloat(split.totalAmount) || parseFloat(split.amount) || 0,
          participants: split.participants?.map((p: any) => p.name || p.email) || [],
          status: split.status || 'pending',
          createdAt: new Date(split.createdAt).toLocaleDateString() || new Date().toLocaleDateString()
        })))
      }

      // Process chart data
      if (summaryResponse.status === 'fulfilled' && summaryResponse.value.data) {
        const summary = summaryResponse.value.data
        setChartData({
          monthlyTrends: summary.monthlyTrends || summary.trends || [],
          categoryTotals: summary.categoryTotals || summary.categories || []
        })
      }

      // Handle any failed requests
      const failures = [statsResponse, expensesResponse, splitsResponse, summaryResponse]
        .filter(response => response.status === 'rejected')
      
      if (failures.length > 0) {
        console.warn('Some data requests failed:', failures)
        if (failures.length === 4) {
          setError('Unable to load dashboard data. Please check your connection.')
        }
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const StatsSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-card backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded w-20 animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const ExpenseSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-muted/40 rounded-lg animate-pulse">
          <div className="h-10 w-10 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="h-6 bg-muted rounded w-16" />
        </div>
      ))}
    </div>
  )

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Here's what's happening with your expenses today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {error && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDashboardData(true)}
                  disabled={refreshing}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {refreshing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retry
                </Button>
              )}
              
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">3 Alerts</span>
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                  3
                </Badge>
              </Button>
              
              <Link href="/expenses/new">
                <Button className="brand-btn whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add Expense</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Actions Bar for Mobile */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 lg:hidden">
            <Link href="/expenses/new">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </Link>
            <Link href="/expenses/upload">
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </Link>
            <Link href="/splits">
              <Button variant="outline" size="sm" className="w-full">
                <Users className="h-4 w-4 mr-1" />
                Split
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" size="sm" className="w-full">
                <TrendingUp className="h-4 w-4 mr-1" />
                Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard 
              title="Monthly Spending" 
              value={isBalanceVisible ? formatAmount(stats.monthlySpent) : "••••"} 
              change={Math.abs(stats.expenseChange || 0)} 
              icon={Wallet} 
              trend={(stats.expenseChange ?? 0) > 0 ? "up" : "down"} 
            />
            <StatCard 
              title="Remaining Budget" 
              value={isBalanceVisible ? formatAmount(stats.remainingBudget) : "••••"} 
              change={Math.abs(stats.savingsRate || 0)} 
              icon={Target} 
              trend={stats.remainingBudget > 0 ? "up" : "down"} 
            />
            <StatCard 
              title="Total Expenses" 
              value={stats.totalExpenses} 
              change={Math.abs(stats.expenseChange || 0)} 
              icon={CreditCard} 
              trend={(stats.expenseChange ?? 0) > 0 ? "up" : "down"} 
              prefix="" 
              suffix=" this month"
            />
            <StatCard 
              title="Savings Rate" 
              value={stats.savingsRate} 
              change={Math.abs(stats.savingsRate || 0)} 
              icon={TrendingUp} 
              trend="up" 
              prefix="" 
              suffix="%"
            />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="bg-card/60 backdrop-blur-sm w-full sm:w-auto overflow-x-auto">
              <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
              <TabsTrigger value="expenses" className="flex-1 sm:flex-none">Expenses</TabsTrigger>
              <TabsTrigger value="splits" className="flex-1 sm:flex-none">Splits</TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 sm:flex-none">Analytics</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="whitespace-nowrap"
              >
                {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">
                  {isBalanceVisible ? 'Hide' : 'Show'} Balance
                </span>
              </Button>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              {refreshing && (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Quick Stats */}
              <Card className="bg-card/60 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Daily Spend</span>
                      <span className="font-medium text-foreground">{isBalanceVisible ? formatAmount(stats.avgDailySpend) : '••••'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Categories Used</span>
                      <span className="font-medium text-foreground">{stats.categoriesCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending Splits</span>
                      <Badge variant="outline">{stats.pendingSplits}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Budget Progress</span>
                      <span className="font-medium text-foreground">
                        {stats.monthlySpent && user?.monthlyBudget ? 
                          Math.round((stats.monthlySpent / user.monthlyBudget) * 100) : 71
                        }%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Budget Usage</span>
                      <span className="font-medium">
                        {isBalanceVisible ? formatAmount(stats.monthlySpent) : '••••'} / {isBalanceVisible ? formatAmount(user?.monthlyBudget || 3000) : '••••'}
                      </span>
                    </div>
                    <Progress 
                      value={stats.monthlySpent && user?.monthlyBudget ? 
                        Math.min((stats.monthlySpent / user.monthlyBudget) * 100, 100) : 71
                      } 
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-card/60 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link href="/expenses/new">
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Expense
                      </Button>
                    </Link>
                    <Link href="/expenses/upload">
                      <Button variant="outline" className="w-full justify-start">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Receipt
                      </Button>
                    </Link>
                    <Link href="/splits">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Create Split
                      </Button>
                    </Link>
                    <Link href="/budget">
                      <Button variant="outline" className="w-full justify-start">
                        <Target className="h-4 w-4 mr-2" />
                        Set Budget
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Recent Activity Summary */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-3 text-foreground">Recent Activity</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Today's expenses</span>
                        <Badge variant="secondary">
                          {recentExpenses.filter(e => 
                            new Date(e.date).toDateString() === new Date().toDateString()
                          ).length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>This week</span>
                        <span className="font-medium text-foreground">
                          {recentExpenses.filter(e => {
                            const expenseDate = new Date(e.date)
                            const weekAgo = new Date()
                            weekAgo.setDate(weekAgo.getDate() - 7)
                            return expenseDate >= weekAgo
                          }).length} expenses
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active splits</span>
                        <span className="font-medium text-foreground">{stats.pendingSplits}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
              <Card className="bg-card/60 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle>Expense Trends</CardTitle>
                  <CardDescription>Your spending over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.monthlyTrends.length > 0 ? (
                    <ExpenseLineChart data={chartData.monthlyTrends} />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No trend data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border shadow-xl">
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Where your money goes</CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.categoryTotals.length > 0 ? (
                    <ExpensePieChart data={chartData.categoryTotals} />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No category data available</p>
                        <p className="text-xs mt-1">Add some expenses to see breakdown</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>Your latest transactions</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href="/expenses">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                  <Link href="/expenses/new">
                    <Button size="sm" className="brand-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ExpenseSkeleton />
                ) : recentExpenses.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No expenses yet</h3>
                    <p className="text-muted-foreground mb-4">Start tracking your expenses to see them here</p>
                    <Link href="/expenses/new">
                      <Button className="brand-btn">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Expense
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentExpenses.map((expense, index) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-card/40 hover:bg-card/60 border border-border/50 transition-all duration-200 group cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            expense.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          } group-hover:scale-110 transition-transform`}>
                            {expense.type === 'income' ? 
                              <ArrowDownRight className="h-5 w-5" /> : 
                              <Receipt className="h-5 w-5" />
                            }
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground group-hover:text-foreground/90 truncate">
                              {expense.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {expense.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{expense.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`font-semibold text-lg ${
                            expense.type === 'income' ? 'text-green-600' : 'text-foreground'
                          }`}>
                            {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount).replace(/^./, '')}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show more button */}
                    {recentExpenses.length >= 5 && (
                      <div className="text-center pt-4">
                        <Link href="/expenses">
                          <Button variant="outline" className="w-full sm:w-auto">
                            View All Expenses
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="splits" className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-sm border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Expense Splits</CardTitle>
                  <CardDescription>Shared expenses with others</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href="/splits">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                  <Link href="/splits">
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                      <Users className="h-4 w-4 mr-2" />
                      Split
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ExpenseSkeleton />
                ) : recentSplits.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No splits yet</h3>
                    <p className="text-muted-foreground mb-4">Share expenses with friends and family</p>
                    <Link href="/splits">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                        <Users className="h-4 w-4 mr-2" />
                        Create First Split
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSplits.map((split, index) => (
                      <div
                        key={split.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 group cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground group-hover:text-slate-900 truncate">
                              {split.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1 text-sm text-slate-500">
                              <span>{split.participants.length} participant{split.participants.length !== 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span>{split.createdAt}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {split.participants.slice(0, 3).map((participant, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {participant}
                                </Badge>
                              ))}
                              {split.participants.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{split.participants.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-lg text-foreground">{formatAmount(split.amount)}</p>
                          <Badge 
                            variant={split.status === 'completed' ? 'default' : 'secondary'}
                            className={`${
                              split.status === 'completed' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : split.status === 'pending'
                                ? 'bg-orange-100 text-orange-800 border-orange-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            {split.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {/* Summary row */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{stats.pendingSplits}</div>
                          <div className="text-sm text-purple-600">Pending</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{stats.totalSplits - stats.pendingSplits}</div>
                          <div className="text-sm text-green-600">Settled</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground/90">
                            {formatAmount(recentSplits.reduce((sum, split) => sum + split.amount, 0))}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Amount</div>
                        </div>
                      </div>
                    </div>
                    
                    {recentSplits.length >= 3 && (
                      <div className="text-center pt-4">
                        <Link href="/splits">
                          <Button variant="outline" className="w-full sm:w-auto">
                            View All Splits
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
              <Card className="dashboard-panel shadow-xl">
                <CardHeader>
                  <CardTitle>Monthly Comparison</CardTitle>
                  <CardDescription>Compare your spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">This Month</span>
                        <span className="font-medium">
                          {isBalanceVisible ? formatAmount(stats.monthlySpent) : '••••••'}
                        </span>
                      </div>
                      <Progress 
                        value={stats.monthlySpent && user?.monthlyBudget ? 
                          Math.min((stats.monthlySpent / user.monthlyBudget) * 100, 100) : 85
                        } 
                        className="h-3"
                      />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Month</span>
                        <span className="font-medium">
                          {isBalanceVisible ? formatAmount((stats.monthlySpent || 0) * 0.89) : '••••••'}
                        </span>
                      </div>
                      <Progress 
                        value={75} 
                        className="h-3"
                      />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">6-Month Average</span>
                        <span className="font-medium">
                          {isBalanceVisible ? formatAmount((stats.monthlySpent || 0) * 0.95) : '••••••'}
                        </span>
                      </div>
                      <Progress 
                        value={80} 
                        className="h-3"
                      />
                    </div>
                    
                    {/* Trend indicators */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-sm font-medium text-red-600">+12%</span>
                        </div>
                        <div className="text-xs text-slate-500">vs Last Month</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">-5%</span>
                        </div>
                        <div className="text-xs text-slate-500">vs Average</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-panel shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Top Categories</CardTitle>
                    <CardDescription>Your biggest spending areas</CardDescription>
                  </div>
                  <Link href="/analytics">
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Detailed View
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {chartData.categoryTotals.length > 0 ? (
                      chartData.categoryTotals.slice(0, 5).map((category: any, index: number) => (
                        <div key={category.name || `category-${index}`} className="space-y-2">
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: category.color || `hsl(${index * 60}, 70%, 60%)` }}
                              />
                              {category.name || category.category || 'Other'}
                            </span>
                            <div className="text-right">
                              <span className="font-medium">
                                ${isBalanceVisible ? (category.amount || category.value || 0).toLocaleString() : '••••'}
                              </span>
                              <div className="text-xs text-slate-500">
                                {((category.amount || category.value || 0) / (stats.monthlySpent || 1) * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <Progress 
                            value={((category.amount || category.value || 0) / (stats.monthlySpent || 1) * 100)} 
                            className="h-2"
                          />
                        </div>
                      ))
                    ) : (
                      [
                        { name: 'Food & Dining', amount: 1240.50, percentage: 44 },
                        { name: 'Transportation', amount: 560.30, percentage: 20 },
                        { name: 'Entertainment', amount: 420.75, percentage: 15 },
                        { name: 'Shopping', amount: 350.20, percentage: 12 },
                        { name: 'Utilities', amount: 275.75, percentage: 9 }
                      ].map((category, index) => (
                        <div key={category.name} className="space-y-2">
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-muted-foreground flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
                              />
                              {category.name}
                            </span>
                            <div className="text-right">
                              <span className="font-medium">
                                ${isBalanceVisible ? category.amount.toLocaleString() : '••••'}
                              </span>
                              <div className="text-xs text-slate-500">{category.percentage}%</div>
                            </div>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                        </div>
                      ))
                    )}
                    
                    {/* Insights */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Smart Insight</h4>
                          <p className="text-xs text-blue-700">
                            Your food spending is 15% higher than last month. Consider meal planning to optimize costs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Additional Analytics Row */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="dashboard-panel shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Spending Velocity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      ${isBalanceVisible ? stats.avgDailySpend.toFixed(2) : '••••'}
                    </div>
                    <div className="text-sm text-muted-foreground">Average per day</div>
                    <div className="mt-4 text-xs text-slate-500">
                      At this rate, you'll spend ${isBalanceVisible ? (stats.avgDailySpend * 30).toFixed(2) : '••••'} this month
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="dashboard-panel shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Budget Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      stats.remainingBudget > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.remainingBudget > 0 ? '✓' : '⚠'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.remainingBudget > 0 ? 'On Track' : 'Over Budget'}
                    </div>
                    <div className="mt-4 text-xs text-slate-500">
                      {isBalanceVisible ? `$${Math.abs(stats.remainingBudget)} ${stats.remainingBudget > 0 ? 'remaining' : 'over'}` : '••••'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="dashboard-panel shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Category Diversity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stats.categoriesCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Active categories</div>
                    <div className="mt-4 text-xs text-slate-500">
                      {stats.categoriesCount > 5 ? 'Diverse spending' : 'Focused spending'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </ProtectedRoute>
  )
}