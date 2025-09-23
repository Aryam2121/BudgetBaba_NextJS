const Expense = require("../models/Expense")
const User = require("../models/User")
const mongoose = require("mongoose")

// Advanced expense analytics
const getExpenseAnalytics = async (req, res) => {
  try {
    const userId = req.user._id
    const { from, to, groupBy = 'month' } = req.query
    
    // Default to last 12 months if no date range provided
    const endDate = to ? new Date(to) : new Date()
    const startDate = from ? new Date(from) : new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1)

    // Build aggregation pipeline based on groupBy parameter
    let groupByStage = {}
    if (groupBy === 'day') {
      groupByStage = {
        year: { $year: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" }
      }
    } else if (groupBy === 'week') {
      groupByStage = {
        year: { $year: "$date" },
        week: { $week: "$date" }
      }
    } else if (groupBy === 'month') {
      groupByStage = {
        year: { $year: "$date" },
        month: { $month: "$date" }
      }
    } else if (groupBy === 'category') {
      groupByStage = "$category"
    }

    const analytics = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupByStage,
          totalAmount: { $sum: "$amount" },
          averageAmount: { $avg: "$amount" },
          count: { $sum: 1 },
          maxAmount: { $max: "$amount" },
          minAmount: { $min: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ])

    // Get total statistics
    const totalStats = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          avgTransactionAmount: { $avg: "$amount" }
        }
      }
    ])

    res.json({
      analytics,
      summary: totalStats[0] || { totalSpent: 0, totalTransactions: 0, avgTransactionAmount: 0 },
      dateRange: { from: startDate, to: endDate },
      groupBy
    })
  } catch (error) {
    console.error("Analytics error:", error)
    res.status(500).json({ error: "Failed to get expense analytics" })
  }
}

// Category breakdown and insights
const getCategoryAnalytics = async (req, res) => {
  try {
    const userId = req.user._id
    const { from, to } = req.query
    
    const endDate = to ? new Date(to) : new Date()
    const startDate = from ? new Date(from) : new Date(endDate.getFullYear(), endDate.getMonth(), 1)

    // Get category breakdown with percentage and trends
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          transactions: {
            $push: {
              amount: "$amount",
              date: "$date",
              vendor: "$vendor"
            }
          }
        }
      },
      { $sort: { totalAmount: -1 } }
    ])

    // Calculate total for percentage calculation
    const totalSpent = categoryBreakdown.reduce((sum, cat) => sum + cat.totalAmount, 0)

    // Add percentage to each category
    const categoriesWithPercentage = categoryBreakdown.map(cat => ({
      ...cat,
      percentage: totalSpent > 0 ? (cat.totalAmount / totalSpent) * 100 : 0
    }))

    // Get category trends (last 3 months comparison)
    const threeMonthsAgo = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1)
    const previousPeriod = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: threeMonthsAgo, $lt: startDate }
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      }
    ])

    // Calculate trends
    const categoryTrends = categoriesWithPercentage.map(current => {
      const previous = previousPeriod.find(p => p._id === current._id)
      const previousAmount = previous ? previous.totalAmount : 0
      const trend = previousAmount > 0 
        ? ((current.totalAmount - previousAmount) / previousAmount) * 100 
        : current.totalAmount > 0 ? 100 : 0

      return {
        ...current,
        trend,
        previousPeriodAmount: previousAmount
      }
    })

    res.json({
      categories: categoryTrends,
      totalSpent,
      dateRange: { from: startDate, to: endDate }
    })
  } catch (error) {
    console.error("Category analytics error:", error)
    res.status(500).json({ error: "Failed to get category analytics" })
  }
}

// Spending trends over time
const getSpendingTrends = async (req, res) => {
  try {
    const userId = req.user._id
    const { period = 'month', limit = 12 } = req.query

    let groupStage = {}
    let startDate = new Date()

    if (period === 'day') {
      startDate.setDate(startDate.getDate() - parseInt(limit))
      groupStage = {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" }
        }
      }
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - (parseInt(limit) * 7))
      groupStage = {
        _id: {
          year: { $year: "$date" },
          week: { $week: "$date" }
        }
      }
    } else {
      startDate.setMonth(startDate.getMonth() - parseInt(limit))
      groupStage = {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" }
        }
      }
    }

    const trends = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          ...groupStage,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          categories: { $addToSet: "$category" }
        }
      },
      { $sort: { "_id": 1 } }
    ])

    // Calculate moving averages
    const movingAverage = []
    const windowSize = Math.min(3, trends.length)
    
    for (let i = windowSize - 1; i < trends.length; i++) {
      const sum = trends.slice(i - windowSize + 1, i + 1)
        .reduce((acc, item) => acc + item.totalAmount, 0)
      movingAverage.push({
        period: trends[i]._id,
        movingAvg: sum / windowSize
      })
    }

    res.json({
      trends,
      movingAverage,
      period,
      totalPeriods: trends.length
    })
  } catch (error) {
    console.error("Spending trends error:", error)
    res.status(500).json({ error: "Failed to get spending trends" })
  }
}

// Period comparison analytics
const getExpenseComparison = async (req, res) => {
  try {
    const userId = req.user._id
    const { 
      currentStart, 
      currentEnd, 
      compareStart, 
      compareEnd 
    } = req.query

    if (!currentStart || !currentEnd || !compareStart || !compareEnd) {
      return res.status(400).json({ error: "All date parameters are required" })
    }

    const currentPeriod = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { 
            $gte: new Date(currentStart), 
            $lte: new Date(currentEnd) 
          }
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      }
    ])

    const comparePeriod = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { 
            $gte: new Date(compareStart), 
            $lte: new Date(compareEnd) 
          }
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      }
    ])

    // Calculate comparisons
    const allCategories = new Set([
      ...currentPeriod.map(c => c._id),
      ...comparePeriod.map(c => c._id)
    ])

    const comparison = Array.from(allCategories).map(category => {
      const current = currentPeriod.find(c => c._id === category) || 
        { totalAmount: 0, count: 0, avgAmount: 0 }
      const compare = comparePeriod.find(c => c._id === category) || 
        { totalAmount: 0, count: 0, avgAmount: 0 }

      const amountChange = compare.totalAmount > 0 
        ? ((current.totalAmount - compare.totalAmount) / compare.totalAmount) * 100 
        : current.totalAmount > 0 ? 100 : 0

      const countChange = compare.count > 0 
        ? ((current.count - compare.count) / compare.count) * 100 
        : current.count > 0 ? 100 : 0

      return {
        category,
        current: current.totalAmount,
        previous: compare.totalAmount,
        amountChange,
        countChange,
        currentCount: current.count,
        previousCount: compare.count
      }
    })

    const totals = {
      currentTotal: currentPeriod.reduce((sum, c) => sum + c.totalAmount, 0),
      compareTotal: comparePeriod.reduce((sum, c) => sum + c.totalAmount, 0)
    }

    totals.totalChange = totals.compareTotal > 0 
      ? ((totals.currentTotal - totals.compareTotal) / totals.compareTotal) * 100 
      : totals.currentTotal > 0 ? 100 : 0

    res.json({
      comparison: comparison.sort((a, b) => b.current - a.current),
      totals
    })
  } catch (error) {
    console.error("Expense comparison error:", error)
    res.status(500).json({ error: "Failed to get expense comparison" })
  }
}

// Top vendors analysis
const getTopVendors = async (req, res) => {
  try {
    const userId = req.user._id
    const { from, to, limit = 10 } = req.query
    
    const endDate = to ? new Date(to) : new Date()
    const startDate = from ? new Date(from) : new Date(endDate.getFullYear(), endDate.getMonth(), 1)

    const topVendors = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate },
          vendor: { $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$vendor",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          category: { $first: "$category" },
          lastTransaction: { $max: "$date" },
          transactions: {
            $push: {
              amount: "$amount",
              date: "$date",
              category: "$category"
            }
          }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: parseInt(limit) }
    ])

    // Get frequency analysis
    const frequencyAnalysis = topVendors.map(vendor => ({
      ...vendor,
      frequency: vendor.count / 
        Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30))), // transactions per month
      loyaltyScore: vendor.count * vendor.avgAmount // simple loyalty metric
    }))

    res.json({
      topVendors: frequencyAnalysis,
      dateRange: { from: startDate, to: endDate }
    })
  } catch (error) {
    console.error("Top vendors error:", error)
    res.status(500).json({ error: "Failed to get top vendors" })
  }
}

// Spending patterns analysis
const getSpendingPatterns = async (req, res) => {
  try {
    const userId = req.user._id
    const { from, to } = req.query
    
    const endDate = to ? new Date(to) : new Date()
    const startDate = from ? new Date(from) : new Date(endDate.getFullYear() - 1, endDate.getMonth(), 1)

    // Day of week patterns
    const dayOfWeekPattern = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ])

    // Hour of day patterns (for recent transactions)
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    
    const hourPattern = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: last30Days },
          createdAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ])

    // Monthly spending patterns
    const monthlyPattern = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ])

    // Category patterns by day of week
    const categoryDayPattern = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            category: "$category",
            dayOfWeek: { $dayOfWeek: "$date" }
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.category": 1, "_id.dayOfWeek": 1 } }
    ])

    res.json({
      dayOfWeekPattern,
      hourPattern,
      monthlyPattern,
      categoryDayPattern,
      dateRange: { from: startDate, to: endDate }
    })
  } catch (error) {
    console.error("Spending patterns error:", error)
    res.status(500).json({ error: "Failed to get spending patterns" })
  }
}

// Budget analytics
const getBudgetAnalytics = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)
    const monthlyBudget = user.monthlyBudget || 0

    if (monthlyBudget === 0) {
      return res.json({
        message: "No budget set",
        budgetSet: false
      })
    }

    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Current month spending
    const currentSpending = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ])

    const totalSpent = currentSpending.reduce((sum, cat) => sum + cat.totalAmount, 0)
    const budgetUtilization = (totalSpent / monthlyBudget) * 100

    // Calculate daily burn rate
    const daysElapsed = now.getDate()
    const dailyBurnRate = totalSpent / daysElapsed
    
    // Days remaining in month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInMonth - daysElapsed

    // Projected monthly spending
    const projectedSpending = dailyBurnRate * daysInMonth

    // Budget health score (0-100)
    const budgetHealthScore = Math.max(0, 100 - budgetUtilization)

    // Historical budget performance (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    const historicalPerformance = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: sixMonthsAgo, $lt: currentMonth }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalSpent: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])

    const budgetPerformance = historicalPerformance.map(month => ({
      ...month,
      budgetUtilization: (month.totalSpent / monthlyBudget) * 100,
      overBudget: month.totalSpent > monthlyBudget
    }))

    res.json({
      budgetSet: true,
      monthlyBudget,
      totalSpent,
      remaining: monthlyBudget - totalSpent,
      budgetUtilization,
      dailyBurnRate,
      daysRemaining,
      projectedSpending,
      budgetHealthScore,
      categoryBreakdown: currentSpending,
      historicalPerformance: budgetPerformance,
      alerts: {
        overBudget: totalSpent > monthlyBudget,
        nearLimit: budgetUtilization > 90,
        onTrack: budgetUtilization <= 80
      }
    })
  } catch (error) {
    console.error("Budget analytics error:", error)
    res.status(500).json({ error: "Failed to get budget analytics" })
  }
}

// AI-powered spending insights
const getExpenseInsights = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get current and previous month data
    const [currentMonthData, previousMonthData] = await Promise.all([
      Expense.find({
        userId: userId,
        date: { $gte: currentMonth }
      }).sort({ date: -1 }),
      
      Expense.find({
        userId: userId,
        date: { $gte: lastMonth, $lte: lastMonthEnd }
      })
    ])

    const insights = []

    // Spending velocity insight
    const daysElapsed = now.getDate()
    const currentSpent = currentMonthData.reduce((sum, exp) => sum + exp.amount, 0)
    const dailyRate = currentSpent / daysElapsed
    const projectedMonthly = dailyRate * 30

    if (user.monthlyBudget && projectedMonthly > user.monthlyBudget * 1.1) {
      insights.push({
        type: 'warning',
        category: 'budget',
        title: 'Budget Alert',
        message: `At current spending rate, you'll exceed your budget by ₹${(projectedMonthly - user.monthlyBudget).toFixed(0)}`,
        impact: 'high',
        actionable: true,
        suggestions: ['Review recent large expenses', 'Set daily spending limits', 'Pause non-essential purchases']
      })
    }

    // Unusual spending patterns
    const currentAvgTransaction = currentMonthData.length > 0 
      ? currentSpent / currentMonthData.length : 0
    const previousAvgTransaction = previousMonthData.length > 0 
      ? previousMonthData.reduce((sum, exp) => sum + exp.amount, 0) / previousMonthData.length : 0

    if (currentAvgTransaction > previousAvgTransaction * 1.5) {
      insights.push({
        type: 'info',
        category: 'pattern',
        title: 'Higher Transaction Amounts',
        message: `Your average transaction amount increased by ${(((currentAvgTransaction - previousAvgTransaction) / previousAvgTransaction) * 100).toFixed(0)}%`,
        impact: 'medium',
        actionable: true,
        suggestions: ['Review large purchases', 'Check for any recurring subscription increases']
      })
    }

    // Category insights
    const currentCategoryTotals = currentMonthData.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})

    const previousCategoryTotals = previousMonthData.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})

    Object.keys(currentCategoryTotals).forEach(category => {
      const current = currentCategoryTotals[category]
      const previous = previousCategoryTotals[category] || 0
      
      if (previous > 0 && current > previous * 2) {
        insights.push({
          type: 'warning',
          category: 'spending',
          title: `${category} Spending Doubled`,
          message: `Your ${category.toLowerCase()} spending increased from ₹${previous.toFixed(0)} to ₹${current.toFixed(0)}`,
          impact: 'high',
          actionable: true,
          suggestions: [`Review ${category.toLowerCase()} expenses`, 'Look for any one-time purchases', 'Consider setting category budgets']
        })
      }
    })

    // Saving opportunities
    const topCategories = Object.entries(currentCategoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    if (topCategories.length > 0) {
      const [topCategory, topAmount] = topCategories[0]
      insights.push({
        type: 'tip',
        category: 'optimization',
        title: 'Savings Opportunity',
        message: `${topCategory} is your highest expense category at ₹${topAmount.toFixed(0)}`,
        impact: 'medium',
        actionable: true,
        suggestions: [
          `Look for discounts in ${topCategory.toLowerCase()}`,
          'Compare prices before purchasing',
          'Consider alternatives or substitutes'
        ]
      })
    }

    // Frequency insights
    const recentVendors = currentMonthData
      .filter(exp => exp.vendor)
      .reduce((acc, exp) => {
        acc[exp.vendor] = (acc[exp.vendor] || 0) + 1
        return acc
      }, {})

    const frequentVendor = Object.entries(recentVendors)
      .sort(([,a], [,b]) => b - a)[0]

    if (frequentVendor && frequentVendor[1] > 5) {
      insights.push({
        type: 'info',
        category: 'habit',
        title: 'Frequent Spending',
        message: `You've made ${frequentVendor[1]} transactions at ${frequentVendor[0]} this month`,
        impact: 'low',
        actionable: false,
        suggestions: []
      })
    }

    // Positive insights
    if (user.monthlyBudget && currentSpent < user.monthlyBudget * 0.6 && daysElapsed > 15) {
      insights.push({
        type: 'positive',
        category: 'achievement',
        title: 'Great Budget Control',
        message: `You're staying well within your budget with ${((currentSpent / user.monthlyBudget) * 100).toFixed(0)}% usage`,
        impact: 'positive',
        actionable: false,
        suggestions: ['Consider increasing your savings', 'Maybe treat yourself within reason']
      })
    }

    res.json({
      insights,
      generatedAt: new Date(),
      dataPoints: {
        currentMonthTransactions: currentMonthData.length,
        previousMonthTransactions: previousMonthData.length,
        categoriesTracked: Object.keys(currentCategoryTotals).length
      }
    })
  } catch (error) {
    console.error("Expense insights error:", error)
    res.status(500).json({ error: "Failed to generate insights" })
  }
}

module.exports = {
  getExpenseAnalytics,
  getCategoryAnalytics,
  getSpendingTrends,
  getExpenseComparison,
  getTopVendors,
  getSpendingPatterns,
  getBudgetAnalytics,
  getExpenseInsights
}