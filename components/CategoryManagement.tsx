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
import { Switch } from '@/components/ui/switch'
import { 
  Plus, Edit2, Trash2, GripVertical, Tag, Check, X, Palette,
  UtensilsCrossed, Car, ShoppingBag, Film, Receipt, Heart, 
  GraduationCap, Home, MoreHorizontal, Briefcase, Laptop,
  Building2, TrendingUp, DollarSign, Repeat
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

const iconOptions = [
  { value: 'Tag', label: 'Tag', icon: Tag },
  { value: 'UtensilsCrossed', label: 'Food', icon: UtensilsCrossed },
  { value: 'Car', label: 'Transport', icon: Car },
  { value: 'ShoppingBag', label: 'Shopping', icon: ShoppingBag },
  { value: 'Film', label: 'Entertainment', icon: Film },
  { value: 'Receipt', label: 'Bills', icon: Receipt },
  { value: 'Heart', label: 'Healthcare', icon: Heart },
  { value: 'GraduationCap', label: 'Education', icon: GraduationCap },
  { value: 'Repeat', label: 'Recurring', icon: Repeat },
  { value: 'Home', label: 'Home', icon: Home },
  { value: 'Briefcase', label: 'Work', icon: Briefcase },
  { value: 'Laptop', label: 'Tech', icon: Laptop },
  { value: 'Building2', label: 'Business', icon: Building2 },
  { value: 'TrendingUp', label: 'Investment', icon: TrendingUp },
  { value: 'DollarSign', label: 'Money', icon: DollarSign },
  { value: 'MoreHorizontal', label: 'Other', icon: MoreHorizontal }
]

const colorOptions = [
  '#10B981', // green
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EF4444', // red
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F97316', // orange
  '#6B7280'  // gray
]

export default function CategoryManagement() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState<{
    name: string
    icon: string
    color: string
    type: 'expense' | 'income' | 'both'
    description: string
  }>({
    name: '',
    icon: 'Tag',
    color: '#3B82F6',
    type: 'expense',
    description: ''
  })

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.getCategories()
      if (response.data?.success) {
        setCategories(response.data.categories || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let response
      if (editingCategory) {
        response = await api.updateCategory(editingCategory._id, formData)
      } else {
        response = await api.createCategory(formData)
      }

      if (response.data?.success) {
        toast({
          title: 'Success',
          description: editingCategory ? 'Category updated successfully' : 'Category created successfully'
        })
        setIsDialogOpen(false)
        setEditingCategory(null)
        setFormData({ name: '', icon: 'Tag', color: '#3B82F6', type: 'expense', description: '' })
        fetchCategories()
      } else {
        toast({
          title: 'Error',
          description: response.data?.error || 'Failed to save category',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      description: category.description || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (category: any) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return
    }

    try {
      const response = await api.deleteCategory(category._id)
      if (response.data?.success) {
        toast({
          title: 'Success',
          description: 'Category deleted successfully'
        })
        fetchCategories()
      } else {
        toast({
          title: 'Error',
          description: response.data?.error || 'Failed to delete category',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (category: any) => {
    try {
      const response = await api.updateCategory(category._id, {
        isActive: !category.isActive
      })
      if (response.data?.success) {
        fetchCategories()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive'
      })
    }
  }

  const getIcon = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName)
    const IconComponent = iconOption?.icon || Tag
    return <IconComponent className="h-5 w-5" />
  }

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both')
  const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Categories</h2>
          <p className="text-muted-foreground">Manage your expense and income categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingCategory(null)
            setFormData({ name: '', icon: 'Tag', color: '#3B82F6', type: 'expense', description: '' })
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update your category details' : 'Add a new category for your expenses or income'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Groceries, Rent, Salary"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {iconOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: option.value })}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          formData.icon === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="h-5 w-5 mx-auto" />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-10 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 w-10 rounded-lg border-2 transition-all ${
                        formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {formData.color === color && <Check className="h-5 w-5 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a description for this category"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading categories...</div>
      ) : (
        <div className="grid gap-6">
          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Categories for tracking your expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {getIcon(category.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      )}
                    </div>
                    {category.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => handleToggleActive(category)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!category.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Income Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Income Categories</CardTitle>
              <CardDescription>Categories for tracking your income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {getIcon(category.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      )}
                    </div>
                    {category.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => handleToggleActive(category)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!category.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
