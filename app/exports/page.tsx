'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import ExportDashboard from '@/components/ExportDashboard'

export default function ExportsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <ExportDashboard />
      </div>
    </ProtectedRoute>
  )
}