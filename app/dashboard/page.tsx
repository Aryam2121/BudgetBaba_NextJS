"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
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
  EyeOff
} from "lucide-react"
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart"
import { ExpensePieChart } from "@/components/charts/ExpensePieChart"
import { QuickAddExpense } from "@/components/QuickAddExpense"
import { RecentExpenses } from "@/components/RecentExpenses"
import { SplitExpenseDialog } from "@/components/SplitExpenseDialog"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { api } from "@/lib/api"
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

const StatCard = ({ title, value, change, icon: Icon, trend = "up", className = "", prefix = "$", suffix = "" }) => (
  <Card className={`relative overflow-hidden bg-white/60 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group ${className}`}>
    {/* Animated Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
      <CardTitle className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
        {title}
      </CardTitle>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
        trend === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
      } group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent className="relative z-10">
      <div className="text-2xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      <div className="flex items-center space-x-1 mt-1">
        {trend === "up" ? (
          <ArrowUpRight className="h-3 w-3 text-green-500" />
        ) : (
          <ArrowDownRight className="h-3 w-3 text-red-500" />
        )}
        <span className={`text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {change}% from last month
        </span>
      </div>
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const { user } = useAuth()
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
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await api.getDashboardStats()
        
        if (statsResponse.data) {
          setStats(statsResponse.data)
        }

        // Fetch recent expenses
        const expensesResponse = await api.getExpenses()
        
        if (expensesResponse.data) {
          const expensesData = expensesResponse.data as any
          const expenses = Array.isArray(expensesData) ? expensesData : expensesData.expenses || []
          setRecentExpenses(expenses.slice(0, 5).map((expense: any) => ({
            id: expense._id,
            description: expense.description || expense.note,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            type: 'expense'
          })))
        }

        // Fetch recent splits
        const splitsResponse = await api.getSplits()
        
        if (splitsResponse.data) {
          const splitsData = splitsResponse.data as any
          const splits = Array.isArray(splitsData) ? splitsData : splitsData.splits || []
          setRecentSplits(splits.slice(0, 3).map((split: any) => ({
            id: split._id,
            title: split.title,
            amount: split.totalAmount,
            participants: split.participants?.map((p: any) => p.name) || [],
            status: split.status,
            createdAt: split.createdAt
          })))
        }

        // Fetch chart data from monthly summary
        const summaryResponse = await api.getMonthlySummary()
        
        if (summaryResponse.data) {
          setChartData({
            monthlyTrends: summaryResponse.data.monthlyTrends || [],
            categoryTotals: summaryResponse.data.categoryTotals || []
          })
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data')
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const StatsSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-white/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
            <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-slate-200 rounded w-20 animate-pulse mb-2" />
            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const ExpenseSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-white/40 rounded-lg animate-pulse">
          <div className="h-10 w-10 bg-slate-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
          <div className="h-6 bg-slate-200 rounded w-16" />
        </div>
      ))}
    </div>
  )

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-slate-600">
                Here's what's happening with your expenses today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                3 Alerts
              </Button>
              <Link href="/expenses/new">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard 
              title="Monthly Spending" 
              value={isBalanceVisible ? stats.monthlySpent : "••••"} 
              change={Math.abs(stats.expenseChange || 0)} 
              icon={Wallet} 
              trend={(stats.expenseChange ?? 0) > 0 ? "up" : "down"} 
            />
            <StatCard 
              title="Remaining Budget" 
              value={isBalanceVisible ? stats.remainingBudget : "••••"} 
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
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="expenses">Recent Expenses</TabsTrigger>
              <TabsTrigger value="splits">Splits</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              >
                {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quick Stats */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Avg Daily Spend</span>
                    <span className="font-medium">${stats.avgDailySpend}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Categories Used</span>
                    <span className="font-medium">{stats.categoriesCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Pending Splits</span>
                    <Badge variant="outline">{stats.pendingSplits}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Budget Progress</span>
                    <span className="font-medium">71%</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/expenses/new">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Expense
                    </Button>
                  </Link>
                  <Link href="/expenses/upload">
                    <Button variant="outline" className="w-full justify-start">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
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
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Expense Trends</CardTitle>
                  <CardDescription>Your spending over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseLineChart data={chartData.monthlyTrends} />
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Where your money goes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpensePieChart data={chartData.categoryTotals} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ExpenseSkeleton />
                ) : (
                  <div className="space-y-3">
                    {recentExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            expense.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {expense.type === 'income' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{expense.description}</p>
                            <p className="text-sm text-slate-500">{expense.category} • {expense.date}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${
                          expense.type === 'income' ? 'text-green-600' : 'text-slate-800'
                        }`}>
                          {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="splits" className="space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Expense Splits</CardTitle>
                <CardDescription>Shared expenses with others</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ExpenseSkeleton />
                ) : (
                  <div className="space-y-3">
                    {recentSplits.map((split) => (
                      <div
                        key={split.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/40 hover:bg-white/60 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{split.title}</p>
                            <p className="text-sm text-slate-500">
                              {split.participants.length} participants • {split.createdAt}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">${split.amount.toFixed(2)}</p>
                          <Badge 
                            variant={split.status === 'completed' ? 'default' : 'secondary'}
                            className={split.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                          >
                            {split.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Monthly Comparison</CardTitle>
                  <CardDescription>Compare your spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">This Month</span>
                      <span className="font-medium">$2,847.50</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last Month</span>
                      <span className="font-medium">$2,534.20</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Average</span>
                      <span className="font-medium">$2,690.85</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>Your biggest spending areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Food & Dining', amount: 1240.50, percentage: 44 },
                      { name: 'Transportation', amount: 560.30, percentage: 20 },
                      { name: 'Entertainment', amount: 420.75, percentage: 15 },
                      { name: 'Shopping', amount: 350.20, percentage: 12 },
                      { name: 'Utilities', amount: 275.75, percentage: 9 }
                    ].map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">{category.name}</span>
                          <span className="font-medium">${category.amount}</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
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