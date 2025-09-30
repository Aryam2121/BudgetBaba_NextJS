'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import GoalsTracking from '@/components/GoalsTracking'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  Star,
  Rocket,
  CheckCircle2,
  Zap,
  Award,
  Flag,
  DollarSign,
  Lightbulb
} from 'lucide-react'

export default function GoalsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Enhanced Header with gradient background */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-2xl"></div>
          <div className="relative p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Financial Goals
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Transform your dreams into achievable financial milestones
                    </p>
                  </div>
                </div>
                
                {/* Quick Info Cards */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                    <Trophy className="h-4 w-4 mr-2" />
                    Goal Tracking
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Progress Monitoring
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                    <Rocket className="h-4 w-4 mr-2" />
                    Achievement Rewards
                  </Badge>
                </div>
              </div>
              
              {/* Visual elements */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg transform rotate-12">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl shadow-lg transform -rotate-6">
                  <Star className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Types Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Savings Goals</h3>
              <p className="text-sm text-slate-600">Emergency fund, vacation, purchases</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Investment Goals</h3>
              <p className="text-sm text-slate-600">Retirement, stocks, real estate</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Flag className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Debt Payoff</h3>
              <p className="text-sm text-slate-600">Credit cards, loans, mortgages</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Time-based Goals</h3>
              <p className="text-sm text-slate-600">Monthly, quarterly, yearly targets</p>
            </CardContent>
          </Card>
        </div>

        {/* Goal Setting Tips */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-emerald-200 rounded-lg">
                <Lightbulb className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-800 mb-2">🎯 SMART Goal Framework</h3>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <p className="text-emerald-700 text-sm"><strong>S</strong>pecific</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <p className="text-emerald-700 text-sm"><strong>M</strong>easurable</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <p className="text-emerald-700 text-sm"><strong>A</strong>chievable</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <p className="text-emerald-700 text-sm"><strong>R</strong>elevant</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <p className="text-emerald-700 text-sm"><strong>T</strong>ime-bound</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivation Quote */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <blockquote className="text-lg font-medium text-indigo-800 mb-2">
                "A goal without a plan is just a wish."
              </blockquote>
              <p className="text-indigo-600 text-sm">- Antoine de Saint-Exupéry</p>
            </div>
          </CardContent>
        </Card>

        {/* Main Goals Component */}
        <div className="space-y-6">
          <GoalsTracking />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}