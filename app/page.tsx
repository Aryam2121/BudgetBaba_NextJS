"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart3, Shield, Zap, DollarSign, TrendingUp, Bell, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Expense Tracker
            </span>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="hover:bg-white/50">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ users</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Take Control of Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Financial Future
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            The smartest way to track expenses, manage budgets, and get AI-powered insights. 
            Make every rupee count with intelligent financial tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/register">
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Tracking Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-14 px-8 text-lg bg-white/70 backdrop-blur-sm border-2 hover:bg-white/90 transform hover:scale-105 transition-all duration-200"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Bank-grade Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>No Ads</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
            <CardHeader className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Smart AI Categorization</CardTitle>
              <CardDescription className="text-gray-600">
                Automatically categorize expenses with 95% accuracy using advanced AI
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                Our AI learns from your spending patterns to automatically categorize transactions, 
                saving you hours of manual work every month.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
            <CardHeader className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Predictive Budget Insights</CardTitle>
              <CardDescription className="text-gray-600">
                Get real-time alerts and predictions about your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                Stay ahead with intelligent budget monitoring, spending predictions, and 
                personalized recommendations to optimize your finances.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
            <CardHeader className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Smart Email Notifications</CardTitle>
              <CardDescription className="text-gray-600">
                Instant notifications with personalized financial insights
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                Get detailed email summaries with smart recommendations and insights 
                for every transaction to help you make better financial decisions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Financial Life?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who have already taken control of their finances
          </p>
          <Link href="/auth/register">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Get Started Now - It's Free!
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
