"use client"

import { DashboardLayout } from '@/components/DashboardLayout'
import CategoryManagement from '@/components/CategoryManagement'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CategoryManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
