'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import BudgetManagement from '@/components/BudgetManagement'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Target,
  TrendingUp,
  PiggyBank,
  CreditCard,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Zap,
  Calendar,
  Award
} from 'lucide-react'
import Link from 'next/link'

export default function BudgetPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Enhanced Header with gradient background */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl"></div>
          <div className="relative p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Budget Management
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Take control of your finances with smart budgeting tools
                    </p>
                  </div>
                </div>
                
                {/* Quick Info Cards */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Smart Tracking
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    <Target className="h-4 w-4 mr-2" />
                    Goal-Oriented
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Auto-Alerts
                  </Badge>
                </div>
              </div>
              
              {/* Visual elements and action button */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg transform rotate-12">
                  <PiggyBank className="h-12 w-12 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg transform -rotate-6">
                  <DollarSign className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Set Budget Goals</h3>
              <p className="text-sm text-slate-600">Create category-wise spending limits</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Track Progress</h3>
              <p className="text-sm text-slate-600">Monitor spending against budgets</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Smart Alerts</h3>
              <p className="text-sm text-slate-600">Get notified before overspending</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Achieve Goals</h3>
              <p className="text-sm text-slate-600">Celebrate budget milestones</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Tips */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-200 rounded-lg">
                <PiggyBank className="h-6 w-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-2">💰 Budget Success Tips</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <p className="text-blue-700 text-sm">• Start with the 50/30/20 rule: 50% needs, 30% wants, 20% savings</p>
                  <p className="text-blue-700 text-sm">• Review and adjust budgets monthly based on spending patterns</p>
                  <p className="text-blue-700 text-sm">• Set realistic goals to avoid budget fatigue</p>
                  <p className="text-blue-700 text-sm">• Use envelope method for discretionary spending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Budget Component */}
        <div className="space-y-6">
          <BudgetManagement />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
