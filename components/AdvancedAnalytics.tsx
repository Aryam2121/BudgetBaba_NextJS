"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Scatter, ScatterChart, RadialBarChart, RadialBar
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, Target,
  Calendar, Award, AlertTriangle, Lightbulb, Brain, Zap,
  ArrowUpRight, ArrowDownRight, Equal, RefreshCw
} from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrency } from '@/hooks/useCurrency'

interface AdvancedAnalyticsProps {
  userId?: string
  className?: string
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export function AdvancedAnalytics({ userId, className }: AdvancedAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState(30)
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [analytics, insightsData, predictionsData] = await Promise.all([
        api.getAdvancedAnalytics({ timeRange }),
        api.getSpendingInsights({ timeRange }),
        api.getSpendingPredictions({ timeRange })
      ])

      setAnalyticsData(analytics.data)
      setInsights(insightsData.data || [])
      setPredictions(predictionsData.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const spendingVelocity = useMemo(() => {
    if (!analyticsData?.dailySpending) return []
    
    return analyticsData.dailySpending.map((day: any, index: number) => {
      const previousDay = index > 0 ? analyticsData.dailySpending[index - 1] : day
      const velocity = day.amount - previousDay.amount
      
      return {
        ...day,
        velocity,
        velocityPercent: previousDay.amount > 0 ? (velocity / previousDay.amount) * 100 : 0
      }
    })
  }, [analyticsData])

  const categoryEfficiency = useMemo(() => {
    if (!analyticsData?.categories) return []
    
    return analyticsData.categories.map((cat: any) => ({
      ...cat,
      efficiency: cat.budget > 0 ? ((cat.budget - cat.spent) / cat.budget) * 100 : 0,
      utilizationRate: cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0
    }))
  }, [analyticsData])

  const aiInsights = useMemo(() => {
    if (!analyticsData) return []
    
    const insights = []
    
    // Spending pattern insights
    const totalSpent = analyticsData.totalSpent || 0
    const avgDaily = totalSpent / timeRange
    
    if (avgDaily > analyticsData.previousPeriodAvg * 1.2) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Increased Spending Detected',
        message: `Your daily spending has increased by ${((avgDaily / analyticsData.previousPeriodAvg - 1) * 100).toFixed(1)}% compared to the previous period.`,
        action: 'Review your recent expenses'
      })
    }
    
    // Budget insights
    const overBudgetCategories = categoryEfficiency.filter(cat => cat.utilizationRate > 100)
    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'error',
        icon: Target,
        title: 'Budget Exceeded',
        message: `You've exceeded budgets in ${overBudgetCategories.length} categories.`,
        action: 'Adjust your budgets or spending habits'
      })
    }
    
    // Positive insights
    const underBudgetCategories = categoryEfficiency.filter(cat => cat.utilizationRate < 80)
    if (underBudgetCategories.length > 0) {
      insights.push({
        type: 'success',
        icon: Award,
        title: 'Great Budget Management',
        message: `You're under budget in ${underBudgetCategories.length} categories!`,
        action: 'Consider reallocating unused budget'
      })
    }
    
    return insights
  }, [analyticsData, categoryEfficiency, timeRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
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
    <div className={`space-y-6 ${className}`}>
      {/* Header with Time Range Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">AI-powered insights and spending analysis</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90, 365].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(days)}
            >
              {days === 365 ? '1Y' : `${days}D`}
            </Button>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiInsights.map((insight, index) => (
            <Alert key={index} className={`border-l-4 ${
              insight.type === 'error' ? 'border-red-500 bg-red-50' :
              insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-green-500 bg-green-50'
            }`}>
              <insight.icon className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">{insight.title}</div>
                <div className="text-sm">{insight.message}</div>
                <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                  {insight.action}
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analyticsData?.totalSpent || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.spendingChange > 0 ? '+' : ''}
                  {analyticsData?.spendingChange?.toFixed(1)}% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Daily</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency((analyticsData?.totalSpent || 0) / timeRange)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Daily spending average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.budgetUsage?.toFixed(1)}%
                </div>
                <Progress value={analyticsData?.budgetUsage || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.efficiencyScore || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  AI-calculated score
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Spending Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
              <CardDescription>Daily spending with trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={spendingVelocity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    stroke="#3b82f6"
                    name="Daily Spending"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="velocity"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Spending Velocity"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription>Spending patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Trends</CardTitle>
                <CardDescription>Top categories over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.categoryTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {analyticsData?.topCategories?.slice(0, 4).map((category: string, index: number) => (
                      <Line
                        key={category}
                        type="monotone"
                        dataKey={category}
                        stroke={COLORS[index]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.categories || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(analyticsData?.categories || []).map((entry: any, index: number) => (
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
                <CardTitle>Category Efficiency</CardTitle>
                <CardDescription>Budget vs. actual spending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryEfficiency.slice(0, 6).map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <Badge variant={category.efficiency > 0 ? "default" : "destructive"}>
                        {category.efficiency.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={Math.min(category.utilizationRate, 100)} />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatCurrency(category.spent)}</span>
                      <span>{formatCurrency(category.budget)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          {predictions && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Spending Forecast
                  </CardTitle>
                  <CardDescription>AI-powered predictions for next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={predictions.forecast || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#8b5cf6"
                        strokeDasharray="5 5"
                        name="Predicted"
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence_upper"
                        stroke="#d1d5db"
                        strokeDasharray="2 2"
                        name="Upper Bound"
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence_lower"
                        stroke="#d1d5db"
                        strokeDasharray="2 2"
                        name="Lower Bound"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Alerts</CardTitle>
                  <CardDescription>Predicted budget overruns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {predictions.alerts?.map((alert: any, index: number) => (
                    <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{alert.category}</div>
                        <div className="text-sm">{alert.message}</div>
                        <div className="text-xs mt-1">
                          Confidence: {(alert.confidence * 100).toFixed(0)}%
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Efficiency Score</CardTitle>
                <CardDescription>How well you manage your money</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    data={[
                      {
                        name: 'Efficiency',
                        value: analyticsData?.efficiencyScore || 0,
                        fill: '#3b82f6'
                      }
                    ]}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-3xl font-bold"
                    >
                      {analyticsData?.efficiencyScore || 0}
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
                <CardDescription>Detailed efficiency breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData?.efficiencyMetrics?.map((metric: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-gray-600">{metric.description}</div>
                    </div>
                    <Badge variant={metric.score > 70 ? "default" : metric.score > 40 ? "secondary" : "destructive"}>
                      {metric.score}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavioral Tab */}
        <TabsContent value="behavioral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Patterns</CardTitle>
                <CardDescription>When you spend the most</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.spendingPatterns?.hourly || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Behavioral Insights</CardTitle>
                <CardDescription>AI-generated behavior analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.slice(0, 5).map((insight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-sm text-gray-600">{insight.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}