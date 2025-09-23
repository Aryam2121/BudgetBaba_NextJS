const Budget = require("../models/Budget")
const Expense = require("../models/Expense")
const { createNotification } = require("./notificationController")

// Get user budgets
const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id
    const { 
      isActive = 'true',
      period,
      status,
      sort = '-startDate',
      page = 1,
      limit = 20
    } = req.query

    const filter = { userId }
    if (isActive !== 'all') filter.isActive = isActive === 'true'
    if (period) filter.period = period

    const skip = (parseInt(page) - 1) * parseInt(limit)

    let [budgets, total] = await Promise.all([
      Budget.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Budget.countDocuments(filter)
    ])

    // Filter by status if specified
    if (status) {
      budgets = budgets.filter(budget => budget.status === status)
      total = budgets.length
    }

    // Update spent amounts from expenses
    const budgetIds = budgets.map(b => b._id)
    const now = new Date()
    
    for (const budget of budgets) {
      if (budget.isCurrent()) {
        const expenses = await Expense.find({
          userId,
          date: { $gte: budget.startDate, $lte: budget.endDate }
        })

        // Reset category spent amounts
        budget.categories.forEach(cat => { cat.spentAmount = 0 })

        // Calculate spent amounts per category
        expenses.forEach(expense => {
          const categoryBudget = budget.getCategoryBudget(expense.category)
          if (categoryBudget) {
            categoryBudget.spentAmount += expense.amount
          }
        })

        await budget.save()
      }
    }

    res.json({
      budgets,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    })
  } catch (error) {
    console.error("Get budgets error:", error)
    res.status(500).json({ error: "Failed to get budgets" })
  }
}

// Get budget by ID
const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const budget = await Budget.findOne({ _id: id, userId })

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" })
    }

    // Update spent amounts if current budget
    if (budget.isCurrent()) {
      const expenses = await Expense.find({
        userId,
        date: { $gte: budget.startDate, $lte: budget.endDate }
      })

      // Reset and recalculate spent amounts
      budget.categories.forEach(cat => { cat.spentAmount = 0 })
      expenses.forEach(expense => {
        const categoryBudget = budget.getCategoryBudget(expense.category)
        if (categoryBudget) {
          categoryBudget.spentAmount += expense.amount
        }
      })

      await budget.save()
    }

    // Get category-wise expenses for detailed view
    const categoryExpenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: budget.startDate, $lte: budget.endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          expenses: { $push: { amount: "$amount", description: "$description", date: "$date" } }
        }
      }
    ])

    res.json({ 
      budget,
      categoryExpenses
    })
  } catch (error) {
    console.error("Get budget by ID error:", error)
    res.status(500).json({ error: "Failed to get budget" })
  }
}

// Create budget
const createBudget = async (req, res) => {
  try {
    const userId = req.user._id
    const {
      name,
      description,
      period,
      startDate,
      endDate,
      totalAmount,
      categories = [],
      alertSettings = { 
        enabled: true, 
        thresholds: [
          { percentage: 75, notified: false },
          { percentage: 90, notified: false },
          { percentage: 100, notified: false }
        ] 
      },
      autoRollover = false,
      tags = []
    } = req.body

    // Validation
    if (!name || !period || !startDate || !endDate || !totalAmount) {
      return res.status(400).json({ 
        error: "Name, period, start date, end date, and total amount are required" 
      })
    }

    if (parseFloat(totalAmount) <= 0) {
      return res.status(400).json({ error: "Total amount must be greater than 0" })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (end <= start) {
      return res.status(400).json({ error: "End date must be after start date" })
    }

    // Validate categories total doesn't exceed total budget
    const categoriesTotal = categories.reduce((sum, cat) => sum + parseFloat(cat.budgetAmount || 0), 0)
    if (categoriesTotal > parseFloat(totalAmount)) {
      return res.status(400).json({ 
        error: "Sum of category budgets cannot exceed total budget amount" 
      })
    }

    const budget = new Budget({
      userId,
      name: name.trim(),
      description: description?.trim(),
      period,
      startDate: start,
      endDate: end,
      totalAmount: parseFloat(totalAmount),
      categories: categories.map(cat => ({
        category: cat.category,
        budgetAmount: parseFloat(cat.budgetAmount),
        alertThreshold: Math.max(0, Math.min(100, cat.alertThreshold || 80))
      })),
      alertSettings,
      autoRollover,
      tags: tags.map(tag => tag.trim()).filter(tag => tag.length > 0)
    })

    await budget.save()

    // Send creation notification
    await createNotification(
      userId,
      'budget_created',
      'Budget Created',
      `New ${period} budget created: ${name} - ₹${totalAmount.toLocaleString()}`,
      { budgetId: budget._id }
    )

    res.status(201).json({ 
      message: "Budget created successfully", 
      budget 
    })
  } catch (error) {
    console.error("Create budget error:", error)
    res.status(500).json({ error: "Failed to create budget" })
  }
}

// Update budget
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const updates = req.body

    // Prevent updating userId
    delete updates.userId

    // Validate amounts if provided
    if (updates.totalAmount && parseFloat(updates.totalAmount) <= 0) {
      return res.status(400).json({ error: "Total amount must be greater than 0" })
    }

    if (updates.categories) {
      const categoriesTotal = updates.categories.reduce((sum, cat) => 
        sum + parseFloat(cat.budgetAmount || 0), 0
      )
      const totalAmount = updates.totalAmount || await Budget.findById(id).select('totalAmount')
      
      if (categoriesTotal > parseFloat(totalAmount.totalAmount || updates.totalAmount)) {
        return res.status(400).json({ 
          error: "Sum of category budgets cannot exceed total budget amount" 
        })
      }
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    )

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" })
    }

    res.json({ 
      message: "Budget updated successfully", 
      budget 
    })
  } catch (error) {
    console.error("Update budget error:", error)
    res.status(500).json({ error: "Failed to update budget" })
  }
}

// Delete budget
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const budget = await Budget.findOneAndDelete({ _id: id, userId })

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" })
    }

    res.json({ message: "Budget deleted successfully" })
  } catch (error) {
    console.error("Delete budget error:", error)
    res.status(500).json({ error: "Failed to delete budget" })
  }
}

// Get budget analytics
const getBudgetAnalytics = async (req, res) => {
  try {
    const userId = req.user._id
    const { period } = req.query

    const filter = { userId }
    if (period) filter.period = period

    const budgets = await Budget.find(filter)

    // Basic analytics
    const analytics = {
      totalBudgets: budgets.length,
      activeBudgets: budgets.filter(b => b.isActive).length,
      currentBudgets: budgets.filter(b => b.isCurrent()).length,
      expiredBudgets: budgets.filter(b => b.isExpired()).length
    }

    // Calculate total budgeted vs spent
    let totalBudgeted = 0
    let totalSpent = 0
    const statusCounts = { good: 0, warning: 0, critical: 0, exceeded: 0 }

    budgets.forEach(budget => {
      totalBudgeted += budget.totalAmount
      totalSpent += budget.totalSpent
      statusCounts[budget.status]++
    })

    // Budget performance by period
    const byPeriod = budgets.reduce((acc, budget) => {
      if (!acc[budget.period]) {
        acc[budget.period] = {
          count: 0,
          totalBudgeted: 0,
          totalSpent: 0,
          avgUtilization: 0
        }
      }
      
      acc[budget.period].count++
      acc[budget.period].totalBudgeted += budget.totalAmount
      acc[budget.period].totalSpent += budget.totalSpent
      
      return acc
    }, {})

    // Calculate average utilization for each period
    Object.keys(byPeriod).forEach(period => {
      const data = byPeriod[period]
      data.avgUtilization = data.totalBudgeted > 0 
        ? (data.totalSpent / data.totalBudgeted) * 100 
        : 0
    })

    // Category analysis across all budgets
    const categoryAnalysis = {}
    budgets.forEach(budget => {
      budget.categories.forEach(cat => {
        if (!categoryAnalysis[cat.category]) {
          categoryAnalysis[cat.category] = {
            totalBudgeted: 0,
            totalSpent: 0,
            occurrences: 0
          }
        }
        
        categoryAnalysis[cat.category].totalBudgeted += cat.budgetAmount
        categoryAnalysis[cat.category].totalSpent += cat.spentAmount
        categoryAnalysis[cat.category].occurrences++
      })
    })

    // Calculate utilization for each category
    Object.keys(categoryAnalysis).forEach(category => {
      const data = categoryAnalysis[category]
      data.utilizationPercentage = data.totalBudgeted > 0 
        ? (data.totalSpent / data.totalBudgeted) * 100 
        : 0
      data.avgBudgetAmount = data.occurrences > 0 
        ? data.totalBudgeted / data.occurrences 
        : 0
    })

    // Recent budget performance (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const recentBudgets = budgets.filter(b => 
      b.startDate >= sixMonthsAgo || b.endDate >= sixMonthsAgo
    )

    const monthlyTrends = {}
    recentBudgets.forEach(budget => {
      const monthKey = `${budget.startDate.getFullYear()}-${budget.startDate.getMonth() + 1}`
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = {
          budgeted: 0,
          spent: 0,
          count: 0
        }
      }
      
      monthlyTrends[monthKey].budgeted += budget.totalAmount
      monthlyTrends[monthKey].spent += budget.totalSpent
      monthlyTrends[monthKey].count++
    })

    // Insights
    const insights = []
    const overallUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
    
    if (overallUtilization > 95) {
      insights.push("You're utilizing most of your budget efficiently. Consider increasing budget amounts if needed.")
    } else if (overallUtilization < 60) {
      insights.push("You're consistently under budget. You might be able to optimize your budget allocations.")
    }
    
    if (statusCounts.exceeded > 0) {
      insights.push(`You have ${statusCounts.exceeded} budget(s) that exceeded their limits.`)
    }
    
    const mostOverspentCategory = Object.entries(categoryAnalysis)
      .filter(([_, data]) => data.utilizationPercentage > 100)
      .sort(([_, a], [__, b]) => b.utilizationPercentage - a.utilizationPercentage)[0]
      
    if (mostOverspentCategory) {
      insights.push(`${mostOverspentCategory[0]} is your most overspent category at ${mostOverspentCategory[1].utilizationPercentage.toFixed(1)}% utilization.`)
    }

    res.json({
      analytics: {
        ...analytics,
        totalBudgeted,
        totalSpent,
        overallUtilization,
        statusDistribution: statusCounts
      },
      byPeriod,
      categoryAnalysis,
      monthlyTrends,
      insights
    })
  } catch (error) {
    console.error("Budget analytics error:", error)
    res.status(500).json({ error: "Failed to get budget analytics" })
  }
}

// Check budget alerts
const checkBudgetAlerts = async (req, res) => {
  try {
    const userId = req.user._id

    // Get current active budgets
    const currentBudgets = await Budget.find({
      userId,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })

    const allAlerts = []

    for (const budget of currentBudgets) {
      // Update spent amounts first
      const expenses = await Expense.find({
        userId,
        date: { $gte: budget.startDate, $lte: budget.endDate }
      })

      budget.categories.forEach(cat => { cat.spentAmount = 0 })
      expenses.forEach(expense => {
        const categoryBudget = budget.getCategoryBudget(expense.category)
        if (categoryBudget) {
          categoryBudget.spentAmount += expense.amount
        }
      })

      // Check for alerts
      const budgetAlerts = budget.checkAlerts()
      
      budgetAlerts.forEach(alert => {
        allAlerts.push({
          budgetId: budget._id,
          budgetName: budget.name,
          ...alert
        })

        // Send notification for new alerts
        createNotification(
          userId,
          alert.type,
          alert.type === 'budget_threshold' ? 'Budget Alert' : 'Category Budget Alert',
          alert.message,
          { 
            budgetId: budget._id,
            category: alert.category 
          },
          { priority: alert.level === 'critical' ? 'high' : 'medium' }
        )
      })

      await budget.save()
    }

    res.json({
      alerts: allAlerts,
      summary: {
        total: allAlerts.length,
        critical: allAlerts.filter(a => a.level === 'critical').length,
        high: allAlerts.filter(a => a.level === 'high').length,
        medium: allAlerts.filter(a => a.level === 'medium').length
      }
    })
  } catch (error) {
    console.error("Check budget alerts error:", error)
    res.status(500).json({ error: "Failed to check budget alerts" })
  }
}

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAnalytics,
  checkBudgetAlerts
}