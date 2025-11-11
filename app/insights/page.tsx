"use client"

import React from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import AIInsights from '@/components/AIInsights'

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AIInsights />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
