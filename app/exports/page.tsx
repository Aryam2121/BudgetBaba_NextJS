'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import ExportDashboard from '@/components/ExportDashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  FileText,
  File,
  Table,
  PieChart,
  Calendar,
  Filter,
  Cloud,
  Archive,
  Share2,
  Mail,
  Clock,
  CheckCircle2,
  Zap,
  Database
} from 'lucide-react'

export default function ExportsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Enhanced Header with gradient background */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl"></div>
          <div className="relative p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <Download className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Data Export Center
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Export, backup, and share your financial data in multiple formats
                    </p>
                  </div>
                </div>
                
                {/* Quick Info Cards */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                    <Download className="h-4 w-4 mr-2" />
                    Multiple Formats
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    <Filter className="h-4 w-4 mr-2" />
                    Custom Filters
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Instant Export
                  </Badge>
                </div>
              </div>
              
              {/* Visual elements */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg transform rotate-12">
                  <FileText className="h-12 w-12 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl shadow-lg transform -rotate-6">
                  <Table className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Format Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">PDF Reports</h3>
              <p className="text-sm text-slate-600">Professional formatted reports</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Table className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Excel/CSV</h3>
              <p className="text-sm text-slate-600">Spreadsheet-ready data</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">JSON Data</h3>
              <p className="text-sm text-slate-600">Raw data for developers</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <PieChart className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Visual Reports</h3>
              <p className="text-sm text-slate-600">Charts and graphs included</p>
            </CardContent>
          </Card>
        </div>

        {/* Export Features */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Cloud className="h-6 w-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800 mb-2">🚀 Export Features</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 text-sm">Date Range Filtering</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 text-sm">Category Selection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 text-sm">Custom Fields</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 text-sm">Scheduled Exports</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Clock className="h-8 w-8 text-orange-600" />
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Scheduled Exports</h3>
              <p className="text-sm text-slate-600">Automatic weekly/monthly exports</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Share2 className="h-8 w-8 text-teal-600" />
                <Mail className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Email Reports</h3>
              <p className="text-sm text-slate-600">Send directly to your inbox</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Archive className="h-8 w-8 text-indigo-600" />
                <Cloud className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Cloud Backup</h3>
              <p className="text-sm text-slate-600">Secure cloud storage integration</p>
            </CardContent>
          </Card>
        </div>

        {/* Export Tips */}
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-amber-800 mb-2">📋 Export Best Practices</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-amber-700 text-sm">• Use PDF for presentations and reports</p>
                <p className="text-amber-700 text-sm">• CSV/Excel for data analysis and accounting software</p>
              </div>
              <div className="space-y-2">
                <p className="text-amber-700 text-sm">• Schedule monthly exports for record keeping</p>
                <p className="text-amber-700 text-sm">• Include charts for better data visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Export Component */}
        <div className="space-y-6">
          <ExportDashboard />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}