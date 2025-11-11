"use client"

import React from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AIReceiptScanner } from '@/components/AIReceiptScanner'

export default function ReceiptsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AIReceiptScanner />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
