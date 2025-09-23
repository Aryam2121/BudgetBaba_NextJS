"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  Archive,
  Eye,
  EyeOff,
  Palette,
  Target,
  AlertCircle
} from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
  icon: string
  description?: string
  budgetLimit?: number
  isActive: boolean
  totalSpent: number
  transactionCount: number
  lastUsed?: string
  averageTransaction: number
}

const defaultCategories = [
  { name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B' },
  { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
  { name: 'Shopping', icon: '🛍️', color: '#45B7D1' },
  { name: 'Entertainment', icon: '🎬', color: '#96CEB4' },
  { name: 'Bills & Utilities', icon: '💡', color: '#FECA57' },
  { name: 'Healthcare', icon: '🏥', color: '#FF9FF3' },
  { name: 'Education', icon: '📚', color: '#54A0FF' },
  { name: 'Travel', icon: '✈️', color: '#5F27CD' },
  { name: 'Groceries', icon: '🛒', color: '#00D2D3' },
  { name: 'Other', icon: '📦', color: '#A4A4A4' }
]

const colorOptions = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#A4A4A4',
  '#FF4757', '#2ED573', '#3742FA', '#FFA726', '#AB47BC'
]

export default function CategoriesPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: '#FF6B6B',
    icon: '📦',
    description: '',
    budgetLimit: ''
  })

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  const loadCategories = async () => {
    try {
      setLoading(true)
      
      // Get category totals from monthly summary
      const response = await api.getMonthlySummary()
      
      if (response.data?.categoryTotals) {
        // Transform API data into our category format
        const apiCategories = response.data.categoryTotals.map((cat: any, index: number) => ({
          id: cat._id,
          name: cat._id,
          color: colorOptions[index % colorOptions.length],
          icon: getDefaultIcon(cat._id),
          description: `Automatically created category for ${cat._id}`,
          budgetLimit: 0,
          isActive: true,
          totalSpent: cat.total,
          transactionCount: cat.count,
          averageTransaction: cat.total / cat.count,
          lastUsed: new Date().toISOString()
        }))

        // Add default categories that don't exist
        const existingNames = apiCategories.map((cat: any) => cat.name)
        const missingDefaults = defaultCategories.filter(def => 
          !existingNames.includes(def.name)
        ).map(def => ({
          id: def.name.toLowerCase().replace(/\s+/g, '-'),
          name: def.name,
          color: def.color,
          icon: def.icon,
          description: `Default category for ${def.name}`,
          budgetLimit: 0,
          isActive: true,
          totalSpent: 0,
          transactionCount: 0,
          averageTransaction: 0
        }))

        setCategories([...apiCategories, ...missingDefaults])
      } else {
        // If no data, use default categories
        setCategories(defaultCategories.map(def => ({
          id: def.name.toLowerCase().replace(/\s+/g, '-'),
          name: def.name,
          color: def.color,
          icon: def.icon,
          description: `Default category for ${def.name}`,
          budgetLimit: 0,
          isActive: true,
          totalSpent: 0,
          transactionCount: 0,
          averageTransaction: 0
        })))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase()
    if (name.includes('food') || name.includes('dining')) return '🍽️'
    if (name.includes('transport') || name.includes('gas')) return '🚗'
    if (name.includes('shop') || name.includes('retail')) return '🛍️'
    if (name.includes('entertainment') || name.includes('movie')) return '🎬'
    if (name.includes('bill') || name.includes('utility')) return '💡'
    if (name.includes('health') || name.includes('medical')) return '🏥'
    if (name.includes('education') || name.includes('school')) return '📚'
    if (name.includes('travel') || name.includes('vacation')) return '✈️'
    if (name.includes('groceries') || name.includes('grocery')) return '🛒'
    return '📦'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const categoryData = {
        id: editingCategory?.id || Date.now().toString(),
        name: formData.name,
        color: formData.color,
        icon: formData.icon,
        description: formData.description,
        budgetLimit: parseFloat(formData.budgetLimit) || 0,
        isActive: true,
        totalSpent: editingCategory?.totalSpent || 0,
        transactionCount: editingCategory?.transactionCount || 0,
        averageTransaction: editingCategory?.averageTransaction || 0
      }

      if (editingCategory) {
        // Update existing category
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? { ...categoryData } : cat
        ))
        toast.success('Category updated successfully')
      } else {
        // Add new category
        setCategories(prev => [...prev, categoryData])
        toast.success('Category created successfully')
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast.error('Failed to save category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      description: category.description || '',
      budgetLimit: category.budgetLimit?.toString() || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    toast.success('Category deleted successfully')
  }

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ))
    toast.success('Category status updated')
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      color: '#FF6B6B',
      icon: '📦',
      description: '',
      budgetLimit: ''
    })
  }

  const totalCategories = categories.length
  const activeCategories = categories.filter(cat => cat.isActive).length
  const totalSpent = categories.reduce((sum, cat) => sum + cat.totalSpent, 0)
  const categoriesWithBudget = categories.filter(cat => cat.budgetLimit > 0).length

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Category Management</h1>
              <p className="text-slate-600 mt-1">
                Organize and manage your expense categories
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={resetForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory ? 'Update category details' : 'Add a new expense category to organize your spending'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Food & Dining"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="🍽️"
                        maxLength={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="color"
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          className="w-12 h-10"
                        />
                        <div className="flex flex-wrap gap-1 flex-1">
                          {colorOptions.slice(0, 6).map(color => (
                            <button
                              key={color}
                              type="button"
                              className="w-6 h-6 rounded border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                              onClick={() => setFormData(prev => ({ ...prev, color }))}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this category"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budgetLimit">Monthly Budget Limit (Optional)</Label>
                    <Input
                      id="budgetLimit"
                      type="number"
                      value={formData.budgetLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetLimit: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Tag className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Categories</p>
                    <p className="text-2xl font-bold text-slate-800">{totalCategories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Active Categories</p>
                    <p className="text-2xl font-bold text-slate-800">{activeCategories}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Spent</p>
                    <p className="text-2xl font-bold text-slate-800">${totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">With Budgets</p>
                    <p className="text-2xl font-bold text-slate-800">{categoriesWithBudget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>Your Categories</CardTitle>
              <CardDescription>
                Manage your expense categories and set budget limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-1" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-200 rounded w-full" />
                          <div className="h-3 bg-slate-200 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <Card 
                      key={category.id} 
                      className={`relative transition-all duration-200 hover:shadow-lg ${
                        category.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-75'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800">{category.name}</h3>
                              <p className="text-xs text-slate-500">
                                {category.transactionCount} transactions
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCategoryStatus(category.id)}
                              className="h-8 w-8 p-0"
                            >
                              {category.isActive ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Total Spent:</span>
                            <span className="font-semibold">${category.totalSpent.toFixed(2)}</span>
                          </div>
                          
                          {category.averageTransaction > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Avg Transaction:</span>
                              <span className="font-semibold">${category.averageTransaction.toFixed(2)}</span>
                            </div>
                          )}
                          
                          {category.budgetLimit > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Budget:</span>
                                <span className="font-semibold">${category.budgetLimit.toFixed(2)}</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min((category.totalSpent / category.budgetLimit) * 100, 100)}%`
                                  }}
                                />
                              </div>
                              <div className="text-xs text-slate-500">
                                {((category.totalSpent / category.budgetLimit) * 100).toFixed(1)}% used
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {!category.isActive && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No categories found</h3>
                  <p className="text-slate-500">Create your first category to organize your expenses</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}