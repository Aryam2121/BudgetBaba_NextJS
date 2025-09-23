import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Switch } from '@/components/ui/switch'
import { Repeat, Plus, Edit2, Trash2, Pause, Play, Clock, DollarSign } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface RecurringTransaction {
  _id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate?: string
  isActive: boolean
  nextProcessDate: string
  description?: string
  tags: string[]
  processedCount: number
  createdAt: string
  lastProcessedAt?: string
}

const RecurringTransactions = () => {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense' as const,
    category: 'other',
    frequency: 'monthly' as const,
    startDate: '',
    endDate: '',
    description: '',
    tags: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchRecurringTransactions()
  }, [])

  const fetchRecurringTransactions = async () => {
    try {
      const response = await api.getRecurringTransactions()
      if (response.data) {
        setTransactions(response.data.data || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch recurring transactions',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.amount || !formData.startDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      if (editingTransaction) {
        await api.updateRecurringTransaction(editingTransaction._id, transactionData)
        toast({
          title: 'Success',
          description: 'Recurring transaction updated successfully'
        })
      } else {
        await api.createRecurringTransaction(transactionData)
        toast({
          title: 'Success',
          description: 'Recurring transaction created successfully'
        })
      }

      setIsCreateModalOpen(false)
      setEditingTransaction(null)
      resetForm()
      fetchRecurringTransactions()
    } catch (error) {
      toast({
        title: 'Error',
        description: editingTransaction ? 'Failed to update transaction' : 'Failed to create transaction',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      type: 'expense',
      category: 'other',
      frequency: 'monthly',
      startDate: '',
      endDate: '',
      description: '',
      tags: ''
    })
  }

  const toggleTransactionStatus = async (transactionId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await api.pauseRecurringTransaction(transactionId)
      } else {
        await api.resumeRecurringTransaction(transactionId)
      }
      
      setTransactions(prev =>
        prev.map(t => t._id === transactionId ? { ...t, isActive: !isActive } : t)
      )
      
      toast({
        title: 'Success',
        description: `Transaction ${isActive ? 'paused' : 'resumed'} successfully`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isActive ? 'pause' : 'resume'} transaction`,
        variant: 'destructive'
      })
    }
  }

  const deleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return

    try {
      await api.deleteRecurringTransaction(transactionId)
      setTransactions(prev => prev.filter(t => t._id !== transactionId))
      toast({
        title: 'Success',
        description: 'Recurring transaction deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive'
      })
    }
  }

  const openEditModal = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction)
    setFormData({
      title: transaction.title,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      frequency: transaction.frequency,
      startDate: new Date(transaction.startDate).toISOString().split('T')[0],
      endDate: transaction.endDate ? new Date(transaction.endDate).toISOString().split('T')[0] : '',
      description: transaction.description || '',
      tags: transaction.tags.join(', ')
    })
    setIsCreateModalOpen(true)
  }

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅'
      case 'weekly': return '📆'
      case 'monthly': return '🗓️'
      case 'quarterly': return '📊'
      case 'yearly': return '🎯'
      default: return '🔄'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const categories = [
    'food', 'transportation', 'entertainment', 'utilities', 'shopping',
    'healthcare', 'education', 'travel', 'income', 'investment', 'other'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Repeat className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Recurring Transactions</h2>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Recurring Transaction
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}
              </DialogTitle>
              <DialogDescription>
                Set up a transaction that repeats automatically
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Monthly Rent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="1000.00"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
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
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateModalOpen(false)
                  setEditingTransaction(null)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTransaction ? 'Update Transaction' : 'Create Transaction'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {transactions.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recurring transactions found. Create your first one!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction._id} className={`${!transaction.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{getFrequencyIcon(transaction.frequency)}</div>
                    <div>
                      <CardTitle className="text-lg">{transaction.title}</CardTitle>
                      {transaction.description && (
                        <CardDescription className="mt-1">{transaction.description}</CardDescription>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => toggleTransactionStatus(transaction._id, transaction.isActive)}
                      variant="outline"
                      size="sm"
                    >
                      {transaction.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button
                      onClick={() => openEditModal(transaction)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => deleteTransaction(transaction._id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getTypeColor(transaction.type)}`}>
                    {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </span>
                  <Badge variant={transaction.isActive ? 'default' : 'secondary'}>
                    {transaction.isActive ? 'Active' : 'Paused'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Next Process</p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(transaction.nextProcessDate)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Processed</p>
                    <p>{transaction.processedCount} times</p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="font-medium text-muted-foreground">Schedule</p>
                  <p>Every {transaction.frequency} since {formatDate(transaction.startDate)}</p>
                  {transaction.endDate && (
                    <p>Ends on {formatDate(transaction.endDate)}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{transaction.category}</Badge>
                  <Badge variant="outline">{transaction.frequency}</Badge>
                  {transaction.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>

                {transaction.lastProcessedAt && (
                  <div className="text-xs text-muted-foreground">
                    Last processed: {formatDate(transaction.lastProcessedAt)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default RecurringTransactions