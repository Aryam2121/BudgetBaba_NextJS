"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  DollarSign, Calendar, Target, PiggyBank, Zap, Brain,
  CheckCircle, XCircle, AlertCircle, ArrowRight, RefreshCw
} from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useToast } from '@/hooks/use-toast'

export default function AIInsights() {
  const { formatAmount } = useCurrency()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)
  const [insights, setInsights] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [opportunities, setOpportunities] = useState<any>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [insightsRes, recommendationsRes, opportunitiesRes] = await Promise.all([
        api.getSpendingInsights({ timeRange }),
        api.getBudgetRecommendationsAI(),
        api.getSavingsOpportunities()
      ])

      if (insightsRes.data?.success) {
        setInsights(insightsRes.data)
      }
      if (recommendationsRes.data?.success) {
        setRecommendations(recommendationsRes.data)
      }
      if (opportunitiesRes.data?.success) {
        setOpportunities(opportunitiesRes.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load AI insights',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    }
    return colors[difficulty as keyof typeof colors] || colors.medium
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Analyzing your spending patterns...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            AI-Powered Insights
          </h2>
          <p className="text-muted-foreground mt-1">
            Smart recommendations and spending analysis powered by AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 7 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(7)}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === 30 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === 90 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatAmount(insights?.summary?.totalSpent || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">{formatAmount(insights?.summary?.dailyAverage || 0)}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projected Monthly</p>
                <p className="text-2xl font-bold">{formatAmount(insights?.summary?.projectedMonthly || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(opportunities?.totalPotentialSavings || 0)}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts ({insights?.insights?.alerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Anomalies ({insights?.insights?.anomalies?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            Savings
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Budget Alerts & Warnings
              </CardTitle>
              <CardDescription>
                Important alerts about your spending and budget status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights?.insights?.alerts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p>No budget alerts! You're doing great! 🎉</p>
                </div>
              ) : (
                insights?.insights?.alerts?.map((alert: any, index: number) => (
                  <Alert key={index} className={getSeverityColor(alert.severity)}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{alert.category}</p>
                          <p className="text-sm mt-1">{alert.message}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {alert.type}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>

          {/* Trends */}
          {insights?.insights?.trends?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Spending Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.insights.trends.map((trend: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    {trend.type === 'increasing' ? (
                      <TrendingUp className="h-5 w-5 text-red-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{trend.message}</p>
                    </div>
                    <Badge variant={trend.type === 'increasing' ? 'destructive' : 'default'}>
                      {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Smart Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions to improve your financial health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights?.insights?.recommendations?.map((rec: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      {rec.category || 'General Advice'}
                    </h4>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.message}</p>
                  {rec.potentialSavings && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-medium">
                      <PiggyBank className="h-4 w-4" />
                      Potential savings: {formatAmount(rec.potentialSavings)}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Budget Recommendations */}
          {recommendations?.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Budget Recommendations
                </CardTitle>
                <CardDescription>
                  Based on your last {recommendations.basedOnMonths} month(s) of spending
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.recommendations.slice(0, 5).map((rec: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{rec.category}</p>
                        <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatAmount(rec.recommendedBudget)}</p>
                        <p className="text-xs text-muted-foreground">
                          Avg: {formatAmount(rec.historicalAverage)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">Total Recommended Budget</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatAmount(recommendations.totalRecommendedBudget)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Unusual Spending Detected
              </CardTitle>
              <CardDescription>
                AI has detected these anomalies in your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights?.insights?.anomalies?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p>No unusual spending detected. Your patterns look normal!</p>
                </div>
              ) : (
                insights?.insights?.anomalies?.map((anomaly: any, index: number) => (
                  <Alert key={index} className={getSeverityColor(anomaly.severity)}>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{anomaly.category}</p>
                          <p className="text-sm mt-1">{anomaly.message}</p>
                          {anomaly.average && (
                            <p className="text-xs mt-2">
                              Recent: {formatAmount(anomaly.amount)} | Average: {formatAmount(anomaly.average)}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {anomaly.type?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings Tab */}
        <TabsContent value="savings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-green-600" />
                Savings Opportunities
              </CardTitle>
              <CardDescription>
                Discover ways to save money based on your spending habits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">Total Potential Savings</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatAmount(opportunities?.totalPotentialSavings || 0)}/month
                </p>
              </div>

              <div className="space-y-4">
                {opportunities?.opportunities?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p>You're already optimizing your spending well!</p>
                  </div>
                ) : (
                  opportunities?.opportunities?.map((opp: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{opp.title}</h4>
                          <Badge className={getDifficultyBadge(opp.difficulty)}>
                            {opp.difficulty}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Save up to</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatAmount(opp.potentialSavings)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{opp.description}</p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Learn More <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
