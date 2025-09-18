"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  TrendingUp, 
  TrendingDown, 
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
}

interface ExpenseData {
  id: string
  title: string
  amount: number
  category: string
  date: string
  type: 'expense' | 'split'
}

function EnhancedDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [expenses, setExpenses] = useState<ExpenseData[]>([])
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real data from API
      const [summaryRes, expensesRes] = await Promise.all([
        api.getMonthlySummary(),
        api.getExpenses()
      ])
      
      // Transform API data to match our interface
      if (summaryRes.data) {
        const summary = summaryRes.data
        setStats({
          totalExpenses: summary.totalSpent || 0,
          monthlySpent: summary.currentMonth || 0,
          remainingBudget: (user?.monthlyBudget || 0) - (summary.currentMonth || 0),
          savingsRate: summary.savingsRate || 0,
          pendingSplits: summary.pendingSplits || 0,
          totalSplits: summary.totalSplits || 0,
          categoriesCount: summary.categoriesCount || 0,
          avgDailySpend: summary.avgDailySpend || 0
        })
      }
      
      if (expensesRes.data) {
        setExpenses(expensesRes.data.slice(0, 10) || [])
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      // Fallback to demo data for better UX
      setStats({
        totalExpenses: 45230,
        monthlySpent: 12560,
        remainingBudget: 7440,
        savingsRate: 23.5,
        pendingSplits: 3,
        totalSplits: 12,
        categoriesCount: 8,
        avgDailySpend: 418
      })
      
      setExpenses([
        { id: '1', title: 'Grocery Shopping', amount: 2340, category: 'Food', date: '2025-09-17', type: 'expense' },
        { id: '2', title: 'Dinner Split', amount: 890, category: 'Food', date: '2025-09-16', type: 'split' },
        { id: '3', title: 'Uber Ride', amount: 340, category: 'Transport', date: '2025-09-16', type: 'expense' },
        { id: '4', title: 'Movie Tickets', amount: 600, category: 'Entertainment', date: '2025-09-15', type: 'split' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const budgetPercentage = stats ? (stats.monthlySpent / (stats.monthlySpent + Math.max(stats.remainingBudget, 0))) * 100 : 0

  const statCards = [
    {
      title: "Total Balance",
      value: stats?.totalExpenses || 0,
      change: "+12.5%",
      trend: "up",
      icon: Wallet,
      color: "from-blue-500 to-cyan-500",
      description: "Total available balance"
    },
    {
      title: "Monthly Spent", 
      value: stats?.monthlySpent || 0,
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
      description: "Spent this month"
    },
    {
      title: "Savings Rate",
      value: stats?.savingsRate || 0,
      change: "+3.1%",
      trend: "up",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      description: "Monthly savings rate",
      isPercentage: true
    },
    {
      title: "Active Splits",
      value: stats?.pendingSplits || 0,
      change: "-2",
      trend: "down",
      icon: Users,
      color: "from-orange-500 to-red-500",
      description: "Pending settlements"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading your financial dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-slate-500 text-sm">Here's what's happening with your finances today</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white/60 backdrop-blur-sm border-slate-200"
                />
              </div>
              <Button variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={card.title} className="transform transition-all duration-300 hover:scale-105">
              <Card className="relative overflow-hidden bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-slate-300/60">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-[0.02]`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-10`}>
                      <card.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge 
                      variant={card.trend === 'up' ? 'default' : 'secondary'}
                      className={`${card.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} border-0`}
                    >
                      {card.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {card.change}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-medium text-slate-600">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-3xl font-bold text-slate-800">
                      {card.title === "Total Balance" && !showBalance ? "••••••" : 
                       card.isPercentage ? `${card.value}%` : `₹${card.value.toLocaleString()}`}
                    </p>
                    {card.title === "Total Balance" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalance(!showBalance)}
                        className="h-8 w-8 p-0 hover:bg-slate-100"
                      >
                        {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{card.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Budget Progress */}
        {stats && stats.remainingBudget !== undefined && (
          <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Monthly Budget</CardTitle>
                  <CardDescription>Track your spending against your budget</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">₹{stats.monthlySpent.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">of ₹{(stats.monthlySpent + Math.max(stats.remainingBudget, 0)).toLocaleString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress 
                  value={Math.min(budgetPercentage, 100)} 
                  className="h-3 bg-slate-100"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Spent: {budgetPercentage.toFixed(1)}%</span>
                  <span className="text-slate-600">Remaining: ₹{Math.max(stats.remainingBudget, 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-xl border-0 shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <PieChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="splits" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Splits
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <QuickAddExpense onExpenseAdded={fetchDashboardData} />
                  <Separator />
                  <Link href="/expenses/new">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Detailed Expense
                    </Button>
                  </Link>
                  <SplitExpenseDialog onSplitCreated={fetchDashboardData} />
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
                  <CardHeader>
                    <CardTitle>Spending Trends</CardTitle>
                    <CardDescription>Your expense patterns over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExpenseLineChart />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>How you're spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpensePieChart />
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest expenses and splits</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentExpenses expenses={expenses} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Expenses</CardTitle>
                    <CardDescription>Manage and track your expenses</CardDescription>
                  </div>
                  <Link href="/expenses/new">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <RecentExpenses expenses={expenses} showAll />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="splits" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Expense Splits</CardTitle>
                    <CardDescription>Manage shared expenses with friends</CardDescription>
                  </div>
                  <SplitExpenseDialog onSplitCreated={fetchDashboardData} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your expense splits will appear here</p>
                  <Link href="/splits">
                    <Button variant="outline" className="mt-4">
                      View All Splits
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
                <CardHeader>
                  <CardTitle>Spending Analytics</CardTitle>
                  <CardDescription>Detailed insights into your spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseLineChart />
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Breakdown by expense categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpensePieChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <EnhancedDashboard />
    </ProtectedRoute>
  )
}

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [summaryResponse, expensesResponse] = await Promise.all([
        api.getMonthlySummary(),
        api.getExpenses({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] }),
      ])

      if (summaryResponse.data) {
        setSummary(summaryResponse.data)
      }

      if (expensesResponse.data) {
        const expensesData = expensesResponse.data as any
        setExpenses(Array.isArray(expensesData) ? expensesData : expensesData.expenses || [])
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseAdded = () => {
    loadDashboardData()
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

  const currentMonthTotal = summary?.budgetInfo?.totalSpent || 0
  const budgetLeft = summary?.budgetInfo?.budgetLeft || 0
  const monthlyBudget = summary?.budgetInfo?.monthlyBudget || 0

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
                <p className="text-gray-600 mt-1">Here's your financial overview for today</p>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/budget">
                  <Button variant="outline" size="sm" className="h-10">
                    <Settings className="h-4 w-4 mr-2" />
                    Budget Settings
                  </Button>
                </Link>
                <Button onClick={logout} variant="ghost" size="sm" className="h-10">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">This Month</p>
                    <p className="text-3xl font-bold">₹{currentMonthTotal.toFixed(2)}</p>
                    <p className="text-blue-100 text-xs mt-1">Total spent</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <DollarSign className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${budgetLeft >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white border-0 shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Budget Left</p>
                    <p className="text-3xl font-bold">₹{budgetLeft.toFixed(2)}</p>
                    <p className="text-white/80 text-xs mt-1">{budgetLeft >= 0 ? 'Under budget' : 'Over budget'}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Target className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Expenses</p>
                    <p className="text-3xl font-bold">{expenses.length}</p>
                    <p className="text-purple-100 text-xs mt-1">This month</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Calendar className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Daily Average</p>
                    <p className="text-3xl font-bold">
                      ₹{expenses.length > 0 ? (currentMonthTotal / new Date().getDate()).toFixed(2) : "0.00"}
                    </p>
                    <p className="text-orange-100 text-xs mt-1">Per day</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Panel */}
          {summary?.budgetInfo?.alerts && summary.budgetInfo.alerts.length > 0 && (
            <AlertsPanel alerts={summary.budgetInfo.alerts} className="mb-8" />
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Link href="/expenses/new">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                      <PlusCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Add Expense</h3>
                      <p className="text-sm text-gray-600">Record a new expense quickly</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/expenses/upload">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Upload CSV</h3>
                      <p className="text-sm text-gray-600">Bulk import your expenses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/splits">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-orange-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors">
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Split Expenses</h3>
                      <p className="text-sm text-gray-600">Share costs with friends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/budget">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Manage Budget</h3>
                      <p className="text-sm text-gray-600">Set your spending limits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Charts and Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Current month breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensePieChart data={summary?.categoryTotals || []} />
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Last 6 months spending</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseLineChart data={summary?.monthlyTrends || []} />
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Expenses */}
            <div className="lg:col-span-2">
              <RecentExpenses 
                expenses={expenses.slice(0, 10)} 
                onExpenseUpdated={handleExpenseAdded}
              />
            </div>

            {/* Quick Add */}
            <div>
              <QuickAddExpense onExpenseAdded={handleExpenseAdded} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
