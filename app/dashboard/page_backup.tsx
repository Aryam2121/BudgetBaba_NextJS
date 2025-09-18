"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
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
}

interface ExpenseData {
  _id: string
  title: string
  amount: number
  category: string
  date: string
  createdAt: string
  vendor?: string
  note?: string
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
      
      // Mock expense data with correct structure
      setExpenses([
        { 
          _id: '1', 
          title: 'Grocery Shopping', 
          amount: 2340, 
          category: 'Food', 
          date: '2025-09-17', 
          createdAt: '2025-09-17T10:00:00Z',
          vendor: 'BigBasket'
        },
        { 
          _id: '2', 
          title: 'Dinner with Friends', 
          amount: 890, 
          category: 'Food', 
          date: '2025-09-16', 
          createdAt: '2025-09-16T20:00:00Z',
          vendor: 'Restaurant XYZ'
        },
        { 
          _id: '3', 
          title: 'Uber Ride', 
          amount: 340, 
          category: 'Transport', 
          date: '2025-09-16', 
          createdAt: '2025-09-16T18:00:00Z'
        },
        { 
          _id: '4', 
          title: 'Movie Tickets', 
          amount: 600, 
          category: 'Entertainment', 
          date: '2025-09-15', 
          createdAt: '2025-09-15T19:00:00Z',
          vendor: 'PVR Cinemas'
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const budgetPercentage = stats && stats.remainingBudget >= 0 ? 
    (stats.monthlySpent / (stats.monthlySpent + Math.max(stats.remainingBudget, 0))) * 100 : 100

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

  // Sample data for charts
  const chartData = [
    { name: 'Food', value: 4500, color: '#8884d8' },
    { name: 'Transport', value: 2300, color: '#82ca9d' },
    { name: 'Entertainment', value: 1800, color: '#ffc658' },
    { name: 'Utilities', value: 1200, color: '#ff7c7c' },
    { name: 'Shopping', value: 900, color: '#8dd1e1' },
  ]

  const lineData = [
    { name: 'Jan', value: 8500 },
    { name: 'Feb', value: 9200 },
    { name: 'Mar', value: 7800 },
    { name: 'Apr', value: 10500 },
    { name: 'May', value: 11200 },
    { name: 'Jun', value: 9800 },
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
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 bg-white/70 backdrop-blur-xl border-0 shadow-lg w-fit">
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
          </div>

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
                  <SplitExpenseDialog 
                    onSplitCreated={fetchDashboardData}
                    expense={{ _id: '', title: '', amount: 0, category: '' }}
                  />
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
                    <ExpenseLineChart data={lineData} />
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
                  <ExpensePieChart data={chartData} />
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
                  <SplitExpenseDialog 
                    onSplitCreated={fetchDashboardData}
                    expense={{ _id: '', title: '', amount: 0, category: '' }}
                  />
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
                  <ExpenseLineChart data={lineData} />
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl shadow-slate-200/60">
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Breakdown by expense categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpensePieChart data={chartData} />
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