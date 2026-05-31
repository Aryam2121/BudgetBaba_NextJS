"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Area, AreaChart
} from 'recharts'
import {
  Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  DollarSign, Calendar, Zap, Brain, Star, Award, Lightbulb,
  ArrowUp, ArrowDown, Equal, RefreshCw, Settings, Filter
} from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrency } from '@/hooks/useCurrency'

interface BudgetInsight {
  id: string
  type: 'success' | 'warning' | 'danger' | 'info'
  title: string
  message: string
  action?: string
  data?: any
  severity: number
  category?: string
}

interface BudgetHealth {
  score: number
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  trends: {
    spending: 'up' | 'down' | 'stable'
    saving: 'up' | 'down' | 'stable'
    efficiency: 'up' | 'down' | 'stable'
  }
  recommendations: string[]
}

interface SmartRecommendation {
  id: string
  type: 'optimization' | 'alert' | 'opportunity' | 'achievement'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: number
  effort: number
  category: string
  actionable: boolean
  estimatedSavings?: number
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899']

export function SmartBudgetInsights() {
  const [insights, setInsights] = useState<BudgetInsight[]>([])
  const [budgetHealth, setBudgetHealth] = useState<BudgetHealth | null>(null)
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [budgetData, setBudgetData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)
  const [activeTab, setActiveTab] = useState('overview')
  const { formatCurrency } = useCurrency()

  useEffect(() => {
    loadBudgetInsights()
  }, [timeRange])

  const loadBudgetInsights = async () => {
    try {
      setLoading(true)
      const [insightsData, healthData, recommendationsData, budgetResponse] = await Promise.all([
        api.getBudgetInsights({ timeRange }),
        api.getBudgetHealth({ timeRange }),
        api.getSmartRecommendations({ timeRange }),
        api.getBudgets()
      ])

      setInsights(insightsData.data || [])
      setBudgetHealth(healthData.data)
      setRecommendations(recommendationsData.data || [])
      setBudgetData(budgetResponse.data)
    } catch (error) {
      console.error('Failed to load budget insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const budgetPerformance = useMemo(() => {
    if (!budgetData?.data) return []
    
    return budgetData.data.map((budget: any) => {
      const utilizationRate = budget.budget > 0 ? (budget.spent / budget.budget) * 100 : 0
      const remaining = budget.budget - budget.spent
      const status = utilizationRate > 100 ? 'over' : utilizationRate > 80 ? 'warning' : 'good'
      
      return {
        ...budget,
        utilizationRate,
        remaining,
        status,
        efficiency: utilizationRate > 0 ? Math.min(100, (100 - Math.abs(80 - utilizationRate)) / 20 * 100) : 0
      }
    })
  }, [budgetData])

  const categoryInsights = useMemo(() => {
    if (!budgetPerformance.length) return []
    
    return budgetPerformance.map(budget => ({
      category: budget.category,
      spent: budget.spent,
      budget: budget.budget,
      utilization: budget.utilizationRate,
      performance: budget.efficiency,
      trend: Math.random() > 0.5 ? 'up' : 'down' // In real app, this would come from API
    }))
  }, [budgetPerformance])

  const spendingTrends = useMemo(() => {
    // Mock data - in real app, this would come from API
    const days = Array.from({ length: timeRange }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (timeRange - 1 - i))
      return {
        date: date.toISOString().split('T')[0],
        spent: Math.random() * 500 + 100,
        budget: 300 + Math.random() * 200,
        efficiency: 60 + Math.random() * 40
      }
    })
    return days
  }, [timeRange])

  const getHealthGradeColor = (grade: string) => {
    const colors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    }
    return colors[grade as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />
      default: return <Equal className="w-4 h-4 text-gray-600" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'danger': return <AlertTriangle className="w-5 h-5 text-red-600" />
      default: return <Lightbulb className="w-5 h-5 text-blue-600" />
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Rate') || entry.name.includes('Efficiency') 
                ? `${entry.value.toFixed(1)}%` 
                : formatCurrency(entry.value)}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-blue-600" />
            Smart Budget Insights
          </h2>
          <p className="text-gray-600">AI-powered budget analysis and recommendations</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(days)}
            >
              {days}D
            </Button>
          ))}
        </div>
      </div>

      {/* Budget Health Score */}
      {budgetHealth && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Budget Health Score
              </span>
              <Badge className={`text-lg px-3 py-1 ${getHealthGradeColor(budgetHealth.grade)}`}>
                {budgetHealth.grade}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {budgetHealth.score}
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              
              <div className="flex-1">
                <Progress value={budgetHealth.score} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  {getTrendIcon(budgetHealth.trends.spending)}
                  <span className="text-xs text-gray-600 mt-1">Spending</span>
                </div>
                <div className="flex flex-col items-center">
                  {getTrendIcon(budgetHealth.trends.saving)}
                  <span className="text-xs text-gray-600 mt-1">Saving</span>
                </div>
                <div className="flex flex-col items-center">
                  {getTrendIcon(budgetHealth.trends.efficiency)}
                  <span className="text-xs text-gray-600 mt-1">Efficiency</span>
                </div>
              </div>
            </div>

            {budgetHealth.recommendations.length > 0 && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Top Recommendations</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {budgetHealth.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insights Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget vs Spending */}
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Spending</CardTitle>
                <CardDescription>Current month comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryInsights}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="budget" fill="#e5e7eb" name="Budget" />
                    <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Utilization</CardTitle>
                <CardDescription>Percentage of budget used by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryInsights}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="utilization"
                      label={({ category, utilization }) => 
                        `${category}: ${utilization.toFixed(1)}%`
                      }
                    >
                      {categoryInsights.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(budgetPerformance.reduce((sum, b) => sum + b.budget, 0))}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(budgetPerformance.reduce((sum, b) => sum + b.spent, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(budgetPerformance.reduce((sum, b) => sum + b.remaining, 0))}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Efficiency</p>
                    <p className="text-2xl font-bold">
                      {budgetPerformance.length > 0 
                        ? (budgetPerformance.reduce((sum, b) => sum + b.efficiency, 0) / budgetPerformance.length).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={categoryInsights}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="performance"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Utilization"
                      dataKey="utilization"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetPerformance.slice(0, 5).map((budget, index) => (
                  <div key={budget.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{budget.category}</span>
                      <Badge variant={budget.status === 'over' ? 'destructive' : budget.status === 'warning' ? 'secondary' : 'default'}>
                        {budget.utilizationRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={Math.min(budget.utilizationRate, 100)} />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatCurrency(budget.spent)} spent</span>
                      <span>{formatCurrency(budget.budget)} budget</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Daily spending vs budget over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={spendingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="budget"
                    fill="#e5e7eb"
                    stroke="#6b7280"
                    name="Daily Budget"
                  />
                  <Bar yAxisId="left" dataKey="spent" fill="#3b82f6" name="Daily Spent" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="Efficiency %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.id} className={`border-l-4 ${
                  rec.priority === 'high' ? 'border-red-500' :
                  rec.priority === 'medium' ? 'border-yellow-500' :
                  'border-green-500'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {rec.type === 'optimization' && <Zap className="w-5 h-5 text-yellow-500" />}
                        {rec.type === 'alert' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {rec.type === 'opportunity' && <Star className="w-5 h-5 text-blue-500" />}
                        {rec.type === 'achievement' && <Award className="w-5 h-5 text-green-500" />}
                        {rec.title}
                      </span>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'default'}>
                        {rec.priority}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Impact</span>
                        <Progress value={rec.impact} className="mt-1" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Effort</span>
                        <Progress value={rec.effort} className="mt-1" />
                      </div>
                    </div>

                    {rec.estimatedSavings && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <span className="text-sm text-green-700">
                          Estimated Monthly Savings: {formatCurrency(rec.estimatedSavings)}
                        </span>
                      </div>
                    )}

                    {rec.actionable && (
                      <Button className="w-full mt-4">
                        Take Action
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
                <p className="text-gray-600">
                  Keep tracking your expenses for a few more days to get personalized AI recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Alert key={insight.id} className={`border-l-4 ${
                  insight.type === 'success' ? 'border-green-500 bg-green-50' :
                  insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  insight.type === 'danger' ? 'border-red-500 bg-red-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  {getInsightIcon(insight.type)}
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{insight.title}</div>
                        <div className="text-sm mt-1">{insight.message}</div>
                        {insight.category && (
                          <Badge variant="outline" className="mt-2">
                            {insight.category}
                          </Badge>
                        )}
                      </div>
                      {insight.action && (
                        <Button variant="link" size="sm" className="ml-4">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
                <p className="text-gray-600">
                  Continue using the app to generate meaningful budget insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}