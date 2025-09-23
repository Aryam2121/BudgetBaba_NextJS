'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import RecurringTransactions from '@/components/RecurringTransactions'

export default function RecurringPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <RecurringTransactions />
      </div>
    </ProtectedRoute>
  )
}