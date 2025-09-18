"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  Plus,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpDown
} from 'lucide-react'
import Link from 'next/link'

interface Expense {
  _id: string
  amount: number
  date: string
  category: string
  vendor?: string
  note?: string
  description?: string
  createdAt: string
}

const categories = [
  'All Categories',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Other'
]

export default function ExpensesPage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [totalAmount, setTotalAmount] = useState(0)
  const [filteredCount, setFilteredCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchExpenses()
    }
  }, [user, selectedCategory, dateFrom, dateTo])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      
      const filters: any = {}
      
      if (selectedCategory && selectedCategory !== 'All Categories') {
        filters.category = selectedCategory
      }
      
      if (dateFrom) {
        filters.from = format(dateFrom, 'yyyy-MM-dd')
      }
      
      if (dateTo) {
        filters.to = format(dateTo, 'yyyy-MM-dd')
      }

      const response = await api.getExpenses(filters)
      
      if (response.data) {
        const responseData = response.data as any
        const expensesData = Array.isArray(responseData) ? responseData : responseData.expenses || []
        setExpenses(expensesData)
        
        // Calculate totals
        const total = expensesData.reduce((sum: number, expense: Expense) => sum + expense.amount, 0)
        setTotalAmount(total)
        setFilteredCount(expensesData.length)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort expenses based on search query
  const filteredAndSortedExpenses = expenses
    .filter(expense => {
      if (!searchQuery) return true
      
      const query = searchQuery.toLowerCase()
      return (
        expense.vendor?.toLowerCase().includes(query) ||
        expense.note?.toLowerCase().includes(query) ||
        expense.description?.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.amount.toString().includes(query)
      )
    })
    .sort((a, b) => {
      let aVal: any, bVal: any
      
      switch (sortField) {
        case 'date':
          aVal = new Date(a.date).getTime()
          bVal = new Date(b.date).getTime()
          break
        case 'amount':
          aVal = a.amount
          bVal = b.amount
          break
        case 'category':
          aVal = a.category.toLowerCase()
          bVal = b.category.toLowerCase()
          break
        default:
          return 0
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  const handleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All Categories')
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const ExpensesTableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white/40 rounded-lg">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">All Expenses</h1>
              <p className="text-slate-600 mt-1">
                {loading ? 'Loading...' : `${filteredCount} expenses • Total: $${totalAmount.toFixed(2)}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/expenses/upload">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </Link>
              <Link href="/expenses/new">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Receipt className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-slate-800">{filteredCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-800">${totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Average</p>
                    <p className="text-2xl font-bold text-slate-800">
                      ${filteredCount > 0 ? (totalAmount / filteredCount).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingDown className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Categories</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {new Set(expenses.map(e => e.category)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-lg">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search expenses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Date From */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="md:w-40 justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateFrom ? format(dateFrom, 'MMM dd') : 'From Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {/* Date To */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="md:w-40 justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateTo ? format(dateTo, 'MMM dd') : 'To Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {/* Clear Filters */}
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-lg">Expense Details</CardTitle>
              <CardDescription>
                {searchQuery && `Showing results for "${searchQuery}"`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ExpensesTableSkeleton />
              ) : filteredAndSortedExpenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleSort('date')}
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleSort('category')}
                        >
                          Category
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead 
                          className="text-right cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleSort('amount')}
                        >
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedExpenses.map((expense) => (
                        <TableRow key={expense._id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium">
                            {format(new Date(expense.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {expense.description || expense.note || 'No description'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {expense.vendor || '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${expense.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No expenses found</h3>
                  <p className="text-slate-500">
                    {searchQuery || selectedCategory !== 'All Categories' || dateFrom || dateTo
                      ? 'Try adjusting your filters'
                      : 'Add your first expense to get started'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}