import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useCurrency } from '@/contexts/CurrencyContext'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Wallet, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  DollarSign,
  Target
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface Budget {
  _id: string
  name: string
  totalAmount: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  categories: Array<{
    name: string
    amount: number
    spent: number
    _id: string
  }>
  totalSpent: number
  remainingAmount: number
  utilizationPercentage: number
  status: 'on_track' | 'warning' | 'exceeded'
  isActive: boolean
  createdAt: string
}

const BudgetManagement = () => {
  const { formatAmount } = useCurrency()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    startDate: '',
    endDate: '',
    categories: [{ name: 'food', amount: '' }]
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const response = await api.getBudgets()
      if (response.data) {
        setBudgets(response.data.data || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch budgets',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.totalAmount || !formData.startDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    const totalCategoryAmount = formData.categories.reduce((sum, cat) => sum + parseFloat(cat.amount || '0'), 0)
    const totalAmount = parseFloat(formData.totalAmount)

    if (totalCategoryAmount > totalAmount) {
      toast({
        title: 'Error',
        description: 'Category amounts exceed total budget',
        variant: 'destructive'
      })
      return
    }

    try {
      const budgetData = {
        name: formData.name,
        totalAmount,
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        categories: formData.categories.filter(cat => cat.name && cat.amount).map(cat => ({
          category: cat.name,
          budgetAmount: parseFloat(cat.amount),
          alertThreshold: 80 // Default threshold
        }))
      }

      if (editingBudget) {
        await api.updateBudget(editingBudget._id, budgetData)
        toast({
          title: 'Success',
          description: 'Budget updated successfully'
        })
      } else {
        await api.createBudget(budgetData)
        toast({
          title: 'Success',
          description: 'Budget created successfully'
        })
      }

      setIsCreateModalOpen(false)
      setEditingBudget(null)
      resetForm()
      fetchBudgets()
    } catch (error) {
      toast({
        title: 'Error',
        description: editingBudget ? 'Failed to update budget' : 'Failed to create budget',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      totalAmount: '',
      period: 'monthly',
      startDate: '',
      endDate: '',
      categories: [{ name: 'food', amount: '' }]
    })
  }

  const deleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    try {
      await api.deleteBudget(budgetId)
      setBudgets(prev => prev.filter(b => b._id !== budgetId))
      toast({
        title: 'Success',
        description: 'Budget deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete budget',
        variant: 'destructive'
      })
    }
  }

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      name: budget.name,
      totalAmount: budget.totalAmount.toString(),
      period: budget.period,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: new Date(budget.endDate).toISOString().split('T')[0],
      categories: budget.categories.map(cat => ({ name: cat.name, amount: cat.amount.toString() }))
    })
    setIsCreateModalOpen(true)
  }

  const addCategoryField = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { name: '', amount: '' }]
    }))
  }

  const removeCategoryField = (index: number) => {
    if (formData.categories.length > 1) {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index)
      }))
    }
  }

  const updateCategoryField = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) => 
        i === index ? { ...cat, [field]: value } : cat
      )
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'on_track': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'exceeded': return 'Over Budget'
      case 'warning': return 'At Risk'
      case 'on_track': return 'On Track'
      default: return 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const categories = [
    'food', 'transportation', 'entertainment', 'utilities', 'shopping',
    'healthcare', 'education', 'travel', 'housing', 'insurance', 'other'
  ]

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
          <Wallet className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Budget Management</h2>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Budget
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
              <DialogDescription>
                Set up a budget to track your spending across categories
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Budget Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Budget"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalAmount">Total Amount *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="2000.00"
                  />
                </div>

                <div>
                  <Label htmlFor="period">Period</Label>
                  <Select value={formData.period} onValueChange={(value: any) => setFormData(prev => ({ ...prev, period: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Category Budgets</Label>
                  <Button type="button" onClick={addCategoryField} variant="outline" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Category
                  </Button>
                </div>
                
                {formData.categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select 
                      value={category.name} 
                      onValueChange={(value) => updateCategoryField(index, 'name', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={category.amount}
                      onChange={(e) => updateCategoryField(index, 'amount', e.target.value)}
                      className="w-32"
                    />
                    
                    {formData.categories.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeCategoryField(index)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="text-sm text-muted-foreground">
                  Total allocated: {formatAmount(formData.categories.reduce((sum, cat) => sum + parseFloat(cat.amount || '0'), 0))}
                  {formData.totalAmount && (
                    <span> of {formatAmount(parseFloat(formData.totalAmount))}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateModalOpen(false)
                  setEditingBudget(null)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budgets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No budgets found. Create your first budget!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card key={budget._id} className={`border-l-4 ${
              budget.status === 'exceeded' ? 'border-l-red-500' :
              budget.status === 'warning' ? 'border-l-yellow-500' : 'border-l-green-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    <CardDescription>
                      {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(budget.status)} text-white border-0`}>
                      {getStatusText(budget.status)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => openEditModal(budget)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => deleteBudget(budget._id)}
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
                    <span>Overall Progress</span>
                    <span>{budget.utilizationPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(budget.utilizationPercentage, 100)} 
                    className={`h-2 ${budget.status === 'exceeded' ? 'bg-red-100' : ''}`}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatAmount(budget.totalSpent)} spent</span>
                    <span>{formatAmount(budget.totalAmount)} budget</span>
                  </div>
                </div>

                {budget.status === 'exceeded' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Budget exceeded by {formatAmount(budget.totalSpent - budget.totalAmount)}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatAmount(budget.remainingAmount)}</p>
                      <p className="text-muted-foreground">remaining</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{calculateDaysRemaining(budget.endDate)} days</p>
                      <p className="text-muted-foreground">left</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Category Breakdown</h4>
                  {budget.categories.slice(0, 3).map((category) => (
                    <div key={category._id} className="flex items-center justify-between text-sm">
                      <span>{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatAmount(category.spent)}</span>
                        <span className="text-muted-foreground">/ {formatAmount(category.amount)}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            category.spent > category.amount ? 'text-red-600' : 
                            category.spent > category.amount * 0.8 ? 'text-yellow-600' : 'text-green-600'
                          }`}
                        >
                          {((category.spent / category.amount) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {budget.categories.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{budget.categories.length - 3} more categories
                    </p>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default BudgetManagement