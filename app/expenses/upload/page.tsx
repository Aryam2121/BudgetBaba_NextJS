"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { 
  Loader2, 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  CloudUpload,
  Database,
  Download,
  FileSpreadsheet,
  AlertCircle,
  Zap,
  Clock,
  Users
} from "lucide-react"
import Link from "next/link"

export default function UploadExpensesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)

  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast({
          title: "Invalid File",
          description: "Please select a CSV file.",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = (file: File) => {
    setLoading(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          toast({
            title: "Invalid CSV",
            description: "CSV file must have at least a header and one data row.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
        const data = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim())
          const row: any = {}

          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })

          // Map common column names
          const expense = {
            amount: Number.parseFloat(row.amount || row.cost || row.price || "0"),
            date: row.date || row.transaction_date || new Date().toISOString().split("T")[0],
            vendor: row.vendor || row.store || row.merchant || "",
            note: row.note || row.description || row.details || "",
          }

          if (expense.amount > 0) {
            data.push(expense)
          }
        }

        setCsvData(data)
        setLoading(false)
      } catch (error) {
        toast({
          title: "Parse Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data",
        description: "Please select a valid CSV file with expense data.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const response = await api.uploadExpenses(csvData)

      if (response.error) {
        toast({
          title: "Upload Failed",
          description: response.error,
          variant: "destructive",
        })
        return
      }

      setUploadResult(response.data)
      toast({
        title: "Upload Complete!",
        description: `Successfully processed ${response.data?.processed || 0} expenses.`,
      })
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload expenses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  if (uploadResult) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-muted/40 py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-700 mb-2">Upload Complete!</h2>

                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <p className="text-green-700 font-medium">
                      Successfully processed: {uploadResult.processed} expenses
                    </p>
                    {uploadResult.errors > 0 && (
                      <p className="text-orange-600 mt-2">Errors encountered: {uploadResult.errors}</p>
                    )}
                  </div>

                  {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-orange-700 mb-2">Error Details:</h3>
                      <div className="text-left bg-orange-50 p-3 rounded max-h-40 overflow-y-auto">
                        {uploadResult.errorDetails.map((error: string, index: number) => (
                          <p key={index} className="text-sm text-orange-700 mb-1">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button onClick={() => router.push("/dashboard")} className="w-full">
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadResult(null)
                        setFile(null)
                        setCsvData([])
                      }}
                      className="w-full"
                    >
                      Upload Another File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Enhanced Header with gradient background */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 page-hero-glow rounded-2xl"></div>
          <div className="relative p-8 page-hero rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
                    <CloudUpload className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold page-title">
                      Upload Expenses
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      Import multiple expenses from CSV files with smart mapping
                    </p>
                  </div>
                </div>
                
                {/* Quick Info Cards */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Badge variant="outline" className="soft-badge-green px-3 py-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Badge>
                  <Badge variant="outline" className="soft-badge-blue px-3 py-1">
                    <Database className="h-4 w-4 mr-2" />
                    Smart Mapping
                  </Badge>
                  <Badge variant="outline" className="soft-badge-purple px-3 py-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Auto-categorization
                  </Badge>
                </div>
              </div>
              
              {/* Visual elements */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg transform rotate-12">
                  <FileSpreadsheet className="h-12 w-12 text-white" />
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl shadow-lg transform -rotate-6">
                  <Database className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Features */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="feature-tile feature-tile-blue border-0 shadow-none hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Save Time</h3>
              <p className="text-sm text-muted-foreground">Import hundreds of expenses in seconds</p>
            </CardContent>
          </Card>
          
          <Card className="feature-tile feature-tile-green border-0 shadow-none hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Smart Detection</h3>
              <p className="text-sm text-muted-foreground">Automatically detect column formats</p>
            </CardContent>
          </Card>
          
          <Card className="feature-tile feature-tile-purple border-0 shadow-none hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Team Ready</h3>
              <p className="text-sm text-muted-foreground">Support for multiple expense formats</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="dashboard-panel shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">CSV File Upload</CardTitle>
                  <CardDescription>Select your CSV file and preview before importing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CSV Format Guide */}
              <Alert className="tip-banner border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  <strong className="tip-banner-title">CSV Format:</strong> <span className="tip-banner-text">Your file should have columns for amount, date, vendor (optional), and
                  note (optional). Common column names like "cost", "price", "store", "merchant", "description" are
                  automatically recognized.</span>
                </AlertDescription>
              </Alert>

              {/* Sample CSV Download */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Download className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-800">Need a template?</h4>
                        <p className="text-sm text-blue-600">Download our sample CSV file to get started</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <Download className="h-4 w-4 mr-2" />
                      Sample CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Choose a CSV file or drag and drop it here</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                      disabled={loading || uploading}
                    />
                    <label htmlFor="csv-upload">
                      <Button variant="outline" disabled={loading || uploading} asChild>
                        <span className="cursor-pointer">
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Parsing...
                            </>
                          ) : (
                            "Select CSV File"
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {file && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Selected file:</strong> {file.name}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">Size: {(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
              </div>

              {/* Preview Data */}
              {csvData.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Preview ({csvData.length} expenses found)</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {csvData.slice(0, 5).map((expense, index) => (
                        <div key={index} className="bg-white p-3 rounded border text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <span>
                              <strong>Amount:</strong> ₹{expense.amount}
                            </span>
                            <span>
                              <strong>Date:</strong> {expense.date}
                            </span>
                            {expense.vendor && (
                              <span>
                                <strong>Vendor:</strong> {expense.vendor}
                              </span>
                            )}
                            {expense.note && (
                              <span>
                                <strong>Note:</strong> {expense.note}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {csvData.length > 5 && (
                        <p className="text-gray-500 text-center">... and {csvData.length - 5} more expenses</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        `Upload ${csvData.length} Expenses`
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null)
                        setCsvData([])
                      }}
                      disabled={uploading}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
