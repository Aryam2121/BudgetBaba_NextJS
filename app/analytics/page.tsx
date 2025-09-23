'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <AnalyticsDashboard />
      </div>
    </ProtectedRoute>
  )
}