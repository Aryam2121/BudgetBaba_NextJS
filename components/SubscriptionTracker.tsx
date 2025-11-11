"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, Edit2, Trash2, Calendar, DollarSign, AlertCircle, 
  TrendingUp, Pause, Play, X, ExternalLink, CreditCard, BarChart3,
  Netflix, Music, Zap, Tv, Cloud, Package
} from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useToast } from '@/hooks/use-toast'

export default function SubscriptionTracker() {
  const { toast } = useToast()
  const { formatAmount, currency } = useCurrency()
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('active')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    billingCycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    category: 'Subscriptions',
    icon: 'Repeat',
    color: '#8B5CF6',
    website: '',
    notes: '',
    paymentMethod: 'Card',
    reminderDays: '3'
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [subsResponse, analyticsResponse] = await Promise.all([
        api.getSubscriptions(),
        api.getSubscriptionAnalytics()
      ])
      
      if (subsResponse.data?.success) {
        setSubscriptions(subsResponse.data.subscriptions || [])
        setSummary(subsResponse.data.summary)
      }
      
      if (analyticsResponse.data?.success) {
        setAnalytics(analyticsResponse.data.analytics)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        reminderDays: parseInt(formData.reminderDays),
        currency
      }

      let response
      if (editingSubscription) {
        response = await api.updateSubscription(editingSubscription._id, data)
      } else {
        response = await api.createSubscription(data)
      }

      if (response.data?.success) {
        toast({
          title: 'Success',
          description: editingSubscription ? 'Subscription updated' : 'Subscription created'
        })
        setIsDialogOpen(false)
        setEditingSubscription(null)
        resetForm()
        fetchData()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save subscription',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (subscription: any) => {
    setEditingSubscription(subscription)
    setFormData({
      name: subscription.name,
      description: subscription.description || '',
      amount: subscription.amount.toString(),
      billingCycle: subscription.billingCycle,
      startDate: new Date(subscription.startDate).toISOString().split('T')[0],
      category: subscription.category,
      icon: subscription.icon,
      color: subscription.color,
      website: subscription.website || '',
      notes: subscription.notes || '',
      paymentMethod: subscription.paymentMethod || 'Card',
      reminderDays: subscription.reminderDays?.toString() || '3'
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    
    try {
      const response = await api.deleteSubscription(id)
      if (response.data?.success) {
        toast({ title: 'Success', description: 'Subscription deleted' })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await api.updateSubscription(id, { status })
      if (response.data?.success) {
        toast({ title: 'Success', description: `Subscription ${status}` })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      billingCycle: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      category: 'Subscriptions',
      icon: 'Repeat',
      color: '#8B5CF6',
      website: '',
      notes: '',
      paymentMethod: 'Card',
      reminderDays: '3'
    })
  }

  const getDaysUntilRenewal = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const filteredSubscriptions = subscriptions.filter(s => {
    if (activeTab === 'all') return true
    return s.status === activeTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Subscription Tracker</h2>
          <p className="text-muted-foreground">Manage and track all your subscriptions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingSubscription(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSubscription ? 'Edit' : 'Add'} Subscription</DialogTitle>
              <DialogDescription>
                {editingSubscription ? 'Update subscription details' : 'Track a new subscription'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Subscription Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Netflix, Spotify, etc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="9.99"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select value={formData.billingCycle} onValueChange={(value) => setFormData({ ...formData, billingCycle: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reminderDays">Remind (days before)</Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubscription ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total}</div>
              <p className="text-sm text-muted-foreground">{summary.active} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatAmount(summary.monthlyTotal)}</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Annual Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatAmount(summary.annualTotal)}</div>
              <p className="text-sm text-muted-foreground">per year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Per Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatAmount(summary.active > 0 ? summary.monthlyTotal / summary.active : 0)}
              </div>
              <p className="text-sm text-muted-foreground">monthly average</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Subscriptions</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="paused">Paused</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No subscriptions found. Add your first subscription above!
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubscriptions.map((sub) => {
                const daysUntil = getDaysUntilRenewal(sub.nextBillingDate)
                const isDueSoon = daysUntil <= 7 && daysUntil >= 0

                return (
                  <div
                    key={sub._id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: sub.color }}
                    >
                      {sub.name[0].toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{sub.name}</h3>
                        {sub.website && (
                          <a href={sub.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </a>
                        )}
                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                          {sub.status}
                        </Badge>
                        {isDueSoon && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Due in {daysUntil} days
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatAmount(sub.amount)} / {sub.billingCycle}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {new Date(sub.nextBillingDate).toLocaleDateString()}
                        </span>
                        {sub.paymentMethod && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {sub.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(sub._id, 'paused')}
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(sub._id, 'active')}
                          title="Activate"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sub)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(sub._id, sub.name)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
