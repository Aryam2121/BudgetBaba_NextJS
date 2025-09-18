"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Mail } from "lucide-react"

interface EmailPreferencesProps {
  className?: string
}

export function EmailPreferences({ className }: EmailPreferencesProps) {
  const [preferences, setPreferences] = useState({
    expenseNotifications: true,
    budgetAlerts: true,
    weeklySummary: true,
    monthlyReport: false,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await api.updateEmailPreferences(preferences)

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success!",
        description: "Email preferences updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Email Preferences</span>
        </CardTitle>
        <CardDescription>Choose which email notifications you'd like to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="expense-notifications" className="text-base">
                Expense Notifications
              </Label>
              <p className="text-sm text-gray-600">Get notified when you add a new expense</p>
            </div>
            <Switch
              id="expense-notifications"
              checked={preferences.expenseNotifications}
              onCheckedChange={(checked) => handlePreferenceChange("expenseNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="budget-alerts" className="text-base">
                Budget Alerts
              </Label>
              <p className="text-sm text-gray-600">Receive alerts when approaching or exceeding budget limits</p>
            </div>
            <Switch
              id="budget-alerts"
              checked={preferences.budgetAlerts}
              onCheckedChange={(checked) => handlePreferenceChange("budgetAlerts", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-summary" className="text-base">
                Weekly Summary
              </Label>
              <p className="text-sm text-gray-600">Get a weekly breakdown of your spending patterns</p>
            </div>
            <Switch
              id="weekly-summary"
              checked={preferences.weeklySummary}
              onCheckedChange={(checked) => handlePreferenceChange("weeklySummary", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="monthly-report" className="text-base">
                Monthly Report
              </Label>
              <p className="text-sm text-gray-600">Detailed monthly spending analysis and insights</p>
            </div>
            <Switch
              id="monthly-report"
              checked={preferences.monthlyReport}
              onCheckedChange={(checked) => handlePreferenceChange("monthlyReport", checked)}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}
