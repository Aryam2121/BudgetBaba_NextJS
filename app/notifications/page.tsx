'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import NotificationCenter from '@/components/NotificationCenter'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  BellRing,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Zap,
  Mail,
  Smartphone,
  Volume2,
  Eye,
  Filter
} from 'lucide-react'

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Enhanced Header with gradient background */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>
          <div className="relative p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg relative">
                    <Bell className="h-8 w-8 text-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Notification Center
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Stay informed about your financial activities and alerts
                    </p>
                  </div>
                </div>
                
                {/* Quick Info Cards */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    <BellRing className="h-4 w-4 mr-2" />
                    Real-time Alerts
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Smart Filtering
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Instant Updates
                  </Badge>
                </div>
              </div>
              
              {/* Visual elements */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg transform rotate-12">
                  <MessageCircle className="h-12 w-12 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-lg transform -rotate-6">
                  <BellRing className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Types Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Budget Alerts</h3>
              <p className="text-sm text-slate-600">Overspending and limit warnings</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Email Summaries</h3>
              <p className="text-sm text-slate-600">Weekly and monthly reports</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Goal Updates</h3>
              <p className="text-sm text-slate-600">Progress and achievements</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Split Updates</h3>
              <p className="text-sm text-slate-600">Group expense notifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings Preview */}
        <Card className="mb-8 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-slate-200 rounded-lg">
                <Settings className="h-6 w-6 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-2">⚙️ Notification Preferences</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-700 text-sm">Push Notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-700 text-sm">Email Alerts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-700 text-sm">Sound Alerts</span>
                  </div>
                </div>
                <p className="text-slate-600 text-sm mt-2">
                  Customize your notification settings in the settings page to control how and when you receive alerts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Mark All as Read</h3>
              <p className="text-sm text-slate-600">Clear all unread notifications</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Filter className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Filter by Type</h3>
              <p className="text-sm text-slate-600">Show specific notification categories</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-2">Manage Settings</h3>
              <p className="text-sm text-slate-600">Configure notification preferences</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Notifications Component */}
        <div className="space-y-6">
          <NotificationCenter />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}