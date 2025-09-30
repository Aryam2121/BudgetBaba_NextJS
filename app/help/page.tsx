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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Download,
  Play,
  FileText,
  Search,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Clock,
  CheckCircle2,
  Users,
  Lightbulb,
  Bug,
  Heart,
  Zap,
  Shield,
  CreditCard,
  Settings,
  PlusCircle,
  TrendingUp,
  Calculator
} from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
  tags: string[]
}

interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  steps: string[]
  videoUrl?: string
}

interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'pending' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  lastUpdate: Date
}

export default function HelpPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('faq')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  })
  const [tickets, setTickets] = useState<SupportTicket[]>([])

  const faqs: FAQ[] = [
    {
      id: 'faq-1',
      question: 'How do I add a new expense?',
      answer: 'You can add a new expense by clicking the "Add Expense" button on the dashboard or navigating to Expenses > New Expense. Fill in the required fields like amount, category, and description, then click Save.',
      category: 'expenses',
      helpful: 45,
      notHelpful: 2,
      tags: ['expense', 'add', 'create']
    },
    {
      id: 'faq-2',
      question: 'How do I split expenses with friends?',
      answer: 'Go to the Splits section and click "New Split". Add the total amount, select participants, and choose how to split the expense (equally, by amount, or by percentage). Participants will be notified via email.',
      category: 'splits',
      helpful: 38,
      notHelpful: 1,
      tags: ['split', 'share', 'friends', 'groups']
    },
    {
      id: 'faq-3',
      question: 'Can I export my expense data?',
      answer: 'Yes! Go to Reports and use the filtering options to customize your data, then click "Export Report" to download in PDF, CSV, or Excel format.',
      category: 'reports',
      helpful: 52,
      notHelpful: 0,
      tags: ['export', 'download', 'reports', 'data']
    },
    {
      id: 'faq-4',
      question: 'How do I set up budget limits?',
      answer: 'Navigate to Budget section, set your monthly budget, and configure category-specific limits. You\'ll receive alerts when approaching or exceeding these limits.',
      category: 'budget',
      helpful: 41,
      notHelpful: 3,
      tags: ['budget', 'limits', 'alerts', 'categories']
    },
    {
      id: 'faq-5',
      question: 'How do I manage expense categories?',
      answer: 'Go to Expenses > Categories to add, edit, or delete categories. You can also set budget limits and customize colors for better organization.',
      category: 'categories',
      helpful: 29,
      notHelpful: 1,
      tags: ['categories', 'organize', 'customize']
    },
    {
      id: 'faq-6',
      question: 'Can I upload expenses from a CSV file?',
      answer: 'Yes! Go to Expenses > Upload and select your CSV file. Make sure it follows our template format with columns for date, description, amount, and category.',
      category: 'expenses',
      helpful: 33,
      notHelpful: 5,
      tags: ['upload', 'csv', 'bulk', 'import']
    },
    {
      id: 'faq-7',
      question: 'How do I configure email notifications?',
      answer: 'Visit Email Settings to customize your notification preferences. You can enable/disable daily, weekly, or monthly summaries, and set alert thresholds.',
      category: 'settings',
      helpful: 27,
      notHelpful: 2,
      tags: ['email', 'notifications', 'alerts', 'settings']
    },
    {
      id: 'faq-8',
      question: 'Is my financial data secure?',
      answer: 'Yes! We use bank-level encryption, secure servers, and never store sensitive financial account information. All data is encrypted in transit and at rest.',
      category: 'security',
      helpful: 61,
      notHelpful: 0,
      tags: ['security', 'privacy', 'encryption', 'data']
    }
  ]

  const tutorials: Tutorial[] = [
    {
      id: 'tut-1',
      title: 'Getting Started with Budget Baba',
      description: 'Learn the basics of adding expenses, creating categories, and navigating the dashboard.',
      duration: '5 min',
      level: 'beginner',
      category: 'getting-started',
      steps: [
        'Sign up for your account',
        'Complete your profile setup',
        'Add your first expense',
        'Create custom categories',
        'Explore the dashboard features'
      ]
    },
    {
      id: 'tut-2',
      title: 'Setting Up Budget Tracking',
      description: 'Configure budgets, set category limits, and manage spending alerts.',
      duration: '8 min',
      level: 'beginner',
      category: 'budget',
      steps: [
        'Navigate to the Budget section',
        'Set your monthly budget limit',
        'Configure category-specific budgets',
        'Enable budget alert notifications',
        'Monitor your spending progress'
      ]
    },
    {
      id: 'tut-3',
      title: 'Splitting Expenses with Groups',
      description: 'Create groups, invite members, and manage shared expenses efficiently.',
      duration: '10 min',
      level: 'intermediate',
      category: 'splits',
      steps: [
        'Create a new expense group',
        'Invite members via email',
        'Add a shared expense',
        'Choose split method (equal/custom)',
        'Track settlements and balances'
      ]
    },
    {
      id: 'tut-4',
      title: 'Advanced Reporting and Analytics',
      description: 'Generate detailed reports, analyze spending patterns, and export data.',
      duration: '12 min',
      level: 'advanced',
      category: 'reports',
      steps: [
        'Access the Reports section',
        'Apply filters and date ranges',
        'Analyze spending trends',
        'Customize chart visualizations',
        'Export reports in multiple formats'
      ]
    },
    {
      id: 'tut-5',
      title: 'Bulk Import from CSV',
      description: 'Import large amounts of expense data from spreadsheets and banking exports.',
      duration: '6 min',
      level: 'intermediate',
      category: 'expenses',
      steps: [
        'Prepare your CSV file',
        'Navigate to Upload section',
        'Map columns to expense fields',
        'Review and validate data',
        'Complete the import process'
      ]
    }
  ]

  useEffect(() => {
    loadHelpData()
  }, [])

  const loadHelpData = async () => {
    try {
      setLoading(true)
      
      // Simulate loading support tickets
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTickets([
        {
          id: 'ticket-1',
          subject: 'Unable to upload CSV file',
          status: 'open',
          priority: 'medium',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          lastUpdate: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        {
          id: 'ticket-2',
          subject: 'Email notifications not working',
          status: 'pending',
          priority: 'high',
          createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
          lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ])
    } catch (error) {
      console.error('Error loading help data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = !searchQuery || 
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'expenses', 'budget', 'splits', 'reports', 'categories', 'settings', 'security', 'getting-started']

  const handleSubmitTicket = async () => {
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Simulate ticket submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        subject: supportForm.subject,
        status: 'open',
        priority: supportForm.priority as 'low' | 'medium' | 'high',
        createdAt: new Date(),
        lastUpdate: new Date()
      }
      
      setTickets(prev => [newTicket, ...prev])
      setSupportForm({ subject: '', category: '', priority: 'medium', message: '' })
      toast.success('Support ticket submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit support ticket')
    }
  }

  const handleFeedback = (faqId: string, helpful: boolean) => {
    // In a real app, this would update the FAQ feedback in the database
    toast.success(helpful ? 'Thank you for your feedback!' : 'We\'ll improve this answer')
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Help & Support</h1>
              <p className="text-slate-600 mt-1">
                Find answers, tutorials, and get support for your expense tracking needs
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <HelpCircle className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">FAQs</p>
                    <p className="text-2xl font-bold text-slate-800">{faqs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Tutorials</p>
                    <p className="text-2xl font-bold text-slate-800">{tutorials.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Open Tickets</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {tickets.filter(t => t.status === 'open').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Avg Response</p>
                    <p className="text-2xl font-bold text-slate-800">2h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search help articles, FAQs, and tutorials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="getting-started">Getting Started</SelectItem>
                    <SelectItem value="expenses">Expenses</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="splits">Splits</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                    <SelectItem value="categories">Categories</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/60 backdrop-blur-sm">
              <TabsTrigger value="faq">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="tutorials">
                <BookOpen className="h-4 w-4 mr-2" />
                Tutorials
              </TabsTrigger>
              <TabsTrigger value="support">
                <MessageCircle className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find quick answers to common questions ({filteredFAQs.length} results)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredFAQs.length > 0 ? (
                    <Accordion type="single" collapsible className="space-y-4">
                      {filteredFAQs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-start justify-between w-full mr-4">
                              <span className="text-left font-medium">{faq.question}</span>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge variant="secondary" className="text-xs">
                                  {faq.category}
                                </Badge>
                                <div className="flex items-center space-x-1 text-xs text-slate-500">
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>{faq.helpful}</span>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <p className="text-slate-700">{faq.answer}</p>
                              
                              <div className="flex items-center justify-between border-t pt-3">
                                <div className="flex flex-wrap gap-2">
                                  {faq.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-slate-500">Was this helpful?</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback(faq.id, true)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFeedback(faq.id, false)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">No results found</h3>
                      <p className="text-slate-500">Try adjusting your search terms or category filter</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tutorials" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {filteredTutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="bg-white/60 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {tutorial.description}
                          </CardDescription>
                        </div>
                        {tutorial.videoUrl && (
                          <Play className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-1 text-sm text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>{tutorial.duration}</span>
                        </div>
                        <Badge variant={
                          tutorial.level === 'beginner' ? 'default' :
                          tutorial.level === 'intermediate' ? 'secondary' : 'destructive'
                        } className="text-xs">
                          {tutorial.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {tutorial.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Steps:</h4>
                          <ul className="space-y-1">
                            {tutorial.steps.slice(0, 3).map((step, index) => (
                              <li key={index} className="text-sm text-slate-600 flex items-center">
                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2 shrink-0">
                                  {index + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                            {tutorial.steps.length > 3 && (
                              <li className="text-sm text-slate-500">
                                + {tutorial.steps.length - 3} more steps
                              </li>
                            )}
                          </ul>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          {tutorial.videoUrl && (
                            <Button size="sm" className="flex-1">
                              <Play className="h-4 w-4 mr-2" />
                              Watch Video
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            Read Guide
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredTutorials.length === 0 && (
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No tutorials found</h3>
                    <p className="text-slate-500">Try adjusting your search terms or category filter</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Submit New Ticket */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Submit Support Ticket</CardTitle>
                    <CardDescription>
                      Describe your issue and we'll help you resolve it
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={supportForm.category}
                          onValueChange={(value) => setSupportForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="billing">Billing Question</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="account">Account Issue</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={supportForm.priority}
                          onValueChange={(value) => setSupportForm(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger id="priority">
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={supportForm.message}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Describe your issue in detail..."
                        rows={6}
                      />
                    </div>
                    
                    <Button onClick={handleSubmitTicket} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Ticket
                    </Button>
                  </CardContent>
                </Card>

                {/* Your Tickets */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Your Support Tickets</CardTitle>
                    <CardDescription>
                      Track the status of your support requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tickets.length > 0 ? (
                      <div className="space-y-3">
                        {tickets.map((ticket) => (
                          <div key={ticket.id} className="p-3 border rounded-lg bg-slate-50">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{ticket.subject}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant={
                                  ticket.status === 'open' ? 'destructive' :
                                  ticket.status === 'pending' ? 'default' : 'secondary'
                                } className="text-xs">
                                  {ticket.status}
                                </Badge>
                                <Badge variant={
                                  ticket.priority === 'high' ? 'destructive' :
                                  ticket.priority === 'medium' ? 'default' : 'secondary'
                                } className="text-xs">
                                  {ticket.priority}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1">
                              <div>Created: {ticket.createdAt.toLocaleString()}</div>
                              <div>Last Update: {ticket.lastUpdate.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <MessageCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No support tickets yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Information */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                    <CardDescription>
                      Multiple ways to reach our support team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 text-blue-500 mt-1" />
                      <div>
                        <h3 className="font-semibold">Email Support</h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Get help via email, typically responds within 2 hours
                        </p>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          support@smartexpensetracker.com
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <MessageCircle className="h-6 w-6 text-green-500 mt-1" />
                      <div>
                        <h3 className="font-semibold">Live Chat</h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Chat with our support team in real-time
                        </p>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Start Live Chat
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-orange-500 mt-1" />
                      <div>
                        <h3 className="font-semibold">Phone Support</h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Call us for urgent issues (Mon-Fri 9AM-6PM EST)
                        </p>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          1-800-EXPENSE
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <ExternalLink className="h-6 w-6 text-purple-500 mt-1" />
                      <div>
                        <h3 className="font-semibold">Community Forum</h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Connect with other users and share tips
                        </p>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Forum
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Resources */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle>Quick Resources</CardTitle>
                    <CardDescription>
                      Helpful links and documentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <FileText className="h-5 w-5 mr-3 text-blue-500" />
                        <div className="text-left">
                          <div className="font-medium">User Guide</div>
                          <div className="text-xs text-slate-500">Complete documentation</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <Play className="h-5 w-5 mr-3 text-green-500" />
                        <div className="text-left">
                          <div className="font-medium">Video Tutorials</div>
                          <div className="text-xs text-slate-500">Step-by-step guides</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <Download className="h-5 w-5 mr-3 text-purple-500" />
                        <div className="text-left">
                          <div className="font-medium">CSV Templates</div>
                          <div className="text-xs text-slate-500">Import formats</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <Shield className="h-5 w-5 mr-3 text-orange-500" />
                        <div className="text-left">
                          <div className="font-medium">Security & Privacy</div>
                          <div className="text-xs text-slate-500">Data protection info</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <Lightbulb className="h-5 w-5 mr-3 text-yellow-500" />
                        <div className="text-left">
                          <div className="font-medium">Tips & Tricks</div>
                          <div className="text-xs text-slate-500">Best practices</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}