"use client"

import { DashboardLayout } from '@/components/DashboardLayout'
import SubscriptionTracker from '@/components/SubscriptionTracker'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function SubscriptionsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SubscriptionTracker />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
