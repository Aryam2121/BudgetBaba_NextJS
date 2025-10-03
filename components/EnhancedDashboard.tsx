"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import {
  DollarSign, TrendingUp, TrendingDown, Target, Calendar, Users,
  Zap, Brain, Star, AlertTriangle, CheckCircle, Plus, ArrowUpRight,
  ArrowDownRight, Equal, RefreshCw, Eye, Filter, Download
} from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrency } from '@/hooks/useCurrency'
import { useSocket } from '@/contexts/SocketContext'
import { formatDistanceToNow } from 'date-fns'

interface DashboardStats {
  totalExpenses: number
  monthlySpending: number
  budgetUtilization: number
  goalProgress: number
  expenseCount: number
  categoriesUsed: number
  avgDailySpending: number
  topCategory: string
  savingsRate: number
  spendingTrend: 'up' | 'down' | 'stable'
}

interface RecentActivity {
  id: string
  type: 'expense' | 'budget' | 'goal' | 'split'
  title: string
  subtitle: string
  amount?: number
  timestamp: string
  status?: string
  icon: React.ComponentType<any>
}

interface QuickInsight {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  action?: string
  priority: number
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4']

export function EnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [quickInsights, setQuickInsights] = useState<QuickInsight[]>([])
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState('overview')
  const { formatCurrency } = useCurrency()
  const { socket, connected } = useSocket()

  useEffect(() => {
    loadDashboardData()
    setupRealTimeUpdates()
  }, [socket, connected])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardStats, activityData, insightsData, chartsData] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentActivity(),
        api.getQuickInsights(),
        api.getDashboardCharts()
      ])

      setStats(dashboardStats.data)
      setRecentActivity(activityData.data || [])
      setQuickInsights(insightsData.data || [])
      setChartData(chartsData.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealTimeUpdates = () => {
    if (socket && connected) {
      socket.on('dashboard:update', (data) => {
        if (data.type === 'stats') {
          setStats(data.stats)
        } else if (data.type === 'activity') {
          setRecentActivity(prev => [data.activity, ...prev.slice(0, 9)])
        } else if (data.type === 'insight') {
          setQuickInsights(prev => [data.insight, ...prev])
        }
        setLastUpdated(new Date())
      })

      socket.on('expense:created', () => {
        loadDashboardData()
      })

      socket.on('budget:updated', () => {
        loadDashboardData()
      })

      return () => {
        socket.off('dashboard:update')
        socket.off('expense:created')
        socket.off('budget:updated')
      }
    }
  }

  const spendingComparison = useMemo(() => {
    if (!chartData?.monthlyComparison) return []
    
    return chartData.monthlyComparison.map((month: any) => ({
      ...month,
      difference: month.current - month.previous,
      percentChange: month.previous > 0 ? ((month.current - month.previous) / month.previous) * 100 : 0
    }))
  }, [chartData])

  const categoryBreakdown = useMemo(() => {
    if (!chartData?.categorySpending) return []
    
    const total = chartData.categorySpending.reduce((sum: number, cat: any) => sum + cat.amount, 0)
    return chartData.categorySpending.map((cat: any) => ({
      ...cat,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0
    }))
  }, [chartData])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-red-500" />
      case 'down': return <ArrowDownRight className="w-4 h-4 text-green-500" />
      default: return <Equal className="w-4 h-4 text-gray-500" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />
      default: return <Brain className="w-5 h-5 text-blue-500" />
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('%') ? `${entry.value.toFixed(1)}%` : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            {connected && <span className="ml-2 text-green-600">• Live</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Insights */}
      {quickInsights.length > 0 && (
        <div className="space-y-3">
          {quickInsights.slice(0, 2).map((insight) => (
            <Alert key={insight.id} className={`${
              insight.type === 'success' ? 'border-green-200 bg-green-50' :
              insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              insight.type === 'error' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              {getInsightIcon(insight.type)}
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{insight.title}</div>
                    <div className="text-sm">{insight.message}</div>
                  </div>
                  {insight.action && (
                    <Button variant="link" size="sm">
                      {insight.action}
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Monthly Spending
            </CardTitle>
            <DollarSign className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.monthlySpending || 0)}
            </div>
            <div className="flex items-center text-xs opacity-75">
              {getTrendIcon(stats?.spendingTrend || 'stable')}
              <span className="ml-1">
                vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Budget Usage
            </CardTitle>
            <Target className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.budgetUtilization?.toFixed(1) || 0}%
            </div>
            <Progress 
              value={stats?.budgetUtilization || 0} 
              className="mt-2 bg-green-200" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Goal Progress
            </CardTitle>
            <Star className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.goalProgress?.toFixed(1) || 0}%
            </div>
            <Progress 
              value={stats?.goalProgress || 0} 
              className="mt-2 bg-purple-200" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Savings Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.savingsRate?.toFixed(1) || 0}%
            </div>
            <div className="text-xs opacity-75">
              of income saved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spending Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Daily spending over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData?.dailySpending || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Activity
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.slice(0, 6).map((activity) => {
                  const IconComponent = activity.icon
                  return (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-full">
                        <IconComponent className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {activity.subtitle}
                        </p>
                      </div>
                      <div className="text-right">
                        {activity.amount && (
                          <p className="text-sm font-medium">
                            {formatCurrency(activity.amount)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {recentActivity.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Spending distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ name, percentage }: any) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {categoryBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
                <CardDescription>Current vs previous month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={spendingComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="previous" fill="#e5e7eb" name="Previous Month" />
                    <Bar dataKey="current" fill="#3b82f6" name="Current Month" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spending Tab */}
        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats?.totalExpenses || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Daily</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats?.avgDailySpending || 0)}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Top Category</p>
                    <p className="text-lg font-bold">
                      {stats?.topCategory || 'N/A'}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Spending Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Spending Analysis</CardTitle>
              <CardDescription>Spending patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData?.weeklySpending || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Weekly Spending"
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    name="Average"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Current budget status across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData?.budgetStatus?.map((budget: any, index: number) => (
                  <div key={budget.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{budget.category}</span>
                      <Badge variant={budget.utilization > 100 ? 'destructive' : budget.utilization > 80 ? 'secondary' : 'default'}>
                        {budget.utilization.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={Math.min(budget.utilization, 100)} />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatCurrency(budget.spent)} spent</span>
                      <span>{formatCurrency(budget.budget)} budget</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Progress towards your financial objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {chartData?.goals?.map((goal: any, index: number) => (
                  <div key={goal.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                      <Badge variant={goal.progress >= 100 ? 'default' : goal.progress >= 80 ? 'secondary' : 'outline'}>
                        {goal.progress.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={Math.min(goal.progress, 100)} />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatCurrency(goal.current)} saved</span>
                      <span>{formatCurrency(goal.target)} target</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col">
              <Plus className="w-6 h-6 mb-2" />
              Add Expense
            </Button>
            <Button variant="outline" className="h-16 flex flex-col">
              <Target className="w-6 h-6 mb-2" />
              Set Budget
            </Button>
            <Button variant="outline" className="h-16 flex flex-col">
              <Star className="w-6 h-6 mb-2" />
              Create Goal
            </Button>
            <Button variant="outline" className="h-16 flex flex-col">
              <Users className="w-6 h-6 mb-2" />
              Split Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}