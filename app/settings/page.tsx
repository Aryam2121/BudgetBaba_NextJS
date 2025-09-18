"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { EmailConnectionManager } from "@/components/EmailConnectionManager"
import { EmailPreferences } from "@/components/EmailPreferences"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl space-y-8">
          <h1 className="text-3xl font-bold mb-4">Settings</h1>
          <EmailConnectionManager />
          <EmailPreferences />
        </div>
      </div>
    </ProtectedRoute>
  )
}
