'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Calendar,
  AlertCircle
} from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Enhanced Header with gradient background */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>
          <div className="relative p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Analytics Dashboard
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Comprehensive insights into your financial patterns and trends
                    </p>
                  </div>
                </div>
                
                {/* Quick Info Cards */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                    <Activity className="h-4 w-4 mr-2" />
                    Real-time Data
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    <Target className="h-4 w-4 mr-2" />
                    Smart Insights
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                    <Zap className="h-4 w-4 mr-2" />
                    AI-Powered
                  </Badge>
                </div>
              </div>
              
              {/* Visual elements */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg transform rotate-12">
                  <PieChart className="h-12 w-12 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl shadow-lg transform -rotate-6">
                  <TrendingUp className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Expense Trends</h3>
              <p className="text-sm text-slate-600">Track spending patterns over time with interactive charts</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <PieChart className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Category Analysis</h3>
              <p className="text-sm text-slate-600">Detailed breakdown of spending by categories</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Budget Performance</h3>
              <p className="text-sm text-slate-600">Monitor budget utilization and savings goals</p>
            </CardContent>
          </Card>
        </div>

        {/* Pro Tip */}
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-amber-200 rounded-lg">
                <AlertCircle className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">💡 Pro Tip</h3>
                <p className="text-amber-700">
                  Use the time range selector to compare different periods and identify spending patterns. 
                  The AI insights will help you optimize your budget based on historical data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Analytics Component */}
        <div className="space-y-6">
          <AnalyticsDashboard />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}