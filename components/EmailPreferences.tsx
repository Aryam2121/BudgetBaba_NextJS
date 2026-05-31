"use client"

import { useEffect, useState } from "react"
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
    sendFromPersonalEmail: true,
    preferredProvider: "gmail" as "gmail" | "outlook" | "app",
    splitNotifications: true,
    settlementNotifications: true,
    reminderNotifications: true,
    fallbackToReplyTo: true,
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await api.getEmailStatus()
        if (response.data?.preferences) {
          const prefs = response.data.preferences
          setPreferences({
            sendFromPersonalEmail: prefs.sendFromPersonalEmail ?? true,
            preferredProvider: prefs.preferredProvider || "gmail",
            splitNotifications: prefs.splitNotifications ?? true,
            settlementNotifications: prefs.settlementNotifications ?? true,
            reminderNotifications: prefs.reminderNotifications ?? true,
            fallbackToReplyTo: prefs.fallbackToReplyTo ?? true,
          })
        }
      } catch (error) {
        console.error("Failed to load email preferences:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean | string) => {
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

  if (initialLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Loading email preferences...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Email Preferences</span>
        </CardTitle>
        <CardDescription>Choose which email notifications you&apos;d like to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="split-notifications" className="text-base">
                Split Notifications
              </Label>
              <p className="text-sm text-gray-600">Get notified about shared expense activity</p>
            </div>
            <Switch
              id="split-notifications"
              checked={preferences.splitNotifications}
              onCheckedChange={(checked) => handlePreferenceChange("splitNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="settlement-notifications" className="text-base">
                Settlement Notifications
              </Label>
              <p className="text-sm text-gray-600">Receive alerts when splits are settled</p>
            </div>
            <Switch
              id="settlement-notifications"
              checked={preferences.settlementNotifications}
              onCheckedChange={(checked) => handlePreferenceChange("settlementNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-notifications" className="text-base">
                Reminder Notifications
              </Label>
              <p className="text-sm text-gray-600">Payment reminders for outstanding splits</p>
            </div>
            <Switch
              id="reminder-notifications"
              checked={preferences.reminderNotifications}
              onCheckedChange={(checked) => handlePreferenceChange("reminderNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="personal-email" className="text-base">
                Send From Personal Email
              </Label>
              <p className="text-sm text-gray-600">Use your connected Gmail/Outlook when available</p>
            </div>
            <Switch
              id="personal-email"
              checked={preferences.sendFromPersonalEmail}
              onCheckedChange={(checked) => handlePreferenceChange("sendFromPersonalEmail", checked)}
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
