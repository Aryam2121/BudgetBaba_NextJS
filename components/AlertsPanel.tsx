"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, Target } from "lucide-react"

interface AlertsPanelProps {
  alerts: Array<{
    type: string
    message: string
    severity: "low" | "medium" | "high"
  }>
  className?: string
}

export function AlertsPanel({ alerts, className }: AlertsPanelProps) {
  if (!alerts || alerts.length === 0) {
    return null
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "budget_exceeded":
        return AlertTriangle
      case "budget_warning":
        return AlertTriangle
      case "budget_prediction":
        return TrendingUp
      default:
        return Target
    }
  }

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-orange-200 bg-orange-50"
      case "low":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getTextStyle = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-700"
      case "medium":
        return "text-orange-700"
      case "low":
        return "text-yellow-700"
      default:
        return "text-gray-700"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Budget Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const Icon = getAlertIcon(alert.type)
            return (
              <Alert key={index} className={getAlertStyle(alert.severity)}>
                <Icon className="h-4 w-4" />
                <AlertDescription className={getTextStyle(alert.severity)}>{alert.message}</AlertDescription>
              </Alert>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
