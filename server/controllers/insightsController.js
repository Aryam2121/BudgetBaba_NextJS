const Expense = require('../models/Expense')
const Budget = require('../models/Budget')
const RecurringTransaction = require('../models/RecurringTransaction')

// Get AI-powered spending insights
exports.getSpendingInsights = async (req, res) => {
  try {
    const userId = req.user.id
    const { timeRange = 30 } = req.query // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeRange)

    // Get expenses
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 })

    // Get budget
    const budget = await Budget.findOne({ userId })

    // Calculate insights
    const insights = {
      alerts: [],
      recommendations: [],
      anomalies: [],
      trends: []
    }

    // 1. Budget Alerts
    if (budget && budget.categories) {
      for (const categoryBudget of budget.categories) {
        const spent = categoryBudget.spentAmount
        const limit = categoryBudget.budgetAmount
        const percentage = (spent / limit) * 100

        if (percentage >= 100) {
          insights.alerts.push({
            type: 'critical',
            category: categoryBudget.category,
            message: `You've exceeded your ${categoryBudget.category} budget by ${(percentage - 100).toFixed(0)}%`,
            amount: spent - limit,
            severity: 'high'
          })
        } else if (percentage >= 80) {
          insights.alerts.push({
            type: 'warning',
            category: categoryBudget.category,
            message: `You've used ${percentage.toFixed(0)}% of your ${categoryBudget.category} budget`,
            amount: spent,
            severity: 'medium'
          })
        }
      }
    }

    // 2. Unusual Spending Detection
    const categorySpending = {}
    const categoryDays = {}

    expenses.forEach(expense => {
      if (!categorySpending[expense.category]) {
        categorySpending[expense.category] = []
      }
      categorySpending[expense.category].push(expense.amount)
      
      const day = expense.date.toISOString().split('T')[0]
      if (!categoryDays[expense.category]) {
        categoryDays[expense.category] = new Set()
      }
      categoryDays[expense.category].add(day)
    })

    // Detect anomalies
    Object.keys(categorySpending).forEach(category => {
      const amounts = categorySpending[category]
      if (amounts.length < 3) return

      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
      const max = Math.max(...amounts)

      // If max is 3x average, it's unusual
      if (max > avg * 3) {
        insights.anomalies.push({
          type: 'unusual_spending',
          category,
          message: `Unusual high spending detected in ${category}`,
          amount: max,
          average: avg,
          severity: 'medium'
        })
      }

      // Spending frequency check
      const daysCount = categoryDays[category].size
      const frequency = daysCount / timeRange
      if (frequency > 0.5) { // Spending more than half the days
        insights.anomalies.push({
          type: 'frequent_spending',
          category,
          message: `You're spending on ${category} very frequently (${daysCount} times in ${timeRange} days)`,
          frequency: daysCount,
          severity: 'low'
        })
      }
    })

    // 3. Smart Recommendations
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const dailyAverage = totalSpent / timeRange
    const projectedMonthly = dailyAverage * 30

    // Recommendation: Reduce top spending category
    const categoryTotals = {}
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
    })
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0]

    if (topCategory && topCategory[1] > totalSpent * 0.3) {
      insights.recommendations.push({
        type: 'reduce_spending',
        category: topCategory[0],
        message: `${topCategory[0]} is your highest expense (${((topCategory[1] / totalSpent) * 100).toFixed(0)}%). Consider reducing it by 20% to save ${(topCategory[1] * 0.2).toFixed(2)}`,
        potentialSavings: topCategory[1] * 0.2,
        priority: 'high'
      })
    }

    // Recommendation: Set up budget if not exists
    if (!budget) {
      insights.recommendations.push({
        type: 'setup_budget',
        message: 'Set up a monthly budget to better track your spending',
        priority: 'high'
      })
    }

    // Recommendation: Review subscriptions
    const recurringCount = await RecurringTransaction.countDocuments({
      userId,
      isActive: true,
      type: 'expense'
    })
    
    if (recurringCount > 5) {
      insights.recommendations.push({
        type: 'review_subscriptions',
        message: `You have ${recurringCount} active recurring expenses. Review and cancel unused subscriptions`,
        priority: 'medium'
      })
    }

    // 4. Spending Trends
    const weeklySpending = []
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - i * 7)

      const weekExpenses = expenses.filter(exp => 
        exp.date >= weekStart && exp.date < weekEnd
      )
      
      const weekTotal = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      weeklySpending.push({
        week: `Week ${4 - i}`,
        amount: weekTotal,
        count: weekExpenses.length
      })
    }

    // Trend analysis
    if (weeklySpending.length >= 2) {
      const lastWeek = weeklySpending[weeklySpending.length - 1].amount
      const prevWeek = weeklySpending[weeklySpending.length - 2].amount
      const change = ((lastWeek - prevWeek) / prevWeek) * 100

      if (Math.abs(change) > 20) {
        insights.trends.push({
          type: change > 0 ? 'increasing' : 'decreasing',
          message: `Your spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(0)}% compared to last week`,
          change: change,
          severity: change > 0 ? 'medium' : 'low'
        })
      }
    }

    // Summary stats
    const summary = {
      totalSpent,
      dailyAverage,
      projectedMonthly,
      transactionCount: expenses.length,
      topCategory: topCategory ? topCategory[0] : null,
      weeklySpending
    }

    res.json({
      success: true,
      insights,
      summary,
      timeRange
    })
  } catch (error) {
    console.error('Error getting spending insights:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Get budget recommendations
exports.getBudgetRecommendations = async (req, res) => {
  try {
    const userId = req.user.id

    // Get last 3 months of expenses
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const expenses = await Expense.find({
      userId,
      date: { $gte: threeMonthsAgo }
    })

    // Calculate category averages
    const categoryTotals = {}
    const monthlyData = {}

    expenses.forEach(exp => {
      const month = exp.date.toISOString().substring(0, 7)
      
      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = 0
      }
      categoryTotals[exp.category] += exp.amount

      if (!monthlyData[month]) {
        monthlyData[month] = {}
      }
      if (!monthlyData[month][exp.category]) {
        monthlyData[month][exp.category] = 0
      }
      monthlyData[month][exp.category] += exp.amount
    })

    const monthCount = Object.keys(monthlyData).length || 1
    const recommendations = []

    // Recommend budgets based on historical data
    Object.entries(categoryTotals).forEach(([category, total]) => {
      const average = total / monthCount
      const recommended = Math.ceil(average * 1.1) // Add 10% buffer

      recommendations.push({
        category,
        recommendedBudget: recommended,
        historicalAverage: average,
        reasoning: `Based on your last ${monthCount} month(s) average of ${average.toFixed(2)}`
      })
    })

    // Sort by amount (highest first)
    recommendations.sort((a, b) => b.recommendedBudget - a.recommendedBudget)

    res.json({
      success: true,
      recommendations,
      totalRecommendedBudget: recommendations.reduce((sum, r) => sum + r.recommendedBudget, 0),
      basedOnMonths: monthCount
    })
  } catch (error) {
    console.error('Error getting budget recommendations:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Get savings opportunities
exports.getSavingsOpportunities = async (req, res) => {
  try {
    const userId = req.user.id
    
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const expenses = await Expense.find({
      userId,
      date: { $gte: oneMonthAgo }
    })

    const opportunities = []

    // Analyze small frequent purchases
    const smallExpenses = expenses.filter(exp => exp.amount < 10)
    const smallTotal = smallExpenses.reduce((sum, exp) => sum + exp.amount, 0)

    if (smallExpenses.length > 20 && smallTotal > 100) {
      opportunities.push({
        type: 'small_purchases',
        title: 'Reduce Small Frequent Purchases',
        description: `You made ${smallExpenses.length} small purchases totaling ${smallTotal.toFixed(2)}. Reducing these by 30% could save you ${(smallTotal * 0.3).toFixed(2)}/month`,
        potentialSavings: smallTotal * 0.3,
        difficulty: 'easy'
      })
    }

    // Analyze weekend spending
    const weekendExpenses = expenses.filter(exp => {
      const day = exp.date.getDay()
      return day === 0 || day === 6
    })
    const weekendTotal = weekendExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    if (weekendTotal > totalSpent * 0.4) {
      opportunities.push({
        type: 'weekend_spending',
        title: 'Optimize Weekend Spending',
        description: `${((weekendTotal / totalSpent) * 100).toFixed(0)}% of your spending happens on weekends. Plan ahead to reduce impulse purchases`,
        potentialSavings: weekendTotal * 0.2,
        difficulty: 'medium'
      })
    }

    res.json({
      success: true,
      opportunities,
      totalPotentialSavings: opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0)
    })
  } catch (error) {
    console.error('Error getting savings opportunities:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
