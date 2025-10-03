"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  Globe,
  Moon,
  Sun,
  Monitor,
  Lock,
  Smartphone,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Share2,
  LogOut
} from 'lucide-react'

interface UserSettings {
  profile: {
    name: string
    email: string
    avatar: string
    bio: string
    location: string
    timezone: string
    language: string
    currency: string
    dateFormat: string
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    sidebarCollapsed: boolean
    dashboardLayout: 'grid' | 'list'
    defaultExpenseCategory: string
    autoSaveFrequency: number
    enableSounds: boolean
    enableAnimations: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    shareAnalytics: boolean
    allowDataCollection: boolean
    marketingEmails: boolean
    activityTracking: boolean
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    passwordLastChanged: Date
    loginNotifications: boolean
    deviceTrust: boolean
  }
  notifications: {
    desktop: boolean
    mobile: boolean
    email: boolean
    weeklyDigest: boolean
    budgetAlerts: boolean
    largeExpenseAlerts: boolean
    splitUpdates: boolean
  }
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { currency, setCurrency, currencySymbol, formatAmount } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: '',
      email: '',
      avatar: '',
      bio: '',
      location: '',
      timezone: 'UTC',
      language: 'en',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    },
    preferences: {
      theme: 'system',
      sidebarCollapsed: false,
      dashboardLayout: 'grid',
      defaultExpenseCategory: '',
      autoSaveFrequency: 30,
      enableSounds: true,
      enableAnimations: true
    },
    privacy: {
      profileVisibility: 'private',
      shareAnalytics: false,
      allowDataCollection: true,
      marketingEmails: false,
      activityTracking: true
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordLastChanged: new Date(),
      loginNotifications: true,
      deviceTrust: true
    },
    notifications: {
      desktop: true,
      mobile: true,
      email: true,
      weeklyDigest: true,
      budgetAlerts: true,
      largeExpenseAlerts: true,
      splitUpdates: true
    }
  })

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Simulate loading settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Initialize with user data
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: user?.name || '',
          email: user?.email || '',
          avatar: user?.avatar || ''
        }
      }))
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      // Save currency to localStorage for now
      if (typeof window !== 'undefined') {
        localStorage.setItem('userCurrency', settings.profile.currency)
      }
      
      // Simulate saving other settings
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Settings saved successfully! Currency changes will be reflected after page refresh.')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Please fill in all password fields')
      return
    }
    
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordForm.new.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    
    try {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          passwordLastChanged: new Date()
        }
      }))
      
      setPasswordForm({ current: '', new: '', confirm: '' })
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      setSaving(true)
      setCurrency(newCurrency)
      toast.success(`Currency updated to ${newCurrency} successfully!`)
    } catch (error) {
      console.error('Error updating currency:', error)
      toast.error('Failed to update currency')
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const exportData = {
        profile: settings.profile,
        exportedAt: new Date().toISOString(),
        expenses: [], // Would contain actual expense data
        categories: [],
        groups: []
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `expense-data-${new Date().toISOString().split('T')[0]}.json`
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    )
    
    if (!confirmed) return
    
    try {
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Account deletion initiated. You will receive a confirmation email.')
      logout()
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  const updateProfile = (key: keyof typeof settings.profile, value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [key]: value }
    }))
  }

  const updatePreferences = (key: keyof typeof settings.preferences, value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }))
  }

  const updatePrivacy = (key: keyof typeof settings.privacy, value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }))
  }

  const updateSecurity = (key: keyof typeof settings.security, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [key]: value }
    }))
  }

  const updateNotifications = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }))
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
              <p className="text-slate-600 mt-1">
                Manage your account, preferences, and security settings
              </p>
            </div>
            
            <Button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="currency">
                <CreditCard className="h-4 w-4 mr-2" />
                Currency
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Lock className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="data">
                <Database className="h-4 w-4 mr-2" />
                Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Profile Information */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="text-lg">
                          {settings.profile.name.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Remove Photo
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={settings.profile.name}
                          onChange={(e) => updateProfile('name', e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => updateProfile('email', e.target.value)}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={settings.profile.bio}
                        onChange={(e) => updateProfile('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={settings.profile.location}
                          onChange={(e) => updateProfile('location', e.target.value)}
                          placeholder="City, Country"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={settings.profile.timezone}
                          onValueChange={(value) => updateProfile('timezone', value)}
                        >
                          <SelectTrigger id="timezone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">Eastern Time</SelectItem>
                            <SelectItem value="CST">Central Time</SelectItem>
                            <SelectItem value="MST">Mountain Time</SelectItem>
                            <SelectItem value="PST">Pacific Time</SelectItem>
                            <SelectItem value="GMT">GMT</SelectItem>
                            <SelectItem value="CET">Central European Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Localization */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Localization</CardTitle>
                    <CardDescription>
                      Configure language, currency, and date formats
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={settings.profile.language}
                        onValueChange={(value) => updateProfile('language', value)}
                      >
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="it">Italiano</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select
                        value={settings.profile.currency}
                        onValueChange={(value) => updateProfile('currency', value)}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                          <SelectItem value="AUD">AUD ($)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select
                        value={settings.profile.dateFormat}
                        onValueChange={(value) => updateProfile('dateFormat', value)}
                      >
                        <SelectTrigger id="date-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Appearance */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize the look and feel of your interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', icon: Sun, label: 'Light' },
                          { value: 'dark', icon: Moon, label: 'Dark' },
                          { value: 'system', icon: Monitor, label: 'System' }
                        ].map(({ value, icon: Icon, label }) => (
                          <button
                            key={value}
                            onClick={() => updatePreferences('theme', value)}
                            className={`p-3 border rounded-lg text-center hover:bg-slate-50 transition-colors ${
                              settings.preferences.theme === value ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                            }`}
                          >
                            <Icon className="h-5 w-5 mx-auto mb-1" />
                            <div className="text-sm">{label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dashboard-layout">Dashboard Layout</Label>
                      <Select
                        value={settings.preferences.dashboardLayout}
                        onValueChange={(value: 'grid' | 'list') => updatePreferences('dashboardLayout', value)}
                      >
                        <SelectTrigger id="dashboard-layout">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid View</SelectItem>
                          <SelectItem value="list">List View</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="collapsed-sidebar">Collapsed Sidebar</Label>
                        <p className="text-xs text-slate-500">Keep sidebar minimized by default</p>
                      </div>
                      <Switch
                        id="collapsed-sidebar"
                        checked={settings.preferences.sidebarCollapsed}
                        onCheckedChange={(checked) => updatePreferences('sidebarCollapsed', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="animations">Enable Animations</Label>
                        <p className="text-xs text-slate-500">Show UI transitions and animations</p>
                      </div>
                      <Switch
                        id="animations"
                        checked={settings.preferences.enableAnimations}
                        onCheckedChange={(checked) => updatePreferences('enableAnimations', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sounds">Enable Sounds</Label>
                        <p className="text-xs text-slate-500">Play notification sounds</p>
                      </div>
                      <Switch
                        id="sounds"
                        checked={settings.preferences.enableSounds}
                        onCheckedChange={(checked) => updatePreferences('enableSounds', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Behavior */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Behavior</CardTitle>
                    <CardDescription>
                      Configure default behaviors and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-category">Default Expense Category</Label>
                      <Select
                        value={settings.preferences.defaultExpenseCategory}
                        onValueChange={(value) => updatePreferences('defaultExpenseCategory', value)}
                      >
                        <SelectTrigger id="default-category">
                          <SelectValue placeholder="Select default category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          <SelectItem value="food">Food & Dining</SelectItem>
                          <SelectItem value="transport">Transportation</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="bills">Bills & Utilities</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="autosave">Auto-save Frequency (seconds)</Label>
                      <div className="space-y-2">
                        <Input
                          id="autosave"
                          type="number"
                          value={settings.preferences.autoSaveFrequency}
                          onChange={(e) => updatePreferences('autoSaveFrequency', parseInt(e.target.value) || 30)}
                          min="10"
                          max="300"
                        />
                        <div className="text-xs text-slate-500">
                          Forms will auto-save every {settings.preferences.autoSaveFrequency} seconds
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="currency" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Currency Settings */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      Currency Settings
                    </CardTitle>
                    <CardDescription>
                      Configure your preferred currency for all financial displays
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="currency-select">Default Currency</Label>
                      <Select value={currency} onValueChange={handleCurrencyChange}>
                        <SelectTrigger id="currency-select">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">🇮🇳 Indian Rupee (₹)</SelectItem>
                          <SelectItem value="USD">🇺🇸 US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                          <SelectItem value="GBP">🇬🇧 British Pound (£)</SelectItem>
                          <SelectItem value="JPY">🇯🇵 Japanese Yen (¥)</SelectItem>
                          <SelectItem value="CAD">🇨🇦 Canadian Dollar ($)</SelectItem>
                          <SelectItem value="AUD">🇦🇺 Australian Dollar ($)</SelectItem>
                          <SelectItem value="CNY">🇨🇳 Chinese Yuan (¥)</SelectItem>
                          <SelectItem value="CHF">🇨🇭 Swiss Franc (CHF)</SelectItem>
                          <SelectItem value="SGD">🇸🇬 Singapore Dollar ($)</SelectItem>
                          <SelectItem value="AED">🇦🇪 UAE Dirham (د.إ)</SelectItem>
                          <SelectItem value="SAR">🇸🇦 Saudi Riyal (﷼)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="text-sm font-medium text-green-800">Current Symbol</p>
                          <p className="text-lg font-bold text-green-900">{currencySymbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600">Sample Amount</p>
                          <p className="text-lg font-bold text-green-900">{formatAmount(1234.56)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Currency Format Preview */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Format Preview
                    </CardTitle>
                    <CardDescription>
                      See how amounts will appear throughout the app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-600">Small Amount:</span>
                        <span className="font-bold text-blue-900">{formatAmount(25.50)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-600">Medium Amount:</span>
                        <span className="font-bold text-blue-900">{formatAmount(1250.75)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-600">Large Amount:</span>
                        <span className="font-bold text-blue-900">{formatAmount(125000.00)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-600">Very Large Amount:</span>
                        <span className="font-bold text-blue-900">{formatAmount(1250000.50)}</span>
                      </div>
                    </div>
                    
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Currency changes apply immediately to all pages and charts in your expense tracker.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Password & Authentication */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Password & Authentication</CardTitle>
                    <CardDescription>
                      Manage your password and authentication settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Password Strength</span>
                        <Badge variant="secondary">Strong</Badge>
                      </div>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">
                        Last changed: {settings.security.passwordLastChanged.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.new}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleChangePassword} className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Configure additional security features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="2fa">Two-Factor Authentication</Label>
                        <p className="text-xs text-slate-500">Add an extra layer of security</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="2fa"
                          checked={settings.security.twoFactorEnabled}
                          onCheckedChange={(checked) => updateSecurity('twoFactorEnabled', checked)}
                        />
                        {settings.security.twoFactorEnabled && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Select
                        value={settings.security.sessionTimeout.toString()}
                        onValueChange={(value) => updateSecurity('sessionTimeout', parseInt(value))}
                      >
                        <SelectTrigger id="session-timeout">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="480">8 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="login-notifications">Login Notifications</Label>
                        <p className="text-xs text-slate-500">Get notified of new logins</p>
                      </div>
                      <Switch
                        id="login-notifications"
                        checked={settings.security.loginNotifications}
                        onCheckedChange={(checked) => updateSecurity('loginNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="device-trust">Remember Trusted Devices</Label>
                        <p className="text-xs text-slate-500">Skip 2FA on trusted devices</p>
                      </div>
                      <Switch
                        id="device-trust"
                        checked={settings.security.deviceTrust}
                        onCheckedChange={(checked) => updateSecurity('deviceTrust', checked)}
                      />
                    </div>
                    
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your account is secured with bank-level encryption. All data is encrypted in transit and at rest.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control what information is shared and how your data is used
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-visibility">Profile Visibility</Label>
                      <Select
                        value={settings.privacy.profileVisibility}
                        onValueChange={(value: 'public' | 'private' | 'friends') => updatePrivacy('profileVisibility', value)}
                      >
                        <SelectTrigger id="profile-visibility">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public - Anyone can see</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private - Only me</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="share-analytics">Share Analytics</Label>
                        <p className="text-xs text-slate-500">Help improve the app with anonymous usage data</p>
                      </div>
                      <Switch
                        id="share-analytics"
                        checked={settings.privacy.shareAnalytics}
                        onCheckedChange={(checked) => updatePrivacy('shareAnalytics', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="data-collection">Allow Data Collection</Label>
                        <p className="text-xs text-slate-500">Collect data to personalize your experience</p>
                      </div>
                      <Switch
                        id="data-collection"
                        checked={settings.privacy.allowDataCollection}
                        onCheckedChange={(checked) => updatePrivacy('allowDataCollection', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing-emails">Marketing Emails</Label>
                        <p className="text-xs text-slate-500">Receive promotional emails and newsletters</p>
                      </div>
                      <Switch
                        id="marketing-emails"
                        checked={settings.privacy.marketingEmails}
                        onCheckedChange={(checked) => updatePrivacy('marketingEmails', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="activity-tracking">Activity Tracking</Label>
                        <p className="text-xs text-slate-500">Track activity for better insights and features</p>
                      </div>
                      <Switch
                        id="activity-tracking"
                        checked={settings.privacy.activityTracking}
                        onCheckedChange={(checked) => updatePrivacy('activityTracking', checked)}
                      />
                    </div>
                  </div>
                  
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      We never share your personal financial data with third parties. 
                      Read our <a href="#" className="underline">Privacy Policy</a> for more details.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how and when you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-medium">Notification Channels</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4 text-blue-500" />
                          <div>
                            <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                            <p className="text-xs text-slate-500">Browser notifications</p>
                          </div>
                        </div>
                        <Switch
                          id="desktop-notifications"
                          checked={settings.notifications.desktop}
                          onCheckedChange={(checked) => updateNotifications('desktop', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-green-500" />
                          <div>
                            <Label htmlFor="mobile-notifications">Mobile Notifications</Label>
                            <p className="text-xs text-slate-500">Push notifications on mobile app</p>
                          </div>
                        </div>
                        <Switch
                          id="mobile-notifications"
                          checked={settings.notifications.mobile}
                          onCheckedChange={(checked) => updateNotifications('mobile', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-purple-500" />
                          <div>
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-xs text-slate-500">Email alerts and summaries</p>
                          </div>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={settings.notifications.email}
                          onCheckedChange={(checked) => updateNotifications('email', checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Notification Types</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weekly-digest">Weekly Digest</Label>
                          <p className="text-xs text-slate-500">Weekly spending summary</p>
                        </div>
                        <Switch
                          id="weekly-digest"
                          checked={settings.notifications.weeklyDigest}
                          onCheckedChange={(checked) => updateNotifications('weeklyDigest', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="budget-alerts">Budget Alerts</Label>
                          <p className="text-xs text-slate-500">When approaching budget limits</p>
                        </div>
                        <Switch
                          id="budget-alerts"
                          checked={settings.notifications.budgetAlerts}
                          onCheckedChange={(checked) => updateNotifications('budgetAlerts', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="large-expense-alerts">Large Expense Alerts</Label>
                          <p className="text-xs text-slate-500">For unusually large expenses</p>
                        </div>
                        <Switch
                          id="large-expense-alerts"
                          checked={settings.notifications.largeExpenseAlerts}
                          onCheckedChange={(checked) => updateNotifications('largeExpenseAlerts', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="split-updates">Split Updates</Label>
                          <p className="text-xs text-slate-500">When splits are updated or settled</p>
                        </div>
                        <Switch
                          id="split-updates"
                          checked={settings.notifications.splitUpdates}
                          onCheckedChange={(checked) => updateNotifications('splitUpdates', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Data Export */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>
                      Export your data for backup or migration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Complete Data Export</div>
                            <div className="text-xs text-slate-500">All expenses, categories, and settings</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExportData}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Share2 className="h-5 w-5 text-green-500" />
                          <div>
                            <div className="font-medium">Expense Data Only</div>
                            <div className="text-xs text-slate-500">Expenses and transactions</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                    
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Exported data is in JSON format and includes all your financial information. 
                        Keep it secure and do not share with unauthorized parties.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Account Management */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>
                      Manage your account and subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-purple-500" />
                          <div>
                            <div className="font-medium">Subscription</div>
                            <div className="text-xs text-slate-500">Manage your plan and billing</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <LogOut className="h-5 w-5 text-orange-500" />
                          <div>
                            <div className="font-medium">Sign Out All Devices</div>
                            <div className="text-xs text-slate-500">End sessions on all devices</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Danger Zone</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleDeleteAccount}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
