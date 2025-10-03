"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Camera, Upload, FileText, Zap, Brain, CheckCircle, AlertCircle,
  X, RotateCcw, Crop, Download, Share, Eye, Trash2, Edit
} from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrency } from '@/hooks/useCurrency'

interface ReceiptData {
  id?: string
  vendor?: string
  date?: string
  amount?: number
  category?: string
  items?: ReceiptItem[]
  taxAmount?: number
  tipAmount?: number
  paymentMethod?: string
  confidence?: number
  rawText?: string
  imageUrl?: string
}

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  category?: string
}

interface AIProcessingResult {
  success: boolean
  data?: ReceiptData
  confidence: number
  suggestions?: string[]
  errors?: string[]
}

const EXPENSE_CATEGORIES = [
  'Food', 'Transportation', 'Shopping', 'Entertainment', 
  'Healthcare', 'Utilities', 'Education', 'Travel', 'Other'
]

export function AIReceiptScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<AIProcessingResult | null>(null)
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { formatCurrency } = useCurrency()

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
      
      // Reset previous results
      setResult(null)
      setExtractedData(null)
      setEditMode(false)
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const processReceipt = async () => {
    if (!file) return

    setProcessing(true)
    setProgress(0)

    try {
      // Simulate processing steps
      const steps = [
        { message: 'Uploading image...', progress: 20 },
        { message: 'AI analyzing receipt...', progress: 40 },
        { message: 'Extracting text...', progress: 60 },
        { message: 'Categorizing items...', progress: 80 },
        { message: 'Finalizing results...', progress: 100 }
      ]

      for (const step of steps) {
        setProgress(step.progress)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('receipt', file)
      formData.append('options', JSON.stringify({
        extractItems: true,
        categorize: true,
        detectPaymentMethod: true
      }))

      const response = await api.processReceipt(formData)
      
      if (response.error) {
        throw new Error(response.error)
      }

      const aiResult: AIProcessingResult = {
        success: true,
        data: response.data,
        confidence: response.data?.confidence || 0.8,
        suggestions: response.data?.suggestions || []
      }

      setResult(aiResult)
      setExtractedData(response.data)

    } catch (error) {
      console.error('Receipt processing failed:', error)
      setResult({
        success: false,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Processing failed']
      })
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const updateExtractedData = (field: keyof ReceiptData, value: any) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value
      })
    }
  }

  const saveExpense = async () => {
    if (!extractedData) return

    try {
      const expenseData = {
        amount: extractedData.amount || 0,
        vendor: extractedData.vendor || '',
        category: extractedData.category || 'Other',
        note: `Receipt scan - ${extractedData.items?.length || 0} items`,
        date: extractedData.date || new Date().toISOString(),
        metadata: {
          receiptData: extractedData,
          source: 'ai_receipt_scan'
        }
      }

      await api.addExpense(expenseData)
      
      // Show success and reset
      alert('Expense saved successfully!')
      resetScanner()
      
    } catch (error) {
      console.error('Failed to save expense:', error)
      alert('Failed to save expense. Please try again.')
    }
  }

  const resetScanner = () => {
    setFile(null)
    setImagePreview(null)
    setResult(null)
    setExtractedData(null)
    setEditMode(false)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Receipt Scanner</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload a receipt photo and let our AI extract expense details automatically. 
          Our advanced OCR technology can read text, categorize items, and detect amounts with high accuracy.
        </p>
      </div>

      {/* Upload Area */}
      {!imagePreview && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="p-8">
            <div
              className="text-center space-y-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="flex justify-center">
                <div className="p-4 bg-blue-50 rounded-full">
                  <Upload className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Upload Receipt Image</h3>
                <p className="text-gray-600">Drag and drop or click to select</p>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <Button variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="text-sm text-gray-500 space-y-1">
                <p>Supported formats: JPG, PNG, WEBP (max 10MB)</p>
                <p>Best results: Clear, well-lit photos with readable text</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview and Processing */}
      {imagePreview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Receipt Preview
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetScanner}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="w-full h-auto rounded-lg border"
                />
                {processing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="bg-white p-4 rounded-lg text-center">
                      <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-pulse" />
                      <p className="font-medium">AI Processing...</p>
                      <Progress value={progress} className="mt-2" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={processReceipt}
                  disabled={processing}
                  className="flex-1"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : 'Scan with AI'}
                </Button>
                <Button variant="outline" size="sm">
                  <Crop className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Extracted Data
                {result?.success && (
                  <Badge variant="secondary">
                    {Math.round((result.confidence || 0) * 100)}% confidence
                  </Badge>
                )}
              </CardTitle>
              {result?.success && (
                <CardDescription>
                  AI has extracted the following information. Review and edit as needed.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!result && !processing && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Scan with AI" to extract receipt data</p>
                </div>
              )}

              {result && !result.success && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.errors?.[0] || 'Failed to process receipt'}
                  </AlertDescription>
                </Alert>
              )}

              {result?.success && extractedData && (
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Vendor</Label>
                      <Input
                        value={extractedData.vendor || ''}
                        onChange={(e) => updateExtractedData('vendor', e.target.value)}
                        placeholder="Store or restaurant name"
                      />
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={extractedData.amount || ''}
                        onChange={(e) => updateExtractedData('amount', parseFloat(e.target.value))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={extractedData.date?.split('T')[0] || ''}
                        onChange={(e) => updateExtractedData('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={extractedData.category || ''}
                        onValueChange={(value) => updateExtractedData('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(extractedData.taxAmount || extractedData.tipAmount || extractedData.paymentMethod) && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium text-sm">Additional Details</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {extractedData.taxAmount && (
                          <div>
                            <span className="text-gray-600">Tax:</span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(extractedData.taxAmount)}
                            </span>
                          </div>
                        )}
                        {extractedData.tipAmount && (
                          <div>
                            <span className="text-gray-600">Tip:</span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(extractedData.tipAmount)}
                            </span>
                          </div>
                        )}
                        {extractedData.paymentMethod && (
                          <div>
                            <span className="text-gray-600">Payment:</span>
                            <span className="ml-2 font-medium">
                              {extractedData.paymentMethod}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  {extractedData.items && extractedData.items.length > 0 && (
                    <div>
                      <Label>Items ({extractedData.items.length})</Label>
                      <div className="max-h-40 overflow-y-auto border rounded-lg">
                        {extractedData.items.map((item, index) => (
                          <div key={index} className="p-2 border-b last:border-b-0 flex justify-between items-center">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.quantity > 1 && (
                                <span className="text-gray-500 ml-2">x{item.quantity}</span>
                              )}
                            </div>
                            <span className="font-medium">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Suggestions */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">AI Suggestions:</div>
                        <ul className="text-sm space-y-1">
                          {result.suggestions.map((suggestion, index) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={saveExpense} className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Expense
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditMode(!editMode)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="w-5 h-5" />
            AI Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Photo Quality</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Use good lighting</li>
                <li>• Keep receipt flat and straight</li>
                <li>• Avoid shadows and glare</li>
                <li>• Capture all text clearly</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">What AI Can Detect</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Store names and locations</li>
                <li>• Individual item prices</li>
                <li>• Tax and tip amounts</li>
                <li>• Payment methods</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}