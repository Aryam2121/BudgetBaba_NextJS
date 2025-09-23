'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import GoalsTracking from '@/components/GoalsTracking'

export default function GoalsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <GoalsTracking />
      </div>
    </ProtectedRoute>
  )
}