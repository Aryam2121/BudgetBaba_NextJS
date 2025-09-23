'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import BudgetManagement from '@/components/BudgetManagement'

export default function BudgetPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <BudgetManagement />
      </div>
    </ProtectedRoute>
  )
}
