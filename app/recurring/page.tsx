'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import RecurringTransactions from '@/components/RecurringTransactions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  RotateCcw,
  Calendar,
  Clock,
  Repeat,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  AlertCircle,
  Zap,
  CreditCard,
  DollarSign,
  TrendingUp,
  Settings
} from 'lucide-react'

export default function RecurringPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Enhanced Header with gradient background */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 rounded-2xl"></div>
          <div className="relative p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                    <RotateCcw className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Recurring Transactions
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Automate and manage your repeating income and expenses
                    </p>
                  </div>
                </div>
                
                {/* Quick Info Cards */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 px-3 py-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Auto-Processing
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Smart Scheduling
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Never Miss a Payment
                  </Badge>
                </div>
              </div>
              
              {/* Visual elements */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg transform rotate-12">
                  <Calendar className="h-12 w-12 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg transform -rotate-6">
                  <Repeat className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Types Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Income</h3>
              <p className="text-sm text-slate-600">Salary, freelance, investments</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Bills & Utilities</h3>
              <p className="text-sm text-slate-600">Rent, electricity, internet</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Subscriptions</h3>
              <p className="text-sm text-slate-600">Netflix, Spotify, gym memberships</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Repeat className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Custom Schedule</h3>
              <p className="text-sm text-slate-600">Flexible recurring patterns</p>
            </CardContent>
          </Card>
        </div>

        {/* Frequency Options */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-indigo-200 rounded-lg">
                <Clock className="h-6 w-6 text-indigo-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-800 mb-2">⏰ Scheduling Options</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-indigo-700 text-sm">Daily</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-indigo-700 text-sm">Weekly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-indigo-700 text-sm">Bi-weekly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-indigo-700 text-sm">Monthly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-indigo-700 text-sm">Quarterly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-indigo-700 text-sm">Semi-annually</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-indigo-700 text-sm">Annually</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-indigo-700 text-sm">Custom</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Control Options */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <PlayCircle className="h-8 w-8 text-green-600" />
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Active Transactions</h3>
              <p className="text-sm text-slate-600">Currently processing automatically</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <PauseCircle className="h-8 w-8 text-orange-600" />
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Paused Transactions</h3>
              <p className="text-sm text-slate-600">Temporarily disabled scheduling</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Settings className="h-8 w-8 text-blue-600" />
                <Calendar className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Schedule Management</h3>
              <p className="text-sm text-slate-600">Modify timing and frequency</p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-teal-800 mb-2">✨ Benefits of Automation</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <CheckCircle2 className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-teal-700">Never miss payments</p>
              </div>
              <div className="text-center">
                <Clock className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-teal-700">Save time</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-teal-700">Better budgeting</p>
              </div>
              <div className="text-center">
                <DollarSign className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-teal-700">Avoid late fees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Recurring Transactions Component */}
        <div className="space-y-6">
          <RecurringTransactions />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}