"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { EmailPreferences } from '@/components/EmailPreferences'
import { EmailStatusIndicator } from '@/components/EmailStatusIndicator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Mail,
  Settings,
  Bell,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  TestTube,
  RefreshCw,
  Eye,
  Download,
  Upload,
  Zap
} from 'lucide-react'

interface EmailSettings {
  notifications: {
    dailySummary: boolean
    weeklySummary: boolean
    monthlySummary: boolean
    expenseAlerts: boolean
    budgetAlerts: boolean
    splitAlerts: boolean
    largeExpenseAlert: boolean
    unusualSpendingAlert: boolean
  }
  alertThresholds: {
    largeExpenseAmount: number
    budgetWarningPercentage: number
    unusualSpendingPercentage: number
  }
  schedule: {
    dailySummaryTime: string
    weeklySummaryDay: string
    monthlySummaryDay: number
  }
  emailConfig: {
    fromEmail: string
    replyToEmail: string
    emailProvider: string
    smtpHost: string
    smtpPort: number
    useSSL: boolean
    emailSignature: string
  }
  preferences: {
    emailFormat: 'html' | 'text'
    includeCharts: boolean
    includeTransactionDetails: boolean
    groupNotifications: boolean
    receivePromotional: boolean
  }
}

export default function EmailSettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastEmailSent, setLastEmailSent] = useState<Date | null>(null)
  const [settings, setSettings] = useState<EmailSettings>({
    notifications: {
      dailySummary: false,
      weeklySummary: true,
      monthlySummary: true,
      expenseAlerts: true,
      budgetAlerts: true,
      splitAlerts: true,
      largeExpenseAlert: true,
      unusualSpendingAlert: false
    },
    alertThresholds: {
      largeExpenseAmount: 100,
      budgetWarningPercentage: 80,
      unusualSpendingPercentage: 150
    },
    schedule: {
      dailySummaryTime: '09:00',
      weeklySummaryDay: 'monday',
      monthlySummaryDay: 1
    },
    emailConfig: {
      fromEmail: '',
      replyToEmail: '',
      emailProvider: 'gmail',
      smtpHost: '',
      smtpPort: 587,
      useSSL: true,
      emailSignature: ''
    },
    preferences: {
      emailFormat: 'html',
      includeCharts: true,
      includeTransactionDetails: true,
      groupNotifications: true,
      receivePromotional: false
    }
  })

  useEffect(() => {
    if (user) {
      loadEmailSettings()
    }
  }, [user])

  const loadEmailSettings = async () => {
    try {
      setLoading(true)
      
      // Simulate loading email settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Set default email for user
      setSettings(prev => ({
        ...prev,
        emailConfig: {
          ...prev.emailConfig,
          fromEmail: user?.email || '',
          replyToEmail: user?.email || ''
        }
      }))
      
      // Simulate email status check
      setEmailStatus('connected')
      setLastEmailSent(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Yesterday
      
    } catch (error) {
      console.error('Error loading email settings:', error)
      toast.error('Failed to load email settings')
      setEmailStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Email settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save email settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      setTesting(true)
      
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setLastEmailSent(new Date())
      toast.success('Test email sent successfully! Check your inbox.')
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('Failed to send test email')
    } finally {
      setTesting(false)
    }
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string)
            setSettings(importedSettings)
            toast.success('Email settings imported successfully')
          } catch (error) {
            toast.error('Invalid settings file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'email-settings.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Settings exported successfully')
  }

  const updateNotificationSetting = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const updateThreshold = (key: keyof typeof settings.alertThresholds, value: number) => {
    setSettings(prev => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [key]: value
      }
    }))
  }

  const updateSchedule = (key: keyof typeof settings.schedule, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [key]: value
      }
    }))
  }

  const updateEmailConfig = (key: keyof typeof settings.emailConfig, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      emailConfig: {
        ...prev.emailConfig,
        [key]: value
      }
    }))
  }

  const updatePreference = (key: keyof typeof settings.preferences, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Email Settings</h1>
              <p className="text-slate-600 mt-1">
                Configure email notifications and preferences
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <EmailStatusIndicator />
              <Button variant="outline" onClick={handleImportSettings}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={handleExportSettings}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </div>

          {/* Status Card */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    emailStatus === 'connected' ? 'bg-green-100 text-green-600' :
                    emailStatus === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {emailStatus === 'connected' ? <CheckCircle2 className="h-6 w-6" /> :
                     emailStatus === 'error' ? <XCircle className="h-6 w-6" /> :
                     <AlertTriangle className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Email Service Status
                    </h3>
                    <p className="text-sm text-slate-600">
                      {emailStatus === 'connected' && 'Email service is working properly'}
                      {emailStatus === 'error' && 'Email service has encountered an error'}
                      {emailStatus === 'disconnected' && 'Email service is not configured'}
                    </p>
                    {lastEmailSent && (
                      <p className="text-xs text-slate-500 mt-1">
                        Last email sent: {lastEmailSent.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={handleTestEmail}
                  disabled={testing || emailStatus === 'error'}
                  variant="outline"
                >
                  {testing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Summary Notifications */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Summary Reports
                    </CardTitle>
                    <CardDescription>
                      Automated expense summaries and reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="daily-summary">Daily Summary</Label>
                        <p className="text-xs text-slate-500">Daily expense overview</p>
                      </div>
                      <Switch
                        id="daily-summary"
                        checked={settings.notifications.dailySummary}
                        onCheckedChange={(checked) => updateNotificationSetting('dailySummary', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weekly-summary">Weekly Summary</Label>
                        <p className="text-xs text-slate-500">Weekly spending analysis</p>
                      </div>
                      <Switch
                        id="weekly-summary"
                        checked={settings.notifications.weeklySummary}
                        onCheckedChange={(checked) => updateNotificationSetting('weeklySummary', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="monthly-summary">Monthly Summary</Label>
                        <p className="text-xs text-slate-500">Complete monthly report</p>
                      </div>
                      <Switch
                        id="monthly-summary"
                        checked={settings.notifications.monthlySummary}
                        onCheckedChange={(checked) => updateNotificationSetting('monthlySummary', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Alert Notifications */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Alert Notifications
                    </CardTitle>
                    <CardDescription>
                      Real-time alerts and warnings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="expense-alerts">Expense Alerts</Label>
                        <p className="text-xs text-slate-500">New expense notifications</p>
                      </div>
                      <Switch
                        id="expense-alerts"
                        checked={settings.notifications.expenseAlerts}
                        onCheckedChange={(checked) => updateNotificationSetting('expenseAlerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="budget-alerts">Budget Alerts</Label>
                        <p className="text-xs text-slate-500">Budget limit warnings</p>
                      </div>
                      <Switch
                        id="budget-alerts"
                        checked={settings.notifications.budgetAlerts}
                        onCheckedChange={(checked) => updateNotificationSetting('budgetAlerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="split-alerts">Split Alerts</Label>
                        <p className="text-xs text-slate-500">Split expense notifications</p>
                      </div>
                      <Switch
                        id="split-alerts"
                        checked={settings.notifications.splitAlerts}
                        onCheckedChange={(checked) => updateNotificationSetting('splitAlerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="large-expense">Large Expense Alert</Label>
                        <p className="text-xs text-slate-500">High amount transactions</p>
                      </div>
                      <Switch
                        id="large-expense"
                        checked={settings.notifications.largeExpenseAlert}
                        onCheckedChange={(checked) => updateNotificationSetting('largeExpenseAlert', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="unusual-spending">Unusual Spending Alert</Label>
                        <p className="text-xs text-slate-500">Abnormal spending patterns</p>
                      </div>
                      <Switch
                        id="unusual-spending"
                        checked={settings.notifications.unusualSpendingAlert}
                        onCheckedChange={(checked) => updateNotificationSetting('unusualSpendingAlert', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alert Thresholds */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Alert Thresholds
                  </CardTitle>
                  <CardDescription>
                    Configure when alerts should be triggered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="large-amount">Large Expense Amount ($)</Label>
                      <Input
                        id="large-amount"
                        type="number"
                        value={settings.alertThresholds.largeExpenseAmount}
                        onChange={(e) => updateThreshold('largeExpenseAmount', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="10"
                      />
                      <p className="text-xs text-slate-500">Alert when expense exceeds this amount</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="budget-warning">Budget Warning (%)</Label>
                      <Input
                        id="budget-warning"
                        type="number"
                        value={settings.alertThresholds.budgetWarningPercentage}
                        onChange={(e) => updateThreshold('budgetWarningPercentage', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="5"
                      />
                      <p className="text-xs text-slate-500">Alert at this % of budget used</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="unusual-spending">Unusual Spending (%)</Label>
                      <Input
                        id="unusual-spending"
                        type="number"
                        value={settings.alertThresholds.unusualSpendingPercentage}
                        onChange={(e) => updateThreshold('unusualSpendingPercentage', parseFloat(e.target.value) || 0)}
                        min="100"
                        step="10"
                      />
                      <p className="text-xs text-slate-500">Alert when spending exceeds % of average</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Email Schedule
                  </CardTitle>
                  <CardDescription>
                    Configure when automated emails are sent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="daily-time">Daily Summary Time</Label>
                      <Input
                        id="daily-time"
                        type="time"
                        value={settings.schedule.dailySummaryTime}
                        onChange={(e) => updateSchedule('dailySummaryTime', e.target.value)}
                      />
                      <p className="text-xs text-slate-500">When to send daily summaries</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weekly-day">Weekly Summary Day</Label>
                      <Select
                        value={settings.schedule.weeklySummaryDay}
                        onValueChange={(value) => updateSchedule('weeklySummaryDay', value)}
                      >
                        <SelectTrigger id="weekly-day">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500">Day to send weekly summaries</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="monthly-day">Monthly Summary Day</Label>
                      <Input
                        id="monthly-day"
                        type="number"
                        value={settings.schedule.monthlySummaryDay}
                        onChange={(e) => updateSchedule('monthlySummaryDay', parseInt(e.target.value) || 1)}
                        min="1"
                        max="28"
                      />
                      <p className="text-xs text-slate-500">Day of month to send summaries</p>
                    </div>
                  </div>
                  
                  <Alert className="mt-6">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      All times are in your local timezone. Monthly summaries are sent on the specified day 
                      of each month, or the last day if the month has fewer days.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Email Configuration */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Email Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your email server settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="from-email">From Email</Label>
                      <Input
                        id="from-email"
                        type="email"
                        value={settings.emailConfig.fromEmail}
                        onChange={(e) => updateEmailConfig('fromEmail', e.target.value)}
                        placeholder="noreply@yourapp.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reply-email">Reply-To Email</Label>
                      <Input
                        id="reply-email"
                        type="email"
                        value={settings.emailConfig.replyToEmail}
                        onChange={(e) => updateEmailConfig('replyToEmail', e.target.value)}
                        placeholder="support@yourapp.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email-provider">Email Provider</Label>
                      <Select
                        value={settings.emailConfig.emailProvider}
                        onValueChange={(value) => updateEmailConfig('emailProvider', value)}
                      >
                        <SelectTrigger id="email-provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gmail">Gmail</SelectItem>
                          <SelectItem value="outlook">Outlook</SelectItem>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="custom">Custom SMTP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {settings.emailConfig.emailProvider === 'custom' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="smtp-host">SMTP Host</Label>
                          <Input
                            id="smtp-host"
                            value={settings.emailConfig.smtpHost}
                            onChange={(e) => updateEmailConfig('smtpHost', e.target.value)}
                            placeholder="smtp.yourprovider.com"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="smtp-port">SMTP Port</Label>
                            <Input
                              id="smtp-port"
                              type="number"
                              value={settings.emailConfig.smtpPort}
                              onChange={(e) => updateEmailConfig('smtpPort', parseInt(e.target.value) || 587)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between pt-6">
                            <Label htmlFor="use-ssl">Use SSL</Label>
                            <Switch
                              id="use-ssl"
                              checked={settings.emailConfig.useSSL}
                              onCheckedChange={(checked) => updateEmailConfig('useSSL', checked)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Email Signature */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Send className="h-5 w-5 mr-2" />
                      Email Signature
                    </CardTitle>
                    <CardDescription>
                      Customize your email signature
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signature">Email Signature</Label>
                      <Textarea
                        id="signature"
                        value={settings.emailConfig.emailSignature}
                        onChange={(e) => updateEmailConfig('emailSignature', e.target.value)}
                        placeholder="Best regards,&#10;Budget Baba&#10;&#10;This is an automated email. Please do not reply."
                        rows={6}
                      />
                      <p className="text-xs text-slate-500">
                        This signature will be appended to all outgoing emails
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Email Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize how your emails look and what they contain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-format">Email Format</Label>
                        <Select
                          value={settings.preferences.emailFormat}
                          onValueChange={(value: 'html' | 'text') => updatePreference('emailFormat', value)}
                        >
                          <SelectTrigger id="email-format">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="html">HTML (Rich formatting)</SelectItem>
                            <SelectItem value="text">Plain Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="include-charts">Include Charts</Label>
                          <p className="text-xs text-slate-500">Add charts to email reports</p>
                        </div>
                        <Switch
                          id="include-charts"
                          checked={settings.preferences.includeCharts}
                          onCheckedChange={(checked) => updatePreference('includeCharts', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="include-details">Include Transaction Details</Label>
                          <p className="text-xs text-slate-500">Show detailed transaction list</p>
                        </div>
                        <Switch
                          id="include-details"
                          checked={settings.preferences.includeTransactionDetails}
                          onCheckedChange={(checked) => updatePreference('includeTransactionDetails', checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="group-notifications">Group Notifications</Label>
                          <p className="text-xs text-slate-500">Notifications for group activities</p>
                        </div>
                        <Switch
                          id="group-notifications"
                          checked={settings.preferences.groupNotifications}
                          onCheckedChange={(checked) => updatePreference('groupNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="promotional">Receive Promotional Emails</Label>
                          <p className="text-xs text-slate-500">Tips, updates, and feature announcements</p>
                        </div>
                        <Switch
                          id="promotional"
                          checked={settings.preferences.receivePromotional}
                          onCheckedChange={(checked) => updatePreference('receivePromotional', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Card */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Email Preview</CardTitle>
                  <CardDescription>
                    Preview how your emails will look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Subject: Weekly Expense Summary - March 18, 2024</div>
                      <div className="text-xs text-slate-500">From: {settings.emailConfig.fromEmail || 'noreply@app.com'}</div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>Hello {user?.name || 'User'},</div>
                      <div>Here's your weekly expense summary:</div>
                      
                      {settings.preferences.emailFormat === 'html' ? (
                        <div className="bg-white p-3 rounded border">
                          <div className="font-semibold mb-2">📊 This Week's Summary</div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>Total Spent: <strong>$456.78</strong></div>
                            <div>Transactions: <strong>12</strong></div>
                          </div>
                          {settings.preferences.includeCharts && (
                            <div className="mt-2 p-2 bg-slate-100 rounded text-center text-xs">
                              [Chart: Spending by Category]
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="font-mono text-xs bg-white p-3 rounded border whitespace-pre">
{`This Week's Summary
-------------------
Total Spent: $456.78
Transactions: 12
Top Category: Food & Dining ($234.56)`}
                        </div>
                      )}
                      
                      {settings.preferences.includeTransactionDetails && (
                        <div className="text-xs">
                          <div className="font-medium">Recent Transactions:</div>
                          <div className="ml-2">• Coffee Shop - $4.50</div>
                          <div className="ml-2">• Grocery Store - $67.89</div>
                          <div className="ml-2">• Gas Station - $45.00</div>
                        </div>
                      )}
                      
                      {settings.emailConfig.emailSignature && (
                        <div className="border-t pt-2 text-xs text-slate-500 whitespace-pre-line">
                          {settings.emailConfig.emailSignature}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}