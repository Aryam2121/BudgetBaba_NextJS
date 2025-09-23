'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import NotificationCenter from '@/components/NotificationCenter'

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <NotificationCenter />
      </div>
    </ProtectedRoute>
  )
}