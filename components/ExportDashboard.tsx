import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Download, 
  FileText, 
  Package, 
  Calendar, 
  Filter,
  History,
  Trash2,
  Eye
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface ExportHistory {
  _id: string
  format: 'csv' | 'json' | 'pdf'
  filters: any
  fileSize: number
  recordCount: number
  createdAt: string
  downloadUrl?: string
  status: 'completed' | 'processing' | 'failed'
}

const ExportDashboard = () => {
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [exportFilters, setExportFilters] = useState({
    format: 'csv' as 'csv' | 'json' | 'pdf',
    period: 'last_month',
    startDate: '',
    endDate: '',
    categories: [] as string[],
    minAmount: '',
    maxAmount: '',
    includeAnalytics: false,
    includeMetadata: true,
    groupBy: '',
    customQuery: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchExportHistory()
  }, [])

  const fetchExportHistory = async () => {
    try {
      const response = await api.getExportHistory()
      if (response.data) {
        setExportHistory(response.data.data || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch export history',
        variant: 'destructive'
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleExport = async (exportType: 'expenses' | 'analytics' | 'budget_report' | 'full_report') => {
    setLoading(true)
    
    try {
      let response
      const filters = {
        period: exportFilters.period,
        startDate: exportFilters.startDate,
        endDate: exportFilters.endDate,
        categories: exportFilters.categories,
        minAmount: exportFilters.minAmount ? parseFloat(exportFilters.minAmount) : undefined,
        maxAmount: exportFilters.maxAmount ? parseFloat(exportFilters.maxAmount) : undefined
      }

      switch (exportType) {
        case 'expenses':
          response = await api.exportExpenseData({
            format: exportFilters.format,
            ...filters,
            includeAnalytics: exportFilters.includeAnalytics
          })
          break
        case 'analytics':
          response = await api.exportAnalyticsReport({
            format: exportFilters.format,
            ...filters
          })
          break
        case 'budget_report':
          response = await api.exportBudgetReport({
            format: exportFilters.format,
            ...filters
          })
          break
        case 'full_report':
          response = await api.exportFullReport({
            format: 'zip',
            ...filters
          })
          break
      }

      // Handle file download
      if (response.data) {
        const blob = new Blob([response.data], { 
          type: exportFilters.format === 'csv' ? 'text/csv' : 
                exportFilters.format === 'json' ? 'application/json' : 
                exportFilters.format === 'pdf' ? 'application/pdf' : 'application/zip'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${exportType}-${new Date().toISOString().split('T')[0]}.${
          exportType === 'full_report' ? 'zip' : exportFilters.format
        }`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: 'Success',
          description: 'Data exported successfully'
        })
        
        fetchExportHistory() // Refresh history
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadFromHistory = async (exportId: string) => {
    try {
      const response = await api.downloadExport(exportId)
      
      if (response.data) {
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `export-${exportId}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast({
          title: 'Success',
          description: 'Export downloaded successfully'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download export',
        variant: 'destructive'
      })
    }
  }

  const deleteExport = async (exportId: string) => {
    if (!confirm('Are you sure you want to delete this export?')) return

    try {
      await api.deleteExport(exportId)
      setExportHistory(prev => prev.filter(e => e._id !== exportId))
      toast({
        title: 'Success',
        description: 'Export deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete export',
        variant: 'destructive'
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const categories = [
    'food', 'transportation', 'entertainment', 'utilities', 'shopping',
    'healthcare', 'education', 'travel', 'housing', 'insurance', 'other'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Data Export</h2>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Export Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Export Configuration</CardTitle>
                <CardDescription>Configure your export settings and filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Export Format</Label>
                  <Select 
                    value={exportFilters.format} 
                    onValueChange={(value: any) => setExportFilters(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                      <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
                      <SelectItem value="pdf">PDF (Formatted Report)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Time Period</Label>
                  <Select 
                    value={exportFilters.period} 
                    onValueChange={(value) => setExportFilters(prev => ({ ...prev, period: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_week">Last Week</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                      <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                      <SelectItem value="year_to_date">Year to Date</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {exportFilters.period === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={exportFilters.startDate}
                        onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={exportFilters.endDate}
                        onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label>Categories (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={exportFilters.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setExportFilters(prev => ({
                                ...prev,
                                categories: [...prev.categories, category]
                              }))
                            } else {
                              setExportFilters(prev => ({
                                ...prev,
                                categories: prev.categories.filter(c => c !== category)
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={category} className="text-sm">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAmount">Min Amount</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={exportFilters.minAmount}
                      onChange={(e) => setExportFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAmount">Max Amount</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      value={exportFilters.maxAmount}
                      onChange={(e) => setExportFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeAnalytics"
                      checked={exportFilters.includeAnalytics}
                      onCheckedChange={(checked) => setExportFilters(prev => ({ ...prev, includeAnalytics: !!checked }))}
                    />
                    <Label htmlFor="includeAnalytics">Include Analytics Data</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMetadata"
                      checked={exportFilters.includeMetadata}
                      onCheckedChange={(checked) => setExportFilters(prev => ({ ...prev, includeMetadata: !!checked }))}
                    />
                    <Label htmlFor="includeMetadata">Include Metadata</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>Choose what type of data to export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => handleExport('expenses')}
                  disabled={loading}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Expense Data</p>
                    <p className="text-sm text-muted-foreground">Export all expense transactions</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleExport('analytics')}
                  disabled={loading}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Analytics Report</p>
                    <p className="text-sm text-muted-foreground">Export spending insights and trends</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleExport('budget_report')}
                  disabled={loading}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Filter className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Budget Report</p>
                    <p className="text-sm text-muted-foreground">Export budget performance data</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleExport('full_report')}
                  disabled={loading}
                  className="w-full justify-start"
                >
                  <Package className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Complete Report Package</p>
                    <p className="text-sm text-muted-foreground">Export everything in a ZIP file</p>
                  </div>
                </Button>

                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Preparing your export...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>View and download your previous exports</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : exportHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No export history found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exportHistory.map((exportItem) => (
                    <div
                      key={exportItem._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        
                        <div>
                          <h4 className="font-medium">
                            Export ({exportItem.format.toUpperCase()})
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatDate(exportItem.createdAt)}</span>
                            <span>{exportItem.recordCount} records</span>
                            <span>{formatFileSize(exportItem.fileSize)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            exportItem.status === 'completed' ? 'default' :
                            exportItem.status === 'processing' ? 'secondary' : 'destructive'
                          }
                        >
                          {exportItem.status}
                        </Badge>
                        
                        {exportItem.status === 'completed' && (
                          <Button
                            onClick={() => downloadFromHistory(exportItem._id)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => deleteExport(exportItem._id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ExportDashboard