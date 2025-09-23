import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target, Plus, Edit2, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface Goal {
  _id: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
  isRecurring: boolean
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly'
  createdAt: string
  progressPercentage: number
  daysRemaining: number
  averageMonthlyRequired: number
}

const GoalsTracking = () => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'savings',
    priority: 'medium' as const,
    isRecurring: false,
    recurringFrequency: 'monthly' as const
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await api.getGoals()
      if (response.data) {
        setGoals(response.data.data || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch goals',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount)
      }

      if (editingGoal) {
        await api.updateGoal(editingGoal._id, goalData)
        toast({
          title: 'Success',
          description: 'Goal updated successfully'
        })
      } else {
        await api.createGoal(goalData)
        toast({
          title: 'Success',
          description: 'Goal created successfully'
        })
      }

      setIsCreateModalOpen(false)
      setEditingGoal(null)
      setFormData({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        category: 'savings',
        priority: 'medium',
        isRecurring: false,
        recurringFrequency: 'monthly'
      })
      fetchGoals()
    } catch (error) {
      toast({
        title: 'Error',
        description: editingGoal ? 'Failed to update goal' : 'Failed to create goal',
        variant: 'destructive'
      })
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      await api.deleteGoal(goalId)
      setGoals(prev => prev.filter(g => g._id !== goalId))
      toast({
        title: 'Success',
        description: 'Goal deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive'
      })
    }
  }

  const updateGoalProgress = async (goalId: string, amount: number) => {
    try {
      await api.updateGoalProgress(goalId, { amount })
      fetchGoals()
      toast({
        title: 'Success',
        description: 'Goal progress updated'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update goal progress',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'active': return 'bg-blue-500'
      case 'paused': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-green-500 bg-green-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      description: goal.description || '',
      targetAmount: goal.targetAmount.toString(),
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      category: goal.category,
      priority: goal.priority,
      isRecurring: goal.isRecurring,
      recurringFrequency: goal.recurringFrequency || 'monthly'
    })
    setIsCreateModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Financial Goals</h2>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
              <DialogDescription>
                Set up a financial goal to track your progress
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Goal Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Emergency Fund"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetAmount">Target Amount *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    placeholder="1000.00"
                  />
                </div>

                <div>
                  <Label htmlFor="targetDate">Target Date *</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="debt_payoff">Debt Payoff</SelectItem>
                      <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                />
                <Label htmlFor="isRecurring">Recurring Goal</Label>
              </div>

              {formData.isRecurring && (
                <div>
                  <Label htmlFor="recurringFrequency">Frequency</Label>
                  <Select value={formData.recurringFrequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurringFrequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No goals found. Create your first financial goal!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => (
            <Card key={goal._id} className={`border-2 ${getPriorityColor(goal.priority)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    {goal.description && (
                      <CardDescription className="mt-1">{goal.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(goal.status)} text-white border-0`}>
                      {goal.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => openEditModal(goal)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => deleteGoal(goal._id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{goal.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={goal.progressPercentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{goal.daysRemaining} days</p>
                      <p className="text-muted-foreground">remaining</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatCurrency(goal.averageMonthlyRequired)}</p>
                      <p className="text-muted-foreground">per month</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Add amount..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        const amount = parseFloat(input.value)
                        if (amount > 0) {
                          updateGoalProgress(goal._id, amount)
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{goal.category}</Badge>
                  <Badge variant="outline">{goal.priority} priority</Badge>
                  {goal.isRecurring && (
                    <Badge variant="outline">🔄 {goal.recurringFrequency}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default GoalsTracking